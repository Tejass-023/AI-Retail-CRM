from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.routes import auth, customers, products, transactions, inventory, analytics, ai, market, govt
from app.seed import seed_database
from app.models.models import User

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered Retail CRM API",
    description="CRM platform with Scikit-learn Need & Demand Forecasting for Retail Shop Owners and Government Analysts",
    version="1.0.0"
)

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(products.router)
app.include_router(transactions.router)
app.include_router(inventory.router)
app.include_router(analytics.router)
app.include_router(ai.router)
app.include_router(market.router)
app.include_router(govt.router)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            print("🚀 Auto-seeding database for first run...")
            seed_database()
    except Exception as e:
        print("Startup warning:", e)
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "message": "AI-Powered CRM API is running successfully",
        "docs_url": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
