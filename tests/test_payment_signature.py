import hashlib
import hmac
import pytest
from app.core.errors import PaymentVerificationError
from app.services.payment_service import PaymentService


def test_payment_signature_verification_success(monkeypatch):
    """
    Verifies valid HMAC SHA256 signature succeeds.
    """
    secret = "rzp_secret_key_test_123"
    monkeypatch.setattr("app.core.config.settings.RAZORPAY_KEY_SECRET", secret)

    order_id = "order_123456"
    payment_id = "pay_987654"
    msg = f"{order_id}|{payment_id}".encode("utf-8")
    valid_signature = hmac.new(secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()

    # Should pass without exception
    verified = PaymentService.verify_payment_signature(
        razorpay_order_id=order_id,
        razorpay_payment_id=payment_id,
        razorpay_signature=valid_signature,
    )
    assert verified is True


def test_payment_signature_verification_fails_on_tamper(monkeypatch):
    """
    Verifies forged or mismatched signature raises PaymentVerificationError.
    """
    secret = "rzp_secret_key_test_123"
    monkeypatch.setattr("app.core.config.settings.RAZORPAY_KEY_SECRET", secret)

    order_id = "order_123456"
    payment_id = "pay_987654"
    forged_signature = "bad_signature_abc123"

    with pytest.raises(PaymentVerificationError):
        PaymentService.verify_payment_signature(
            razorpay_order_id=order_id,
            razorpay_payment_id=payment_id,
            razorpay_signature=forged_signature,
        )
