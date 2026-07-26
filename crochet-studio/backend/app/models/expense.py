from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Enum
from sqlalchemy.sql import func
import enum
from app.database.database import Base


class ExpenseCategory(str, enum.Enum):
    YARN = "yarn"
    PACKING = "packing"
    COURIER = "courier"
    TOOLS = "tools"
    MARKETING = "marketing"
    OTHER = "other"


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(Enum(ExpenseCategory), default=ExpenseCategory.OTHER)
    description = Column(Text, nullable=True)
    expense_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
