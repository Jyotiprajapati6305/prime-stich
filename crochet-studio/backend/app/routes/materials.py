from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/materials", tags=["materials"])


@router.get("", response_model=List[schemas.MaterialOut])
def list_materials(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Material).order_by(models.Material.name).all()


@router.post("", response_model=schemas.MaterialOut)
def create_material(payload: schemas.MaterialIn, db: Session = Depends(get_db),
                     current_user: models.User = Depends(auth.get_current_user)):
    material = models.Material(**payload.model_dump())
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


@router.put("/{material_id}", response_model=schemas.MaterialOut)
def update_material(material_id: int, payload: schemas.MaterialIn, db: Session = Depends(get_db),
                     current_user: models.User = Depends(auth.get_current_user)):
    material = db.query(models.Material).get(material_id)
    if not material:
        raise HTTPException(404, "Material not found")
    for k, v in payload.model_dump().items():
        setattr(material, k, v)
    db.commit()
    db.refresh(material)
    return material


@router.delete("/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db),
                     current_user: models.User = Depends(auth.get_current_user)):
    material = db.query(models.Material).get(material_id)
    if not material:
        raise HTTPException(404, "Material not found")
    db.delete(material)
    db.commit()
    return {"ok": True}


@router.post("/{material_id}/adjust", response_model=schemas.MaterialOut)
def adjust_stock(material_id: int, payload: schemas.MaterialAdjustIn, db: Session = Depends(get_db),
                  current_user: models.User = Depends(auth.get_current_user)):
    material = db.query(models.Material).get(material_id)
    if not material:
        raise HTTPException(404, "Material not found")
    material.quantity_in_stock += payload.quantity_change
    usage = models.MaterialUsage(
        order_id=payload.order_id,
        material_id=material_id,
        quantity_used=-payload.quantity_change,
    )
    db.add(usage)
    db.commit()
    db.refresh(material)
    return material
