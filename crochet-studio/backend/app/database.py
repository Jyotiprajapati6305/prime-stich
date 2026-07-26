from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

url = settings.database_url
# Render (and some providers) hand out "postgres://" but SQLAlchemy needs "postgresql://"
if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
engine = create_engine(url, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
