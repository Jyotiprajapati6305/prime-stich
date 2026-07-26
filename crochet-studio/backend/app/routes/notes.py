from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("", response_model=List[schemas.NoteOut])
def list_notes(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Note).order_by(models.Note.updated_at.desc()).all()


@router.post("", response_model=schemas.NoteOut)
def create_note(payload: schemas.NoteIn, db: Session = Depends(get_db),
                 current_user: models.User = Depends(auth.get_current_user)):
    note = models.Note(**payload.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/{note_id}", response_model=schemas.NoteOut)
def update_note(note_id: int, payload: schemas.NoteIn, db: Session = Depends(get_db),
                 current_user: models.User = Depends(auth.get_current_user)):
    note = db.query(models.Note).get(note_id)
    if not note:
        raise HTTPException(404, "Note not found")
    for k, v in payload.model_dump().items():
        setattr(note, k, v)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db),
                 current_user: models.User = Depends(auth.get_current_user)):
    note = db.query(models.Note).get(note_id)
    if not note:
        raise HTTPException(404, "Note not found")
    db.delete(note)
    db.commit()
    return {"ok": True}
