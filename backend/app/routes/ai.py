from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.models import User
from app.schemas.schemas import ForecastResponse
from app.services.ml_service import MLService
from app.services.chatbot_service import ChatbotService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/ai", tags=["AI & Machine Learning"])

def get_shop_id(current_user: Optional[User]) -> int:
    return current_user.shop_id if (current_user and current_user.shop_id) else 1

class ChatMessageIn(BaseModel):
    message: str

class CampaignIn(BaseModel):
    target_segment: Optional[str] = "HIGH_RISK"
    discount_percent: Optional[int] = 15

@router.get("/forecast/{product_id}")
def get_product_forecast(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    result = MLService.forecast_product_demand(db, product_id)
    if not result:
        raise HTTPException(status_code=404, detail="Product not found for demand forecasting")
    return result

@router.get("/recommendations")
def get_ai_recommendations(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    return MLService.get_all_ai_recommendations(db, shop_id)

@router.get("/churn/{customer_id}")
def get_customer_churn_risk(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    result = MLService.predict_customer_churn_risk(db, customer_id)
    if not result:
        raise HTTPException(status_code=404, detail="Customer not found")
    return result

@router.post("/chat")
def chatbot_query(
    chat_in: ChatMessageIn,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    return ChatbotService.process_message(db, shop_id, chat_in.message)

@router.post("/campaigns")
def create_marketing_campaign(
    camp_in: CampaignIn,
    current_user: Optional[User] = Depends(get_current_user)
):
    promo_code = f"RETENTION{camp_in.discount_percent}"
    return {
        "success": True,
        "campaign_id": 101,
        "promo_code": promo_code,
        "discount_percent": camp_in.discount_percent,
        "target_segment": camp_in.target_segment,
        "estimated_reach": "12 inactive/high-risk customers",
        "message": f"🎉 Promotional Coupon '{promo_code}' generated! Discount {camp_in.discount_percent}% OFF ready to send via WhatsApp/SMS."
    }
