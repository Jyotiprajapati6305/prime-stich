# Stitch Studio — Crochet Order Management System

A single-user web app to manage your crochet business end to end: orders (with a
Kanban board), customers, products with photos, material stock, expenses, and
reports — built so you're no longer tracking everything across WhatsApp and
Instagram chats.

## What's included

- **Backend** — FastAPI + SQLAlchemy + PostgreSQL, JWT-secured single login
- **Frontend** — React (Vite) with a Kanban order board, product gallery,
  customer history, material stock alerts, expense tracking, and revenue/expense
  charts
- **`render.yaml`** — one-file blueprint to deploy both services + a free
  Postgres database on [Render](https://render.com)

## Features by page

| Page | What it does |
|---|---|
| Dashboard | Revenue/profit this month, active orders, unpaid amount, low-stock alerts |
| Orders | Kanban board (New → In Progress → Ready → Delivered) or list view, order form with line items, one-tap WhatsApp message to the customer |
| Products | Photo gallery, price & cost estimate, categories |
| Customers | Search, contact info, full order history, one-tap WhatsApp |
| Materials | Stock levels, reorder alerts, quick stock adjustments |
| Expenses | Log costs by category, filter by month |
| Reports | Revenue vs. expenses chart, top-selling items, expense breakdown |
| Notes | Freeform sticky notes for reminders |
| Settings | Change password, manage product categories |

---

## 1. Deploy to Render (recommended — no local setup needed)

1. Push this whole folder to a new GitHub repository.
2. In Render, click **New → Blueprint**, connect that repo, and Render will
   read `render.yaml` and set up three things automatically:
   - `crochet-studio-db` — a free PostgreSQL database
   - `crochet-studio-backend` — the FastAPI API
   - `crochet-studio-frontend` — the static React app
3. Wait for both services to finish deploying (a few minutes).
4. Create your login: open the **crochet-studio-backend** service in Render,
   go to its **Shell** tab, and run:
   ```
   python seed.py
   ```
   Follow the prompts to choose your username and password. This is the only
   login the app has — there's no public sign-up page, by design.
5. Open your frontend URL (shown on the `crochet-studio-frontend` service
   page) and log in.

**One thing to know:** Render's free web services use temporary disk storage.
Product photos you upload will be deleted whenever the backend restarts or
redeploys (this happens automatically after ~15 minutes of inactivity on the
free plan). If photo permanence matters to you, either:
- upgrade the backend service to a paid plan and attach a
  [Render Disk](https://render.com/docs/disks) mounted at `backend/app/uploads`, or
- ask me to wire up Cloudinary/S3 image storage instead — it's a small change.

Everything else (orders, customers, products, materials, expenses, notes) is
stored in the PostgreSQL database, which is fully persistent regardless of plan.

## 2. Run it locally (optional, for testing before you deploy)

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py            # create your login (uses a local SQLite file by default)
uvicorn app.main:app --reload
```
The API runs at `http://localhost:8000` (interactive docs at `/docs`).

**Frontend** (in a second terminal)
```bash
cd frontend
npm install
npm run dev
```
The app runs at `http://localhost:5173` and talks to the backend automatically.

## 3. Everyday use

- **New order comes in on WhatsApp/Instagram** → Orders → New Order. If it's a
  new customer, add them first under Customers (30 seconds).
- **Move an order along** → drag isn't needed — just change its status from the
  dropdown on its card, or open it and update the status field.
- **Getting low on yarn** → Materials shows a ⚠️ next to anything at or below
  its reorder level.
- **Month-end check-in** → Reports shows revenue vs. expenses and your
  best-sellers.

## Notes on this version (v1, matching your original blueprint)

- Single secure login, no admin/staff roles — matches "Version 1" in your spec.
- Image upload for products is included; PDF invoices and AI features were
  marked "later" in your blueprint and aren't built yet — happy to add either
  when you're ready.
- The database tables match your blueprint: users, products, product_images,
  customers, orders, order_items, materials, material_usage, expenses,
  categories, notes.
