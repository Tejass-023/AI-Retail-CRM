from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.models import User
from app.schemas.schemas import ForecastResponse
from app.services.ml_service import MLService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/ai", tags=["AI & Machine Learning"])

def get_shop_id(current_user: Optional[User]) -> int:
    return current_user.shop_id if (current_user and current_user.shop_id) else 1

@router.get("/forecast/{product_id}", response_model=ForecastResponse)
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
