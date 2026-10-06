from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.models import User
from app.services.govt_service import GovtService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/govt", tags=["Government Analyst Intelligence"])

class SupplyTransferIn(BaseModel):
    source_region: str
    target_region: str
    product_name: str
    quantity_units: int

@router.get("/dashboard")
def get_govt_dashboard(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    return GovtService.get_govt_dashboard_metrics(db)

@router.get("/regional-demand")
def get_regional_demand(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    return GovtService.get_regional_demand_surges(db)

@router.get("/supply-transfers")
def get_supply_transfers(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    return GovtService.get_supply_transfers(db)

@router.post("/supply-transfers")
def create_supply_transfer(
    transfer_in: SupplyTransferIn,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    return GovtService.create_supply_transfer(db, transfer_in.dict())
