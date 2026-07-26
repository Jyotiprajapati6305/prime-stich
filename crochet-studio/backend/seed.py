"""
Run this once after deployment to create your login.

Locally:
    python seed.py

On Render, open the backend service Shell tab and run:
    python seed.py
"""
import os
import sys
import getpass

sys.path.insert(0, os.path.dirname(__file__))

from app.database import Base, engine, SessionLocal  # noqa: E402
from app import models, auth  # noqa: E402

Base.metadata.create_all(bind=engine)


def main():
    db = SessionLocal()
    existing = db.query(models.User).first()
    if existing:
        print(f"A user already exists: {existing.username}")
        choice = input("Create another user anyway? (y/N): ").strip().lower()
        if choice != "y":
            return

    username = input("Choose a username: ").strip()
    password = getpass.getpass("Choose a password: ").strip()
    display_name = input("Your display name (optional): ").strip()

    user = models.User(
        username=username,
        hashed_password=auth.hash_password(password),
        display_name=display_name or username,
    )
    db.add(user)
    db.commit()
    print(f"User '{username}' created. You can now log in.")


if __name__ == "__main__":
    main()
