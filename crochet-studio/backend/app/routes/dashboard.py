from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_dashboard():
    return {"message": "dashboard endpoint - coming soon"}
