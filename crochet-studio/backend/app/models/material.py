from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    unit = Column(String, default="gram")  # gram, skein, meter, piece etc.
    quantity_in_stock = Column(Float, default=0.0)
    cost_per_unit = Column(Float, default=0.0)
    low_stock_threshold = Column(Float, default=50.0)
    supplier = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    usages = relationship("MaterialUsage", back_populates="material")


class MaterialUsage(Base):
    __tablename__ = "material_usage"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=False)
    quantity_used = Column(Float, nullable=False)  # how much is used per product

    product = relationship("Product", back_populates="material_usages")
    material = relationship("Material", back_populates="usages")
