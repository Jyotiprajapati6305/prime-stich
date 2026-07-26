import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Date
)
from sqlalchemy.orm import relationship
from app.database import Base


def now():
    return datetime.datetime.utcnow()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    display_name = Column(String(128), default="")
    created_at = Column(DateTime, default=now)


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), unique=True, nullable=False)

    products = relationship("Product", back_populates="category")


class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    phone = Column(String(32), default="")
    instagram_handle = Column(String(128), default="")
    address = Column(Text, default="")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=now)

    orders = relationship("Order", back_populates="customer")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    price = Column(Float, default=0)
    cost_estimate = Column(Float, default=0)
    description = Column(Text, default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now)

    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")


class ProductImage(Base):
    __tablename__ = "product_images"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    filename = Column(String(256), nullable=False)
    is_primary = Column(Boolean, default=False)

    product = relationship("Product", back_populates="images")


ORDER_STATUSES = ["new", "in_progress", "ready", "delivered", "cancelled"]
PAYMENT_STATUSES = ["unpaid", "partial", "paid"]
ORDER_SOURCES = ["whatsapp", "instagram", "other"]


class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(32), unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    status = Column(String(32), default="new")
    order_date = Column(Date, default=datetime.date.today)
    due_date = Column(Date, nullable=True)
    total_amount = Column(Float, default=0)
    advance_paid = Column(Float, default=0)
    payment_status = Column(String(32), default="unpaid")
    source = Column(String(32), default="whatsapp")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=now)

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    material_usages = relationship("MaterialUsage", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    item_name = Column(String(128), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, default=0)
    subtotal = Column(Float, default=0)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")


class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    unit = Column(String(32), default="g")
    quantity_in_stock = Column(Float, default=0)
    cost_per_unit = Column(Float, default=0)
    reorder_level = Column(Float, default=0)
    supplier = Column(String(128), default="")
    created_at = Column(DateTime, default=now)

    usages = relationship("MaterialUsage", back_populates="material")


class MaterialUsage(Base):
    __tablename__ = "material_usage"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=False)
    quantity_used = Column(Float, default=0)
    date = Column(Date, default=datetime.date.today)

    order = relationship("Order", back_populates="material_usages")
    material = relationship("Material", back_populates="usages")


class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(64), default="general")
    description = Column(String(256), default="")
    amount = Column(Float, default=0)
    expense_date = Column(Date, default=datetime.date.today)
    related_order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    created_at = Column(DateTime, default=now)


class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(128), default="")
    content = Column(Text, default="")
    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, default=now, onupdate=now)
