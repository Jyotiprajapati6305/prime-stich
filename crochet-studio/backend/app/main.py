from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.config import settings
from app.routes import auth, customers, categories, products, orders, materials, expenses, notes, reports

# Create tables if they don't exist yet (simple approach, fine for a single-user app)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Crochet Studio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(materials.router)
app.include_router(expenses.router)
app.include_router(notes.router)
app.include_router(reports.router)


@app.get("/")
def health():
    return {"status": "ok", "service": "crochet-studio-api"}
