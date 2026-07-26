from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_expenses():
    return {"message": "expenses endpoint - coming soon"}
