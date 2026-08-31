from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "SHOP_OWNER"
    shop_name: Optional[str] = "My Retail Store"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    full_name: str
    role: str
    shop_id: Optional[int]

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    shop_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# Category Schemas
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str]

    class Config:
        from_attributes = True

# Product Schemas
class ProductCreate(BaseModel):
    name: str
    category_id: int
    price: float
    stock_quantity: int
    min_stock_level: Optional[int] = 10
    supplier: Optional[str] = "General Supplier"

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    min_stock_level: Optional[int] = None
    supplier: Optional[str] = None

class ProductOut(BaseModel):
    id: int
    name: str
    category_id: int
    category_name: Optional[str] = None
    shop_id: int
    price: float
    stock_quantity: int
    min_stock_level: int
    supplier: Optional[str]
    status: Optional[str] = "IN_STOCK"
    created_at: datetime

    class Config:
        from_attributes = True

# Customer Schemas
class CustomerCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class CustomerOut(BaseModel):
    id: int
    name: str
    phone: Optional[str]
    email: Optional[str]
    address: Optional[str]
    shop_id: int
    total_spent: float
    purchase_count: int
    last_purchase_date: Optional[datetime]
    segment: str
    created_at: datetime

    class Config:
        from_attributes = True

# Transaction Schemas
class TransactionItemCreate(BaseModel):
    product_id: int
    quantity: int

class TransactionCreate(BaseModel):
    customer_id: int
    items: List[TransactionItemCreate]
    payment_method: Optional[str] = "CASH"

class TransactionItemOut(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: int
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True

class TransactionOut(BaseModel):
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    shop_id: int
    total_amount: float
    payment_method: str
    created_at: datetime
    items: List[TransactionItemOut]

    class Config:
        from_attributes = True

# Inventory Schemas
class InventoryOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    category_name: str
    current_stock: int
    min_stock: int
    predicted_demand: int
    status: str
    recommended_reorder: int

    class Config:
        from_attributes = True

# Demand Forecast & AI Schemas
class ForecastResponse(BaseModel):
    product_id: int
    product_name: str
    current_stock: int
    predicted_next_month_demand: int
    recommended_reorder_quantity: int
    historical_sales: List[dict] # [{"month": "Jan", "sales": 100}, ...]
    confidence_score: float

class AIRecommendationOut(BaseModel):
    id: int
    product_id: Optional[int]
    product_name: Optional[str]
    type: str
    message: str
    recommended_action: Optional[str]
    created_at: datetime

# Dashboard Summary
class DashboardMetrics(BaseModel):
    total_customers: int
    active_customers: int
    total_products: int
    monthly_revenue: float
    total_transactions: int
    low_stock_products_count: int

class SalesChartPoint(BaseModel):
    month: str
    sales: float
    transactions: int

class TopProductSummary(BaseModel):
    product_name: str
    units_sold: int
    revenue: float

class CustomerSegmentSummary(BaseModel):
    segment: str
    count: int
    percentage: float
