import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/orders", tags=["orders"])


def generate_order_number(db: Session) -> str:
    today = datetime.date.today()
    prefix = f"ORD-{today.strftime('%Y%m')}-"
    count = db.query(models.Order).filter(models.Order.order_number.like(f"{prefix}%")).count()
    return f"{prefix}{count + 1:03d}"


def recalc_total(order: models.Order):
    order.total_amount = sum(item.subtotal for item in order.items)


@router.get("", response_model=List[schemas.OrderOut])
def list_orders(
    status: Optional[str] = None,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    query = db.query(models.Order)
    if status:
        query = query.filter(models.Order.status == status)
    if customer_id:
        query = query.filter(models.Order.customer_id == customer_id)
    return query.order_by(models.Order.created_at.desc()).all()


@router.post("", response_model=schemas.OrderOut)
def create_order(payload: schemas.OrderIn, db: Session = Depends(get_db),
                  current_user: models.User = Depends(auth.get_current_user)):
    customer = db.query(models.Customer).get(payload.customer_id)
    if not customer:
        raise HTTPException(404, "Customer not found")

    order = models.Order(
        order_number=generate_order_number(db),
        customer_id=payload.customer_id,
        status=payload.status or "new",
        order_date=payload.order_date or datetime.date.today(),
        due_date=payload.due_date,
        advance_paid=payload.advance_paid or 0,
        payment_status=payload.payment_status or "unpaid",
        source=payload.source or "whatsapp",
        notes=payload.notes or "",
    )
    for item in payload.items:
        subtotal = item.quantity * item.unit_price
        order.items.append(models.OrderItem(
            product_id=item.product_id,
            item_name=item.item_name,
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=subtotal,
        ))
    recalc_total(order)
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db),
              current_user: models.User = Depends(auth.get_current_user)):
    order = db.query(models.Order).get(order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    return order


@router.put("/{order_id}", response_model=schemas.OrderOut)
def update_order(order_id: int, payload: schemas.OrderIn, db: Session = Depends(get_db),
                  current_user: models.User = Depends(auth.get_current_user)):
    order = db.query(models.Order).get(order_id)
    if not order:
        raise HTTPException(404, "Order not found")

    order.customer_id = payload.customer_id
    order.status = payload.status or order.status
    order.order_date = payload.order_date or order.order_date
    order.due_date = payload.due_date
    order.advance_paid = payload.advance_paid or 0
    order.payment_status = payload.payment_status or order.payment_status
    order.source = payload.source or order.source
    order.notes = payload.notes or ""

    order.items.clear()
    for item in payload.items:
        subtotal = item.quantity * item.unit_price
        order.items.append(models.OrderItem(
            product_id=item.product_id,
            item_name=item.item_name,
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=subtotal,
        ))
    recalc_total(order)
    db.commit()
    db.refresh(order)
    return order


@router.patch("/{order_id}/status", response_model=schemas.OrderOut)
def update_status(order_id: int, payload: schemas.OrderStatusUpdate, db: Session = Depends(get_db),
                   current_user: models.User = Depends(auth.get_current_user)):
    order = db.query(models.Order).get(order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    if payload.status not in models.ORDER_STATUSES:
        raise HTTPException(400, "Invalid status")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


@router.patch("/{order_id}/payment", response_model=schemas.OrderOut)
def update_payment(order_id: int, payload: schemas.OrderPaymentUpdate, db: Session = Depends(get_db),
                    current_user: models.User = Depends(auth.get_current_user)):
    order = db.query(models.Order).get(order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    order.advance_paid = payload.advance_paid
    order.payment_status = payload.payment_status
    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db),
                  current_user: models.User = Depends(auth.get_current_user)):
    order = db.query(models.Order).get(order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    db.delete(order)
    db.commit()
    return {"ok": True}
