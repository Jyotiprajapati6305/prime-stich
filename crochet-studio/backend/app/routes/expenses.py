import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("", response_model=List[schemas.ExpenseOut])
def list_expenses(
    month: Optional[str] = None,  # format YYYY-MM
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    query = db.query(models.Expense)
    if month:
        year, mo = map(int, month.split("-"))
        start = datetime.date(year, mo, 1)
        end = datetime.date(year + (mo == 12), (mo % 12) + 1, 1)
        query = query.filter(models.Expense.expense_date >= start, models.Expense.expense_date < end)
    return query.order_by(models.Expense.expense_date.desc()).all()


@router.post("", response_model=schemas.ExpenseOut)
def create_expense(payload: schemas.ExpenseIn, db: Session = Depends(get_db),
                    current_user: models.User = Depends(auth.get_current_user)):
    data = payload.model_dump()
    data["expense_date"] = data["expense_date"] or datetime.date.today()
    expense = models.Expense(**data)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.put("/{expense_id}", response_model=schemas.ExpenseOut)
def update_expense(expense_id: int, payload: schemas.ExpenseIn, db: Session = Depends(get_db),
                    current_user: models.User = Depends(auth.get_current_user)):
    expense = db.query(models.Expense).get(expense_id)
    if not expense:
        raise HTTPException(404, "Expense not found")
    data = payload.model_dump()
    data["expense_date"] = data["expense_date"] or expense.expense_date
    for k, v in data.items():
        setattr(expense, k, v)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db),
                    current_user: models.User = Depends(auth.get_current_user)):
    expense = db.query(models.Expense).get(expense_id)
    if not expense:
        raise HTTPException(404, "Expense not found")
    db.delete(expense)
    db.commit()
    return {"ok": True}
