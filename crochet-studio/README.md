# Prime Stich - Crochet Studio Management System

Single-user responsive web application to manage crochet orders, products, customers, materials, expenses and reports.

## Tech Stack

- **Frontend**: React + Vite + React Router + Axios
- **Backend**: FastAPI + SQLAlchemy + JWT
- **Database**: PostgreSQL
- **Deployment**: Render

## Features (Version 1)

- Dashboard with KPIs
- Kanban Orders (New → Making → Ready → Shipped → Delivered)
- Products with multiple images
- Customers with WhatsApp quick access
- Materials inventory
- Expenses tracking
- Reports
- Notes
- Settings
- Cream + Dusty Pink craft-inspired UI

## Project Structure

```
crochet-studio/
├── frontend/          # React app
├── backend/           # FastAPI app
└── README.md
```

## Local Setup

### 1. Database (PostgreSQL)

Create a database named `crochet_studio`:

```bash
# Using psql
createdb crochet_studio
# or
psql -U postgres -c "CREATE DATABASE crochet_studio;"
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit DATABASE_URL if needed

# Run
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

### 3. Frontend (coming next)

```bash
cd frontend
npm install
npm run dev
```

## Default Login

After registering the first user via `/api/auth/register` or the UI.

## GitHub

Repo: https://github.com/Jyotiprajapati6305/prime-stich

## Design

- Cream background
- Dusty pink primary color
- Rounded cards
- Craft-inspired UI
