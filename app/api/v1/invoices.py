import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.errors import AuthorizationError, ResourceNotFoundError
from app.core.security import get_current_user, require_staff_or_admin
from app.models.order import Invoice, Order, PDFStatus
from app.models.user import User, UserRole
from app.schemas.invoice import InvoiceRead
from app.services.invoice_service import InvoiceService

router = APIRouter(prefix="/invoices", tags=["GST Invoices"])


@router.get("/{order_id}", response_model=InvoiceRead)
async def get_invoice(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves GST tax invoice details for a paid order.
    """
    stmt = (
        select(Invoice)
        .options(selectinload(Invoice.order))
        .where(Invoice.order_id == order_id)
    )
    result = await db.execute(stmt)
    invoice = result.scalar_one_or_none()

    if not invoice:
        raise ResourceNotFoundError("Invoice for order", order_id)

    if current_user.role == UserRole.CUSTOMER and invoice.order.user_id != current_user.id:
        raise AuthorizationError("Access denied to this tax invoice")

    return InvoiceRead.model_validate(invoice)


@router.get("/{order_id}/pdf")
async def download_invoice_pdf(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Downloads the official GST-compliant PDF invoice generated via WeasyPrint.
    """
    stmt = (
        select(Invoice)
        .options(selectinload(Invoice.order))
        .where(Invoice.order_id == order_id)
    )
    result = await db.execute(stmt)
    invoice = result.scalar_one_or_none()

    if not invoice:
        raise ResourceNotFoundError("Invoice for order", order_id)

    if current_user.role == UserRole.CUSTOMER and invoice.order.user_id != current_user.id:
        raise AuthorizationError("Access denied to this tax invoice")

    if invoice.pdf_status == PDFStatus.FAILED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Invoice PDF generation failed. Please contact support or request regeneration.",
        )
    if invoice.pdf_status == PDFStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Invoice PDF is not yet available, please try again shortly.",
        )

    clean_invoice_no = invoice.invoice_number.replace('/', '_')
    filename = f"{clean_invoice_no}.pdf"
    file_path = os.path.join(os.getcwd(), "static", "invoices", filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Invoice PDF file is currently unavailable.",
        )

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=f"Tax_Invoice_{clean_invoice_no}.pdf",
    )


@router.post("/{order_id}/regenerate", response_model=InvoiceRead)
async def regenerate_invoice_pdf(
    order_id: str,
    current_user: User = Depends(require_staff_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Admin/Staff endpoint to manually re-attempt PDF generation for an invoice.
    """
    stmt = (
        select(Invoice)
        .options(selectinload(Invoice.order).selectinload(Order.items))
        .where(Invoice.order_id == order_id)
    )
    result = await db.execute(stmt)
    invoice = result.scalar_one_or_none()

    if not invoice:
        raise ResourceNotFoundError("Invoice for order", order_id)

    await InvoiceService.generate_invoice_pdf(invoice, invoice.order)
    await db.commit()
    await db.refresh(invoice)

    return InvoiceRead.model_validate(invoice)

