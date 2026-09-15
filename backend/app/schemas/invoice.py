import datetime
from typing import Optional
from app.models.order import PDFStatus
from app.schemas.common import BaseResponseSchema


class InvoiceRead(BaseResponseSchema):
    id: str
    order_id: str
    invoice_number: str
    gstin: str
    hsn_sac_code: str
    subtotal: int
    cgst_amount: int
    sgst_amount: int
    igst_amount: int
    total_amount: int
    pdf_url: Optional[str] = None
    pdf_status: PDFStatus = PDFStatus.PENDING
    issued_at: datetime.datetime


