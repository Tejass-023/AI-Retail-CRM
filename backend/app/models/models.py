from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    SHOP_OWNER = "SHOP_OWNER"
    SALESPERSON = "SALESPERSON"
    SYSTEM_ADMIN = "SYSTEM_ADMIN"
    GOVERNMENT_ANALYST = "GOVERNMENT_ANALYST"

class CustomerSegment(str, enum.Enum):
    HIGH_VALUE = "HIGH_VALUE"
    REGULAR = "REGULAR"
    OCCASIONAL = "OCCASIONAL"
    INACTIVE = "INACTIVE"

class StockStatus(str, enum.Enum):
    IN_STOCK = "IN_STOCK"
    LOW_STOCK = "LOW_STOCK"
    OUT_OF_STOCK = "OUT_OF_STOCK"

class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="shop")
    categories = relationship("Category", back_populates="shop")
    products = relationship("Product", back_populates="shop")
    customers = relationship("Customer", back_populates="shop")
    transactions = relationship("Transaction", back_populates="shop")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.SHOP_OWNER.value)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    shop = relationship("Shop", back_populates="users")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)

    shop = relationship("Shop", back_populates="categories")
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    price = Column(Float, nullable=False) # In INR ₹
    stock_quantity = Column(Integer, default=0)
    min_stock_level = Column(Integer, default=10)
    supplier = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    shop = relationship("Shop", back_populates="products")
    category = relationship("Category", back_populates="products")
    transaction_items = relationship("TransactionItem", back_populates="product")
    inventory = relationship("Inventory", back_populates="product", uselist=False)
    forecasts = relationship("DemandForecast", back_populates="product")
    recommendations = relationship("Recommendation", back_populates="product")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    total_spent = Column(Float, default=0.0)
    purchase_count = Column(Integer, default=0)
    last_purchase_date = Column(DateTime, nullable=True)
    segment = Column(String, default=CustomerSegment.OCCASIONAL.value)
    created_at = Column(DateTime, default=datetime.utcnow)

    shop = relationship("Shop", back_populates="customers")
    transactions = relationship("Transaction", back_populates="customer")
    interactions = relationship("CustomerInteraction", back_populates="customer")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    payment_method = Column(String, default="CASH") # CASH, UPI, CARD
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    customer = relationship("Customer", back_populates="transactions")
    shop = relationship("Shop", back_populates="transactions")
    items = relationship("TransactionItem", back_populates="transaction", cascade="all, delete-orphan")

class TransactionItem(Base):
    __tablename__ = "transaction_items"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    transaction = relationship("Transaction", back_populates="items")
    product = relationship("Product", back_populates="transaction_items")

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, unique=True)
    current_stock = Column(Integer, nullable=False, default=0)
    min_stock = Column(Integer, nullable=False, default=10)
    predicted_demand = Column(Integer, default=0)
    status = Column(String, default=StockStatus.IN_STOCK.value)
    recommended_reorder = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product", back_populates="inventory")

class DemandForecast(Base):
    __tablename__ = "demand_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    forecast_period = Column(String, nullable=False) # e.g. "Next Month"
    predicted_quantity = Column(Integer, nullable=False)
    confidence_score = Column(Float, default=0.85)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="forecasts")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    type = Column(String, nullable=False) # REORDER, CROSS_SELL, CHURN_RISK, TREND
    message = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="recommendations")

class MarketTrend(Base):
    __tablename__ = "market_trends"

    id = Column(Integer, primary_key=True, index=True)
    region = Column(String, nullable=False) # e.g. "Pune", "Mumbai"
    category_name = Column(String, nullable=False)
    demand_change_percent = Column(Float, nullable=False)
    trend_type = Column(String, default="UPWARD") # UPWARD, DOWNWARD, STABLE
    updated_at = Column(DateTime, default=datetime.utcnow)

# Placeholders for future expanded modules
class CustomerInteraction(Base):
    __tablename__ = "customer_interactions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    notes = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="interactions")

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    status = Column(String, default="NEW") # NEW, CONTACTED, CONVERTED
    created_at = Column(DateTime, default=datetime.utcnow)

class Followup(Base):
    __tablename__ = "followups"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    due_date = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String, default="PENDING")

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact_person = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
