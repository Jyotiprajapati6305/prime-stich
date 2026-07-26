from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_notes():
    return {"message": "notes endpoint - coming soon"}
