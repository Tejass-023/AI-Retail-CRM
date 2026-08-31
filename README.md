# AI-Powered CRM with Need & Demand Analysis (MVP)

An intelligent, full-stack Retail Customer Relationship Management (CRM) system designed for retail shop owners. Built with **React**, **FastAPI**, **SQLAlchemy ORM**, and **Scikit-learn**, this platform empowers small-to-medium shopkeepers to manage customer relationships, process POS transactions, automate stock level tracking, analyze revenue trends, and forecast future product demand using machine learning.

---

## 🌟 Monday MVP Feature Overview

The current working MVP includes 100% of the core functionality required for your college demonstration:

1. **Authentication & Access Control**: JWT Token-based login and registration for Shop Owners.
2. **Interactive SaaS Dashboard**: Top metric cards, monthly revenue charts (Recharts), top products table, RFM customer segmentation donut chart, low stock alerts, and AI insights.
3. **Customer Relationship Management**: View customers, add/edit/delete customers, filter by segment (High Value, Regular, Occasional, Inactive), view individual customer profiles with Lifetime Value (CLV) & AI cross-sell recommendations.
4. **Product Catalog**: Manage products with prices in INR (₹), categories, suppliers, stock levels, and automatic visual status indicators (In Stock, Low Stock, Out of Stock).
5. **Sales & POS Transactions**: Record counter sales with live total calculation, auto-deduct stock from inventory upon sale, update customer total spend metrics, and update dashboard analytics in real time.
6. **Inventory & Dynamic Reorder Planning**: Auto-calculated reorder recommendation formula:
   $$\text{Recommended Reorder} = \max(0, \text{Predicted Demand} + \text{Safety Stock} - \text{Current Stock})$$
7. **AI Demand Forecasting Engine**: Scikit-learn `LinearRegression` model trained on historical monthly product sales transaction items to predict next month's product demand.
8. **Privacy-Preserving Market Intelligence**: Aggregated regional trend insights (e.g. Pune/Mumbai region demand changes) without exposing confidential customer or shop data.

---

## 🏗️ Architecture

```
React.js Frontend (Vite + Tailwind CSS + Recharts + Axios)
                    │
                    │ REST API (JSON / JWT)
                    ▼
FastAPI Backend Monolith (Python 3.13)
  ├── Auth Service (JWT + PBKDF2 SHA256 Password Hashing)
  ├── CRM Service (Customers, Products, Transactions & Stock Deduction)
  ├── Analytics Service (KPIs, Charts Data, Customer RFM Segmentation)
  └── ML Service (Scikit-Learn LinearRegression Demand Forecasting Engine)
                    │
                    ▼
SQLAlchemy ORM ──► SQLite (Default Zero-Setup) / PostgreSQL (Production Ready)
```

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, Tailwind CSS v4, Recharts, Axios, Lucide Icons, React Router v6
* **Backend**: Python 3.13, FastAPI, SQLAlchemy ORM, Pydantic v2, PyJWT / Python-Jose
* **Machine Learning & Data**: Python, Scikit-learn (`LinearRegression`), Pandas, NumPy
* **Database**: SQLite (out-of-the-box local development), PostgreSQL compatible via `DATABASE_URL`

---

## 🚀 Quick Start & How to Run

### 1. Prerequisites
* **Python**: 3.10 or higher (Python 3.13 recommended)
* **Node.js**: v18 or higher (Node.js v24 tested)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Seed the database with sample retail data (25+ customers, 15+ products, 100+ transactions)
python -m app.seed

# Start the FastAPI backend server
python -m uvicorn app.main:app --port 8000 --reload
```
> The API will start at `http://127.0.0.1:8000`. Swagger API Documentation is available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
> The application UI will be available at `http://localhost:5173`.

---

## 🔐 Test Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Shop Owner (Default)** | `owner@apnacrm.com` | `password123` |

---

## 📊 How the AI Demand Forecasting Works

1. **Data Aggregation**: When a demand forecast is requested for a product, the backend retrieves all historical transaction line items grouped by month.
2. **Model Training**: A Scikit-learn `LinearRegression` model ($y = m \cdot x + c$) fits monthly time series values ($x = \text{Month Index}$, $y = \text{Units Sold}$).
3. **Prediction & Safety Buffer**: The model predicts next month's expected demand unit count.
4. **Reorder Recommendation**: The recommendation engine evaluates current stock against predicted demand and safety thresholds to output the exact reorder quantity needed to prevent out-of-stock scenarios.

---

## 🎓 Viva / College Demonstration Script for Professor ("Mam")

When presenting this project to your professor, highlight the following 4-step flow:

1. **Introduction**: 
   > *"Mam, my project is an AI-Powered Retail CRM that solves two major problems for shop owners: customer retention and stockouts. Instead of just recording sales like traditional CRMs, it uses Machine Learning to predict next month's product demand."*

2. **Core CRM & Transaction Workflow**:
   > *"First, let me show the live transaction process. When I record a new sale in the Transactions page (e.g. Rahul Sharma buying 2 Power Banks), the backend automatically deducts 2 units from inventory, updates the customer's total spending, updates our RFM customer segment, and recalculates monthly store revenue on the dashboard in real time."*

3. **AI Need & Demand Analysis**:
   > *"Next, on the AI Insights page, we use a Scikit-learn Linear Regression model trained on past transaction data. If we select 'Power Bank', you can see the trend line predicting next month's demand. The system dynamically computes the exact recommended reorder quantity: $\text{Reorder} = \max(0, \text{Predicted Demand} + \text{Safety Stock} - \text{Current Stock})$."*

4. **Privacy-Preserving Market Intelligence**:
   > *"Lastly, for long-term scalability across multiple shops, our Market Trends module aggregates category demand regionally without exposing any personal customer information or proprietary shop revenue."*

---

## 🔮 Future Scope
* Integration of XGBoost & Prophet for seasonal demand forecasting.
* Multi-shop federated data aggregation.
* Automated WhatsApp / SMS promotional coupons for inactive high-value customers.
