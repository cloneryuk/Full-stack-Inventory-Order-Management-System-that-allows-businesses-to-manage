# InvenTrack — Inventory & Order Management System

A full-stack application for managing products, customers, orders, and inventory tracking.

### Live Links
- **Live Frontend (Vercel)**: [https://full-stack-inventory-order-manageme.vercel.app](https://full-stack-inventory-order-manageme.vercel.app)
- **Live Backend API (Render)**: [https://inventory-backend-qpzo.onrender.com](https://inventory-backend-qpzo.onrender.com)
- **Docker Hub Image**: [https://hub.docker.com/r/ayushv202/inventory-backend](https://hub.docker.com/r/ayushv202/inventory-backend)

---

## Tech Stack
| Layer | Technology |
|---|---|
| **Frontend** | React (Vite) |
| **Backend** | Python (FastAPI) |
| **Database** | PostgreSQL |
| **Containerization** | Docker + Docker Compose |

## Features
- **Product Management** — CRUD operations with unique SKU enforcement
- **Customer Management** — CRUD with unique email validation
- **Order Management** — Create orders with automatic stock deduction and total calculation
- **Dashboard** — Summary stats with low-stock alerts
- **Responsive UI** — Works on desktop and mobile

---

## Quick Start (Docker)

**1. Clone & configure**
```bash
git clone <repo-url>
cd Inventory
cp .env.example .env
```

**2. Run with Docker Compose**
```bash
docker-compose up --build
```

**3. Access**
| Service | URL |
|---|---|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |

---

## Local Development (without Docker)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
*Note: Set `VITE_API_URL=http://localhost:8000` in `frontend/.env`*

---

## API Endpoints

### Products
| Method | Endpoint | Description |
|---|---|---|
| POST | `/products/` | Create product |
| GET | `/products/` | List products |
| GET | `/products/{id}` | Get product |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| POST | `/customers/` | Create customer |
| GET | `/customers/` | List customers |
| GET | `/customers/{id}` | Get customer |
| DELETE | `/customers/{id}`| Delete customer |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders/` | Create order |
| GET | `/orders/` | List orders |
| GET | `/orders/{id}` | Get order details |
| DELETE | `/orders/{id}` | Cancel order |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/summary` | Get summary stats |

---

## Deployment

### Backend → Render
- Create a Web Service on Render
- Set root directory to `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add a PostgreSQL database and set `DATABASE_URL` env var
- Set `CORS_ORIGINS` to your Vercel frontend URL

### Frontend → Vercel
- Import repo on Vercel
- Set root directory to `frontend`
- Framework preset: Vite
- Set `VITE_API_URL` env var to your Render backend URL

---

## Business Rules
- Product SKU must be unique
- Customer email must be unique
- Product quantity cannot be negative
- Orders cannot be placed with insufficient stock
- Creating an order auto-deducts stock
- Cancelling an order restores stock
- Order total is calculated automatically by the backend
