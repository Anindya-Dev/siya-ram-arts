from app.schemas.common import BaseResponseSchema


class ImageUploadResponse(BaseResponseSchema):
    url: str
    file_id: str
    name: str
    size: int
