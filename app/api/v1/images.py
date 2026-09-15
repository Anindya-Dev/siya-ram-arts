import os
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.core.errors import BusinessRuleViolationError
from app.core.security import require_staff_or_admin
from app.models.user import User
from app.schemas.image import ImageUploadResponse
from app.services.imagekit_service import ImageKitService

router = APIRouter(prefix="/images", tags=["Image & Media Management"])

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


@router.post("/upload", response_model=ImageUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(require_staff_or_admin),
):
    """
    Secure server-side image upload directly to ImageKit.io.
    Restricted to authenticated Staff and Admin users.
    Returns the public CDN URL and the ImageKit file_id needed for subsequent deletion.
    """
    if not ImageKitService.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ImageKit credentials are not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in environment.",
        )

    # Validate file presence and filename
    filename = file.filename or ""
    _, ext = os.path.splitext(filename)
    ext = ext.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise BusinessRuleViolationError(
            f"Invalid file type '{ext}'. Allowed image extensions are: {', '.join(sorted(ALLOWED_EXTENSIONS))}."
        )

    content_type = (file.content_type or "").lower()
    if content_type not in {"image/png", "image/jpeg", "image/webp"}:
        raise BusinessRuleViolationError(
            f"Invalid content type '{content_type}'. Only PNG, JPEG, and WebP images are allowed."
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise BusinessRuleViolationError("Uploaded image file is empty.")

    if len(file_bytes) > settings.MAX_IMAGE_UPLOAD_BYTES:
        max_mb = settings.MAX_IMAGE_UPLOAD_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image is too large. Maximum size is {max_mb} MB.",
        )

    # Generate a unique sanitized file name
    sanitized_base = os.path.splitext(os.path.basename(filename))[0]
    sanitized_slug = "".join(c if c.isalnum() or c in ("-", "_") else "-" for c in sanitized_base).strip("-")
    if not sanitized_slug:
        sanitized_slug = "idol"
    unique_file_name = f"{sanitized_slug}-{uuid.uuid4().hex[:8]}{ext}"

    try:
        result = ImageKitService.upload_file(
            file_bytes=file_bytes,
            file_name=unique_file_name,
            folder="idols",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to upload image to ImageKit: {str(e)}",
        )

    return ImageUploadResponse(
        url=result["url"],
        file_id=result["file_id"],
        name=result.get("name", unique_file_name),
        size=result.get("size", len(file_bytes)),
    )
