import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app import models, schemas, auth

router = APIRouter(prefix="/products", tags=["products"])

ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


@router.get("", response_model=List[schemas.ProductOut])
def list_products(
    active_only: bool = False,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    query = db.query(models.Product)
    if active_only:
        query = query.filter(models.Product.is_active == True)  # noqa: E712
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    return query.order_by(models.Product.name).all()


@router.post("", response_model=schemas.ProductOut)
def create_product(payload: schemas.ProductIn, db: Session = Depends(get_db),
                    current_user: models.User = Depends(auth.get_current_user)):
    product = models.Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db),
                 current_user: models.User = Depends(auth.get_current_user)):
    product = db.query(models.Product).get(product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    return product


@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, payload: schemas.ProductIn, db: Session = Depends(get_db),
                    current_user: models.User = Depends(auth.get_current_user)):
    product = db.query(models.Product).get(product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    for k, v in payload.model_dump().items():
        setattr(product, k, v)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db),
                    current_user: models.User = Depends(auth.get_current_user)):
    product = db.query(models.Product).get(product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    for img in product.images:
        path = os.path.join(settings.upload_dir, img.filename)
        if os.path.exists(path):
            os.remove(path)
    db.delete(product)
    db.commit()
    return {"ok": True}


@router.post("/{product_id}/images", response_model=schemas.ProductImageOut)
def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    product = db.query(models.Product).get(product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, "Unsupported image type")
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(settings.upload_dir, filename)
    with open(dest, "wb") as f:
        f.write(file.file.read())

    is_primary = len(product.images) == 0
    image = models.ProductImage(product_id=product_id, filename=filename, is_primary=is_primary)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.delete("/images/{image_id}")
def delete_product_image(image_id: int, db: Session = Depends(get_db),
                          current_user: models.User = Depends(auth.get_current_user)):
    image = db.query(models.ProductImage).get(image_id)
    if not image:
        raise HTTPException(404, "Image not found")
    path = os.path.join(settings.upload_dir, image.filename)
    if os.path.exists(path):
        os.remove(path)
    db.delete(image)
    db.commit()
    return {"ok": True}


@router.put("/images/{image_id}/set-primary")
def set_primary_image(image_id: int, db: Session = Depends(get_db),
                       current_user: models.User = Depends(auth.get_current_user)):
    image = db.query(models.ProductImage).get(image_id)
    if not image:
        raise HTTPException(404, "Image not found")
    db.query(models.ProductImage).filter(
        models.ProductImage.product_id == image.product_id
    ).update({"is_primary": False})
    image.is_primary = True
    db.commit()
    return {"ok": True}
