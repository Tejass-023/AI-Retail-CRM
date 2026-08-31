from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.models import Product, Inventory, User
from app.schemas.schemas import InventoryOut
from app.services.crm_service import get_stock_status
from app.services.ml_service import MLService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

def get_shop_id(current_user: Optional[User]) -> int:
    return current_user.shop_id if (current_user and current_user.shop_id) else 1

@router.get("", response_model=List[InventoryOut])
def get_inventory_status(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    products = db.query(Product).filter(Product.shop_id == shop_id).all()

    result = []
    for p in products:
        forecast = MLService.forecast_product_demand(db, p.id)
        predicted_demand = forecast["predicted_next_month_demand"] if forecast else int(p.stock_quantity * 1.4)
        recommended_reorder = forecast["recommended_reorder_quantity"] if forecast else max(0, (p.min_stock_level * 2) - p.stock_quantity)

        status = get_stock_status(p.stock_quantity, p.min_stock_level)

        if status_filter and status_filter.upper() != "ALL":
            if status != status_filter.upper():
                continue

        cat_name = p.category.name if p.category else "General"

        result.append(InventoryOut(
            id=p.id,
            product_id=p.id,
            product_name=p.name,
            category_name=cat_name,
            current_stock=p.stock_quantity,
            min_stock=p.min_stock_level,
            predicted_demand=predicted_demand,
            status=status,
            recommended_reorder=recommended_reorder
        ))
    return result

@router.get("/alerts")
def get_inventory_alerts(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    products = db.query(Product).filter(Product.shop_id == shop_id, Product.stock_quantity <= Product.min_stock_level).all()

    alerts = []
    for p in products:
        forecast = MLService.forecast_product_demand(db, p.id)
        predicted_demand = forecast["predicted_next_month_demand"] if forecast else int(p.stock_quantity * 1.5)
        recommended_reorder = forecast["recommended_reorder_quantity"] if forecast else max(0, (p.min_stock_level * 2) - p.stock_quantity)

        alerts.append({
            "product_id": p.id,
            "product_name": p.name,
            "current_stock": p.stock_quantity,
            "min_stock": p.min_stock_level,
            "predicted_demand": predicted_demand,
            "recommended_reorder": recommended_reorder,
            "message": f"⚠ Warning: '{p.name}' stock ({p.stock_quantity}) is at or below minimum threshold ({p.min_stock_level}). Reorder recommended."
        })
    return alerts
