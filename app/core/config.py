from typing import List, Set, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    PROJECT_NAME: str = "Siya Ram Arts API"
    APP_NAME: str = "Siya Ram Arts API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    ALLOW_TEST_AUTH_BYPASS: bool = False

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./siyaramarts.db"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://siyaramarts.com",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:3000"]

    # Clerk Authentication
    CLERK_SECRET_KEY: str = ""
    CLERK_JWKS_URL: str = "https://api.clerk.com/v1/jwks"
    CLERK_ISSUER: str = ""
    CLERK_WEBHOOK_SECRET: str = ""

    # Razorpay Payments
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # ImageKit.io
    IMAGEKIT_PUBLIC_KEY: str = ""
    IMAGEKIT_PRIVATE_KEY: str = ""
    IMAGEKIT_URL_ENDPOINT: str = "https://ik.imagekit.io/siyaramarts"

    # Invoicing & Legal
    GST_RATE: float = 0.18
    GSTIN: str = "08AABCS1429B1Z1"
    GST_STATE_CODE: str = "08"
    HSN_CODE: str = "97030000"
    COMPANY_NAME: str = "Siya Ram Arts Atelier"
    COMPANY_GSTIN: str = "08AABCS1429B1Z1"
    COMPANY_STATE_CODE: str = "08"  # Rajasthan State Code
    COMPANY_ADDRESS: str = "Plot 42, Shilpa Marg, Jaipur, Rajasthan 302029"
    DEFAULT_HSN_CODE: str = "97030000"  # Original sculptures and statuary in any material

    # Inventory & Reservations
    RESERVATION_EXPIRY_MINUTES: int = 15
    LOW_STOCK_DEFAULT_THRESHOLD: int = 2

    # ── Courier / Tracking ─────────────────────────────────────────────────
    # Shiprocket (recommended — covers DTDC, Delhivery, BlueDart, FedEx, DHL…)
    SHIPROCKET_EMAIL: str = ""
    SHIPROCKET_PASSWORD: str = ""

    # Direct courier API keys (only needed if NOT using Shiprocket)
    DELHIVERY_API_KEY: str = ""
    DTDC_API_KEY: str = ""
    BLUEDART_LICENSE_KEY: str = ""

    # ── Admin Access Control ────────────────────────────────────────────────
    # ONLY emails listed here can ever be admins — regardless of Clerk metadata.
    # You (the developer) are the only one who can edit this file on the server.
    # Format: comma-separated emails
    # Example: ADMIN_EMAILS=owner@siyaramarts.com,cytosnorthamericaff@gmail.com
    ADMIN_EMAILS: str = ""

    def get_admin_emails(self) -> Set[str]:
        """Returns the set of approved admin emails (lowercase, stripped)."""
        return {
            e.strip().lower()
            for e in self.ADMIN_EMAILS.split(",")
            if e.strip()
        }

    def is_admin_email(self, email: str) -> bool:
        """Returns True only if the email is in the approved admin whitelist."""
        if not email:
            return False
        return email.strip().lower() in self.get_admin_emails()


settings = Settings()
