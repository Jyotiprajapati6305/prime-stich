from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_materials():
    return {"message": "materials endpoint - coming soon"}
