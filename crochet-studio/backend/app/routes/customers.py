from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=List[schemas.CustomerWithStats])
def list_customers(
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    query = db.query(models.Customer)
    if q:
        query = query.filter(models.Customer.name.ilike(f"%{q}%"))
    customers = query.order_by(models.Customer.name).all()
    result = []
    for c in customers:
        stats = db.query(
            func.count(models.Order.id), func.coalesce(func.sum(models.Order.total_amount), 0)
        ).filter(models.Order.customer_id == c.id).first()
        item = schemas.CustomerWithStats.model_validate(c)
        item.total_orders = stats[0] or 0
        item.total_spent = float(stats[1] or 0)
        result.append(item)
    return result


@router.post("", response_model=schemas.CustomerOut)
def create_customer(payload: schemas.CustomerIn, db: Session = Depends(get_db),
                     current_user: models.User = Depends(auth.get_current_user)):
    customer = models.Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/{customer_id}", response_model=schemas.CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db),
                  current_user: models.User = Depends(auth.get_current_user)):
    customer = db.query(models.Customer).get(customer_id)
    if not customer:
        raise HTTPException(404, "Customer not found")
    return customer


@router.put("/{customer_id}", response_model=schemas.CustomerOut)
def update_customer(customer_id: int, payload: schemas.CustomerIn, db: Session = Depends(get_db),
                     current_user: models.User = Depends(auth.get_current_user)):
    customer = db.query(models.Customer).get(customer_id)
    if not customer:
        raise HTTPException(404, "Customer not found")
    for k, v in payload.model_dump().items():
        setattr(customer, k, v)
    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db),
                     current_user: models.User = Depends(auth.get_current_user)):
    customer = db.query(models.Customer).get(customer_id)
    if not customer:
        raise HTTPException(404, "Customer not found")
    db.delete(customer)
    db.commit()
    return {"ok": True}


@router.get("/{customer_id}/orders", response_model=List[schemas.OrderOut])
def customer_orders(customer_id: int, db: Session = Depends(get_db),
                     current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Order).filter(models.Order.customer_id == customer_id)\
        .order_by(models.Order.created_at.desc()).all()
