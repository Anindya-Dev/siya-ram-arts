import pytest
from app.services.invoice_service import InvoiceService


def test_gst_intra_state_split():
    """
    If customer state code is 08 (Rajasthan), GST (18%) is split 50/50:
    CGST (9%) + SGST (9%), IGST is 0.
    """
    subtotal = 50000  # ₹50,000
    cgst, sgst, igst = InvoiceService.calculate_gst(subtotal=subtotal, customer_state_code="08")

    assert cgst == 4500
    assert sgst == 4500
    assert igst == 0
    assert (cgst + sgst + igst) == 9000  # 18% of 50,000


def test_gst_inter_state_igst():
    """
    If customer state code is NOT 08 (e.g. 27 Maharashtra or 07 Delhi),
    IGST is the full 18%, CGST and SGST are 0.
    """
    subtotal = 50000  # ₹50,000
    cgst, sgst, igst = InvoiceService.calculate_gst(subtotal=subtotal, customer_state_code="27")

    assert cgst == 0
    assert sgst == 0
    assert igst == 9000


@pytest.mark.asyncio
async def test_sequential_invoice_numbering(db_session):
    """
    Verifies that generated invoice numbers are strictly sequential.
    """
    inv1 = await InvoiceService.get_next_invoice_number(db_session)
    inv2 = await InvoiceService.get_next_invoice_number(db_session)

    assert inv1.startswith("SRA/")
    assert inv2.startswith("SRA/")
    assert inv1 != inv2
    # Verify sequence increment
    num1 = int(inv1.split("/")[-1])
    num2 = int(inv2.split("/")[-1])
    assert num2 == num1 + 1
