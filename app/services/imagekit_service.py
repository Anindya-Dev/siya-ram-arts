from typing import Optional
from app.core.config import settings


class ImageKitService:
    """
    ImageKit.io transformation and responsive image delivery service.
    Constructs optimized WebP/AVIF endpoints with on-the-fly resizing, quality compression,
    and low-quality placeholder blurs (LQIP) for devotional imagery.
    """
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
