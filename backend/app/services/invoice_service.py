import datetime
import os
from typing import Optional, Tuple
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.models.order import Invoice, Order, PDFStatus


class InvoiceService:
    @staticmethod
    async def get_next_invoice_number(db: AsyncSession) -> str:
        """
        Generates a gapless sequential invoice number for GST compliance (e.g. SRA/2026-27/00001).
        Uses a Postgres sequence when available, or a fallback sequence table for SQLite/local environments.
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        # Fiscal year calculation (Apr-Mar for India)
        current_year = now.year
        if now.month >= 4:
            fy_str = f"{current_year}-{(current_year + 1) % 100:02d}"
        else:
            fy_str = f"{current_year - 1}-{current_year % 100:02d}"

        seq_name = f"invoice_seq_{fy_str.replace('-', '_')}"

        try:
            # Check if Postgres
            bind = db.bind
            dialect_name = bind.dialect.name if bind else "postgresql"
            if dialect_name == "postgresql":
                await db.execute(text(f"CREATE SEQUENCE IF NOT EXISTS {seq_name} START 1"))
                result = await db.execute(text(f"SELECT nextval('{seq_name}')"))
                seq_val = result.scalar_one()
            else:
                # SQLite fallback sequence emulation
                await db.execute(
                    text("CREATE TABLE IF NOT EXISTS sra_sequences (name TEXT PRIMARY KEY, val INTEGER)")
                )
                await db.execute(
                    text(
                        "INSERT INTO sra_sequences (name, val) VALUES (:name, 1) "
                        "ON CONFLICT(name) DO UPDATE SET val = sra_sequences.val + 1"
                    ),
                    {"name": seq_name},
                )
                res = await db.execute(
                    text("SELECT val FROM sra_sequences WHERE name = :name"),
                    {"name": seq_name},
                )
                seq_val = res.scalar_one()
        except Exception as e:
            logger.warning(f"Sequence generator error ({e}), falling back to timestamp suffix")
            seq_val = int(now.timestamp()) % 100000

        invoice_no = f"SRA/{fy_str}/{seq_val:05d}"
        return invoice_no

    @staticmethod
    def calculate_gst(
        subtotal: int, customer_state_code: str, gst_rate: Optional[float] = None
    ) -> Tuple[int, int, int]:
        """
        Calculates GST components:
        - If intra-state (Rajasthan, code '08'): CGST (half) + SGST (half)
        - If inter-state: IGST (full)
        Returns: (cgst_amount, sgst_amount, igst_amount) in INR
        """
        rate = gst_rate if gst_rate is not None else settings.GST_RATE  # e.g. 0.18
        is_intra_state = (customer_state_code or "").strip() == settings.GST_STATE_CODE

        if is_intra_state:
            half_rate = rate / 2.0
            cgst = round(subtotal * half_rate)
            sgst = round(subtotal * half_rate)
            igst = 0
        else:
            cgst = 0
            sgst = 0
            igst = round(subtotal * rate)

        return cgst, sgst, igst

    @staticmethod
    async def create_invoice_for_order(db: AsyncSession, order: Order) -> Invoice:
        """
        Creates a sequential, GST-compliant tax invoice record and generates the PDF.
        """
        shipping_snapshot = order.shipping_address_snapshot or {}
        customer_state_code = str(shipping_snapshot.get("state_code", "08"))

        cgst, sgst, igst = InvoiceService.calculate_gst(
            subtotal=order.subtotal, customer_state_code=customer_state_code
        )

        invoice_number = await InvoiceService.get_next_invoice_number(db)

        invoice = Invoice(
            order_id=order.id,
            invoice_number=invoice_number,
            gstin=settings.GSTIN,
            hsn_sac_code=settings.HSN_CODE,
            subtotal=order.subtotal,
            cgst_amount=cgst,
            sgst_amount=sgst,
            igst_amount=igst,
            total_amount=order.total_amount,
            pdf_status=PDFStatus.PENDING,
            pdf_url=None,
        )
        db.add(invoice)
        await db.flush()

        # Generate PDF file (updates invoice.pdf_status and invoice.pdf_url)
        await InvoiceService.generate_invoice_pdf(invoice, order)
        await db.flush()

        logger.info(
            f"Created GST Tax Invoice {invoice_number} (status={invoice.pdf_status.value}) for Order {order.order_number}"
        )
        return invoice


    @staticmethod
    async def generate_invoice_pdf(invoice: Invoice, order: Order) -> Optional[str]:
        """
        Renders HTML invoice with inline styling and compiles to PDF via WeasyPrint.
        Updates invoice.pdf_status and invoice.pdf_url on the given invoice object.
        """
        try:
            shipping_addr = order.shipping_address_snapshot or {}
            customer_state_code = str(shipping_addr.get("state_code", "08"))
            items_html = ""
            for item in order.items:
                variant_data = item.variant_snapshot or {}
                item_name = variant_data.get("name", "Handcrafted Idol Murti (Chemical Resin)")
                size = variant_data.get("size", "")
                items_html += f"""
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                        <strong>{item_name}</strong><br>
                        <span style="font-size: 11px; color: #64748b;">Size: {size} | HSN: {invoice.hsn_sac_code}</span>
                    </td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e2e8f0;">{item.quantity}</td>
                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">₹{item.unit_price:,}</td>
                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">₹{item.subtotal:,}</td>
                </tr>
                """

            tax_rows = ""
            if invoice.igst_amount > 0:
                tax_rows += f"""
                <tr>
                    <td colspan="3" style="text-align: right; padding: 6px 10px;">IGST (18%):</td>
                    <td style="text-align: right; padding: 6px 10px; font-weight: 600;">₹{invoice.igst_amount:,}</td>
                </tr>
                """
            else:
                tax_rows += f"""
                <tr>
                    <td colspan="3" style="text-align: right; padding: 6px 10px;">CGST (9%):</td>
                    <td style="text-align: right; padding: 6px 10px; font-weight: 600;">₹{invoice.cgst_amount:,}</td>
                </tr>
                <tr>
                    <td colspan="3" style="text-align: right; padding: 6px 10px;">SGST (9%):</td>
                    <td style="text-align: right; padding: 6px 10px; font-weight: 600;">₹{invoice.sgst_amount:,}</td>
                </tr>
                """

            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Tax Invoice {invoice.invoice_number}</title>
                <style>
                    @page {{
                        size: A4;
                        margin: 20mm;
                    }}
                    body {{
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        color: #1e293b;
                        font-size: 13px;
                        line-height: 1.5;
                    }}
                    .header-table {{
                        width: 100%;
                        border-bottom: 2px solid #b45309;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                    }}
                    .brand-title {{
                        font-size: 24px;
                        font-weight: 700;
                        color: #78350f;
                        letter-spacing: 0.5px;
                    }}
                    .tagline {{
                        font-size: 11px;
                        color: #92400e;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }}
                    .badge-invoice {{
                        background: #fef3c7;
                        color: #92400e;
                        font-weight: bold;
                        padding: 6px 12px;
                        border-radius: 4px;
                        border: 1px solid #fcd34d;
                        display: inline-block;
                    }}
                    .info-grid {{
                        width: 100%;
                        margin-bottom: 20px;
                    }}
                    .items-table {{
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }}
                    .items-table th {{
                        background: #f8fafc;
                        border-bottom: 2px solid #cbd5e1;
                        padding: 10px;
                        text-align: left;
                        font-weight: 600;
                        color: #475569;
                    }}
                </style>
            </head>
            <body>
                <table class="header-table">
                    <tr>
                        <td>
                            <div class="brand-title">SIYA RAM ARTS</div>
                            <div class="tagline">Sacred Artisanal Sculptures & Murtis</div>
                            <div style="font-size: 11px; color: #64748b; margin-top: 5px;">
                                Jaipur Atelier | Registered Office: Johari Bazaar, Jaipur, Rajasthan 302003<br>
                                <strong>GSTIN:</strong> {invoice.gstin} | <strong>State Code:</strong> {settings.GST_STATE_CODE} (Rajasthan)
                            </div>
                        </td>
                        <td style="text-align: right; vertical-align: top;">
                            <div class="badge-invoice">TAX INVOICE</div>
                            <div style="margin-top: 8px; font-weight: bold; font-size: 14px;">{invoice.invoice_number}</div>
                            <div style="font-size: 11px; color: #64748b;">Date: {datetime.datetime.now().strftime('%d-%b-%Y')}</div>
                            <div style="font-size: 11px; color: #64748b;">Order Ref: {order.order_number}</div>
                        </td>
                    </tr>
                </table>

                <table class="info-grid">
                    <tr>
                        <td style="width: 50%; vertical-align: top;">
                            <strong style="color: #475569; font-size: 11px; text-transform: uppercase;">Billed & Shipped To:</strong>
                            <div style="font-weight: bold; margin-top: 4px;">{shipping_addr.get('full_name', 'Valued Patron')}</div>
                            <div style="color: #475569; font-size: 12px;">
                                {shipping_addr.get('address_line1', '')}<br>
                                {shipping_addr.get('address_line2', '') + '<br>' if shipping_addr.get('address_line2') else ''}
                                {shipping_addr.get('city', '')}, {shipping_addr.get('state', '')} - {shipping_addr.get('postal_code', '')}<br>
                                Phone: {shipping_addr.get('phone', '')}<br>
                                Place of Supply: State Code {customer_state_code}
                            </div>
                        </td>
                        <td style="width: 50%; vertical-align: top; text-align: right;">
                            <strong style="color: #475569; font-size: 11px; text-transform: uppercase;">Payment Details:</strong>
                            <div style="margin-top: 4px; font-size: 12px;">
                                Method: <strong>Razorpay Secured Gateway</strong><br>
                                Transaction ID: {order.razorpay_payment_id or 'Online Paid'}<br>
                                Payment Status: <span style="color: #15803d; font-weight: bold;">PAID</span>
                            </div>
                        </td>
                    </tr>
                </table>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 50%;">Description of Sacred Artifacts</th>
                            <th style="text-align: center; width: 10%;">Qty</th>
                            <th style="text-align: right; width: 20%;">Rate (INR)</th>
                            <th style="text-align: right; width: 20%;">Amount (INR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                        <tr>
                            <td colspan="3" style="text-align: right; padding: 8px 10px; font-weight: 600;">Subtotal:</td>
                            <td style="text-align: right; padding: 8px 10px; font-weight: 600;">₹{invoice.subtotal:,}</td>
                        </tr>
                        {tax_rows}
                        <tr>
                            <td colspan="3" style="text-align: right; padding: 8px 10px; font-weight: 600;">Art Freight Shipping:</td>
                            <td style="text-align: right; padding: 8px 10px; font-weight: 600;">{"₹0 (Complimentary)" if order.shipping_fee == 0 else f"₹{order.shipping_fee:,}"}</td>
                        </tr>
                        <tr style="background: #f8fafc; font-size: 15px;">
                            <td colspan="3" style="text-align: right; padding: 12px 10px; font-weight: 700; color: #78350f; border-top: 2px solid #b45309;">
                                Total Amount (INR):
                            </td>
                            <td style="text-align: right; padding: 12px 10px; font-weight: 700; color: #78350f; border-top: 2px solid #b45309;">
                                ₹{invoice.total_amount:,}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #64748b;">
                    <strong>Declaration:</strong> Certified that all particulars are true and correct. Sacred idols are non-perishable artisanal creations sculpted in high-grade chemical resin and composite stone with durable weather-resistant finishes. This is a computer-generated tax invoice.
                </div>
            </body>
            </html>
            """

            # Output directory for invoices
            invoices_dir = os.path.join(os.getcwd(), "static", "invoices")
            os.makedirs(invoices_dir, exist_ok=True)
            filename = f"{invoice.invoice_number.replace('/', '_')}.pdf"
            output_path = os.path.join(invoices_dir, filename)

            import weasyprint
            weasyprint.HTML(string=html_content).write_pdf(output_path)
            relative_url = f"/static/invoices/{filename}"
            invoice.pdf_status = PDFStatus.GENERATED
            invoice.pdf_url = relative_url
            return relative_url
        except Exception as e:
            logger.error(
                f"Failed to compile PDF invoice via WeasyPrint for Invoice {invoice.invoice_number}: {e}",
                exc_info=True,
            )
            invoice.pdf_status = PDFStatus.FAILED
            invoice.pdf_url = None
            return None

