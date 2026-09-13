import datetime
from typing import Any, Dict, List, Optional
from pydantic import ConfigDict, Field
from app.schemas.common import BaseResponseSchema


class CarverQuote(BaseResponseSchema):
    quote: str
    artisan_name: str
    artisan_title: str


class ProductVariantBase(BaseResponseSchema):
    size: str = Field(..., description="e.g. 18-inch")
    material: str = Field(..., description="e.g. Chemical Resin")
    finish: str = Field("Polished White Finish", description="e.g. 24K Gold Leaf Vark")
    base_price: int = Field(..., gt=0, description="Base price in INR")
    price_delta: int = Field(0, description="Difference from product base price in INR")
    sku: str = Field(..., min_length=3, max_length=100)
    is_active: bool = True


class ProductVariantCreate(ProductVariantBase):
    pass


class ProductVariantUpdate(BaseResponseSchema):
    size: Optional[str] = None
    material: Optional[str] = None
    finish: Optional[str] = None
    base_price: Optional[int] = Field(None, gt=0)
    price_delta: Optional[int] = None
    sku: Optional[str] = None
    is_active: Optional[bool] = None


class ProductVariantRead(ProductVariantBase):
    id: str
    product_id: str
    created_at: datetime.datetime
    # Live stock computed across locations
    total_available_stock: Optional[int] = 0


class ProductBase(BaseResponseSchema):
    name: str = Field(..., min_length=2, max_length=200)
    slug: str = Field(..., min_length=2, max_length=150)
    deity: str = Field(..., min_length=2, max_length=100)
    deity_form: str = Field("", max_length=150)
    material: str = Field(..., min_length=2, max_length=150)
    material_purity: str = Field("", max_length=150)
    base_price: int = Field(..., gt=0)
    original_price: Optional[int] = None
    discount_badge: Optional[str] = None
    sku: str = Field(..., min_length=2, max_length=100)
    atelier: str = Field("Jaipur Atelier", max_length=150)
    short_description: str = ""
    long_description: str = ""
    certificate_number: str = ""
    is_featured_masterpiece: bool = False
    featured_order: Optional[int] = None
    specifications: Dict[str, Any] = Field(default_factory=dict)
    seva_guidelines: Dict[str, Any] = Field(default_factory=dict)
    images: List[Dict[str, Any]] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    carver_quote: Optional[CarverQuote] = None


class ProductCreate(ProductBase):
    variants: List[ProductVariantCreate] = Field(default_factory=list)


class ProductUpdate(BaseResponseSchema):
    name: Optional[str] = None
    slug: Optional[str] = None
    deity: Optional[str] = None
    deity_form: Optional[str] = None
    material: Optional[str] = None
    material_purity: Optional[str] = None
    base_price: Optional[int] = Field(None, gt=0)
    original_price: Optional[int] = None
    discount_badge: Optional[str] = None
    sku: Optional[str] = None
    atelier: Optional[str] = None
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    certificate_number: Optional[str] = None
    is_featured_masterpiece: Optional[bool] = None
    featured_order: Optional[int] = None
    specifications: Optional[Dict[str, Any]] = None
    seva_guidelines: Optional[Dict[str, Any]] = None
    images: Optional[List[Dict[str, Any]]] = None
    tags: Optional[List[str]] = None
    carver_quote: Optional[CarverQuote] = None


class ProductRead(ProductBase):
    id: str
    rating: float = 0.0
    review_count: int = 0
    created_at: datetime.datetime
    updated_at: datetime.datetime
    variants: List[ProductVariantRead] = Field(default_factory=list)


class ProductFilterParams(BaseResponseSchema):
    deity: Optional[str] = None
    material: Optional[str] = None
    search: Optional[str] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    featured_only: Optional[bool] = False
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)

