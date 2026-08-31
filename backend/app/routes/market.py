from fastapi import APIRouter
from typing import List, Dict

router = APIRouter(prefix="/api/market", tags=["Market Intelligence"])

@router.get("/trends")
def get_market_trends() -> List[Dict]:
    """
    Simulated Market Intelligence endpoint providing privacy-preserving aggregated demand insights
    across retail regions (e.g. Pune, Mumbai, Bangalore) without exposing any individual shop or customer data.
    """
    return [
        {
            "id": 1,
            "region": "Pune Metro Region",
            "category": "Mobile Accessories",
            "top_trending_item": "Power Banks & Fast Chargers",
            "demand_change_percent": +25.4,
            "trend_status": "HIGH_GROWTH",
            "insight": "High demand in urban IT corridors during monsoon season."
        },
        {
            "id": 2,
            "region": "Pune Metro Region",
            "category": "Lighting & Electricals",
            "top_trending_item": "LED Bulbs & Smart Lights",
            "demand_change_percent": +18.2,
            "trend_status": "STEADY_GROWTH",
            "insight": "Consistent retail replacement cycle across residential zones."
        },
        {
            "id": 3,
            "region": "Mumbai Region",
            "category": "Smart Devices",
            "top_trending_item": "Smart Fitness Watches",
            "demand_change_percent": +21.0,
            "trend_status": "HIGH_GROWTH",
            "insight": "Increased health awareness driving wearable sales."
        },
        {
            "id": 4,
            "region": "Maharashtra State",
            "category": "Home Appliances",
            "top_trending_item": "Mixer Grinders & Blenders",
            "demand_change_percent": +12.5,
            "trend_status": "MODERATE",
            "insight": "Festival season stocking beginning early in tier-2 cities."
        }
    ]
