import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- Auth ----------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginIn(BaseModel):
    username: str
    password: str


class PasswordChangeIn(BaseModel):
    current_password: str
    new_password: str


class UserOut(ORMBase):
    id: int
    username: str
    display_name: str


# ---------- Category ----------
class CategoryIn(BaseModel):
    name: str


class CategoryOut(ORMBase):
    id: int
    name: str


# ---------- Customer ----------
class CustomerIn(BaseModel):
    name: str
    phone: Optional[str] = ""
    instagram_handle: Optional[str] = ""
    address: Optional[str] = ""
    notes: Optional[str] = ""


class CustomerOut(ORMBase):
    id: int
    name: str
    phone: str
    instagram_handle: str
    address: str
    notes: str
    created_at: datetime.datetime


class CustomerWithStats(CustomerOut):
    total_orders: int = 0
    total_spent: float = 0


# ---------- Product Image ----------
class ProductImageOut(ORMBase):
    id: int
    filename: str
    is_primary: bool


# ---------- Product ----------
class ProductIn(BaseModel):
    name: str
    category_id: Optional[int] = None
    price: float = 0
    cost_estimate: float = 0
    description: Optional[str] = ""
    is_active: bool = True


class ProductOut(ORMBase):
    id: int
    name: str
    category_id: Optional[int]
    price: float
    cost_estimate: float
    description: str
    is_active: bool
    images: List[ProductImageOut] = []


# ---------- Order Item ----------
class OrderItemIn(BaseModel):
    product_id: Optional[int] = None
    item_name: str
    quantity: int = 1
    unit_price: float = 0


class OrderItemOut(ORMBase):
    id: int
    product_id: Optional[int]
    item_name: str
    quantity: int
    unit_price: float
    subtotal: float


# ---------- Order ----------
class OrderIn(BaseModel):
    customer_id: int
    status: Optional[str] = "new"
    order_date: Optional[datetime.date] = None
    due_date: Optional[datetime.date] = None
    advance_paid: Optional[float] = 0
    payment_status: Optional[str] = "unpaid"
    source: Optional[str] = "whatsapp"
    notes: Optional[str] = ""
    items: List[OrderItemIn] = []


class OrderStatusUpdate(BaseModel):
    status: str


class OrderPaymentUpdate(BaseModel):
    advance_paid: float
    payment_status: str


class OrderOut(ORMBase):
    id: int
    order_number: str
    customer_id: int
    status: str
    order_date: datetime.date
    due_date: Optional[datetime.date]
    total_amount: float
    advance_paid: float
    payment_status: str
    source: str
    notes: str
    created_at: datetime.datetime
    items: List[OrderItemOut] = []
    customer: Optional[CustomerOut] = None


# ---------- Material ----------
class MaterialIn(BaseModel):
    name: str
    unit: str = "g"
    quantity_in_stock: float = 0
    cost_per_unit: float = 0
    reorder_level: float = 0
    supplier: Optional[str] = ""


class MaterialOut(ORMBase):
    id: int
    name: str
    unit: str
    quantity_in_stock: float
    cost_per_unit: float
    reorder_level: float
    supplier: str


class MaterialAdjustIn(BaseModel):
    quantity_change: float  # positive = restock, negative = usage
    order_id: Optional[int] = None
    note: Optional[str] = ""


# ---------- Expense ----------
class ExpenseIn(BaseModel):
    category: str = "general"
    description: Optional[str] = ""
    amount: float = 0
    expense_date: Optional[datetime.date] = None
    related_order_id: Optional[int] = None


class ExpenseOut(ORMBase):
    id: int
    category: str
    description: str
    amount: float
    expense_date: datetime.date
    related_order_id: Optional[int]


# ---------- Note ----------
class NoteIn(BaseModel):
    title: Optional[str] = ""
    content: str


class NoteOut(ORMBase):
    id: int
    title: str
    content: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
