from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Category).order_by(models.Category.name).all()


@router.post("", response_model=schemas.CategoryOut)
def create_category(payload: schemas.CategoryIn, db: Session = Depends(get_db),
                     current_user: models.User = Depends(auth.get_current_user)):
    existing = db.query(models.Category).filter(models.Category.name == payload.name).first()
    if existing:
        return existing
    category = models.Category(name=payload.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db),
                     current_user: models.User = Depends(auth.get_current_user)):
    category = db.query(models.Category).get(category_id)
    if not category:
        raise HTTPException(404, "Category not found")
    db.delete(category)
    db.commit()
    return {"ok": True}
