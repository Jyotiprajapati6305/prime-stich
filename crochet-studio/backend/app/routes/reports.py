import datetime
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, auth

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    today = datetime.date.today()
    month_start = today.replace(day=1)

    total_orders = db.query(func.count(models.Order.id)).scalar() or 0
    active_orders = db.query(func.count(models.Order.id)).filter(
        models.Order.status.in_(["new", "in_progress", "ready"])
    ).scalar() or 0
    pending_delivery = db.query(func.count(models.Order.id)).filter(
        models.Order.status == "ready"
    ).scalar() or 0

    revenue_month = db.query(func.coalesce(func.sum(models.Order.total_amount), 0)).filter(
        models.Order.order_date >= month_start
    ).scalar() or 0

    expenses_month = db.query(func.coalesce(func.sum(models.Expense.amount), 0)).filter(
        models.Expense.expense_date >= month_start
    ).scalar() or 0

    unpaid_amount = db.query(
        func.coalesce(func.sum(models.Order.total_amount - models.Order.advance_paid), 0)
    ).filter(models.Order.payment_status != "paid").scalar() or 0

    low_stock = db.query(models.Material).filter(
        models.Material.quantity_in_stock <= models.Material.reorder_level
    ).count()

    orders_by_status = dict(
        db.query(models.Order.status, func.count(models.Order.id)).group_by(models.Order.status).all()
    )

    recent_orders = db.query(models.Order).order_by(models.Order.created_at.desc()).limit(5).all()

    return {
        "total_orders": total_orders,
        "active_orders": active_orders,
        "pending_delivery": pending_delivery,
        "revenue_this_month": float(revenue_month),
        "expenses_this_month": float(expenses_month),
        "profit_this_month": float(revenue_month) - float(expenses_month),
        "unpaid_amount": float(unpaid_amount),
        "low_stock_materials": low_stock,
        "orders_by_status": orders_by_status,
        "recent_orders": [
            {
                "id": o.id,
                "order_number": o.order_number,
                "customer_name": o.customer.name if o.customer else "",
                "status": o.status,
                "total_amount": o.total_amount,
            }
            for o in recent_orders
        ],
    }


@router.get("/revenue-by-month")
def revenue_by_month(months: int = 6, db: Session = Depends(get_db),
                      current_user: models.User = Depends(auth.get_current_user)):
    today = datetime.date.today()
    results = []
    for i in range(months - 1, -1, -1):
        year = today.year
        month = today.month - i
        while month <= 0:
            month += 12
            year -= 1
        start = datetime.date(year, month, 1)
        end_month = month + 1
        end_year = year
        if end_month > 12:
            end_month = 1
            end_year += 1
        end = datetime.date(end_year, end_month, 1)

        revenue = db.query(func.coalesce(func.sum(models.Order.total_amount), 0)).filter(
            models.Order.order_date >= start, models.Order.order_date < end
        ).scalar() or 0
        expense = db.query(func.coalesce(func.sum(models.Expense.amount), 0)).filter(
            models.Expense.expense_date >= start, models.Expense.expense_date < end
        ).scalar() or 0
        results.append({
            "month": start.strftime("%b %Y"),
            "revenue": float(revenue),
            "expenses": float(expense),
            "profit": float(revenue) - float(expense),
        })
    return results


@router.get("/top-products")
def top_products(limit: int = 5, db: Session = Depends(get_db),
                  current_user: models.User = Depends(auth.get_current_user)):
    results = db.query(
        models.OrderItem.item_name,
        func.sum(models.OrderItem.quantity).label("qty"),
        func.sum(models.OrderItem.subtotal).label("revenue"),
    ).group_by(models.OrderItem.item_name).order_by(func.sum(models.OrderItem.subtotal).desc()).limit(limit).all()
    return [{"item_name": r[0], "quantity": r[1], "revenue": float(r[2])} for r in results]


@router.get("/expense-breakdown")
def expense_breakdown(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    results = db.query(
        models.Expense.category, func.sum(models.Expense.amount)
    ).group_by(models.Expense.category).all()
    return [{"category": r[0], "amount": float(r[1])} for r in results]
