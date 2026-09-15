from typing import Any, Dict, Optional
from app.core.config import settings
from app.core.logging import logger

try:
    from imagekitio import ImageKit
except ImportError:
    ImageKit = None


class ImageKitService:
    """
    ImageKit.io transformation and responsive image delivery service.
    Constructs optimized WebP/AVIF endpoints with on-the-fly resizing, quality compression,
    and low-quality placeholder blurs (LQIP) for devotional imagery.
    Also handles secure server-side upload and deletion lifecycles.
    """

    @classmethod
    def is_configured(cls) -> bool:
        """
        Returns True only if all required ImageKit credentials are present.
        """
        return bool(
            settings.IMAGEKIT_PRIVATE_KEY
            and settings.IMAGEKIT_PUBLIC_KEY
            and settings.IMAGEKIT_URL_ENDPOINT
        )

    @classmethod
    def get_client(cls):
        """
        Initializes an authenticated ImageKit SDK client using server-side private key.
        """
        if not cls.is_configured() or ImageKit is None:
            return None
        return ImageKit(private_key=settings.IMAGEKIT_PRIVATE_KEY)

    @classmethod
    def upload_file(
        cls,
        file_bytes: bytes,
        file_name: str,
        folder: str = "idols",
    ) -> Dict[str, Any]:
        """
        Uploads a raw image buffer to ImageKit.io under the specified folder.
        Returns dictionary containing: url, file_id, name, size.
        """
        if not cls.is_configured():
            raise RuntimeError(
                "ImageKit credentials are not configured. "
                "Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in environment."
            )

        client = cls.get_client()
        if not client:
            raise RuntimeError("ImageKit SDK client initialization failed.")

        res = client.files.upload(
            file=file_bytes,
            file_name=file_name,
            folder=folder,
            use_unique_file_name=True,
        )

        return {
            "url": res.url,
            "file_id": res.file_id,
            "name": getattr(res, "name", file_name),
            "size": getattr(res, "size", len(file_bytes)),
        }

    @classmethod
    def delete_file(cls, file_id: str) -> bool:
        """
        Deletes a media asset from ImageKit.io by file_id.
        Guarded: no-op with clear logging if keys or file_id are missing.
        """
        if not file_id:
            return False

        if not cls.is_configured():
            logger.info("ImageKit keys unset; skipping file deletion for file_id=%s", file_id)
            return False

        try:
            client = cls.get_client()
            if not client:
                logger.info("ImageKit client unavailable; skipping deletion for file_id=%s", file_id)
                return False

            client.files.delete(file_id=file_id)
            logger.info("Successfully deleted image from ImageKit: file_id=%s", file_id)
            return True
        except Exception as e:
            logger.warning("Failed to delete image %s from ImageKit: %s", file_id, e)
            return False

    @staticmethod
    def get_url(
        path_or_url: str,
        width: Optional[int] = None,
        height: Optional[int] = None,
        quality: int = 80,
        blur: Optional[int] = None,
        format_auto: bool = True,
    ) -> str:
        if not path_or_url:
            return ""

        # If already an ImageKit URL or full URL, strip or handle
        endpoint = settings.IMAGEKIT_URL_ENDPOINT.rstrip("/")
        clean_path = path_or_url.replace(endpoint, "").lstrip("/")

        transformations = []
        if width:
            transformations.append(f"w-{width}")
        if height:
            transformations.append(f"h-{height}")
        if quality:
            transformations.append(f"q-{quality}")
        if blur:
            transformations.append(f"bl-{blur}")
        if format_auto:
            transformations.append("f-auto")

        tr_query = f"tr={','.join(transformations)}" if transformations else ""

        if not endpoint:
            # Fallback if no ImageKit endpoint configured
            return path_or_url

        if tr_query:
            return f"{endpoint}/{clean_path}?{tr_query}"
        return f"{endpoint}/{clean_path}"

    @staticmethod
    def get_lqip(path_or_url: str) -> str:
        """
        Returns low-quality image placeholder for progressive image loading.
        """
        return ImageKitService.get_url(path_or_url, width=30, quality=20, blur=10)
