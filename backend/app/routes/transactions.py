from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.models import Transaction, User
from app.schemas.schemas import TransactionCreate, TransactionOut, TransactionItemOut
from app.services.crm_service import CRMService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

def get_shop_id(current_user: Optional[User]) -> int:
    return current_user.shop_id if (current_user and current_user.shop_id) else 1

@router.get("", response_model=List[TransactionOut])
def list_transactions(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    transactions = db.query(Transaction).filter(Transaction.shop_id == shop_id).order_by(Transaction.created_at.desc()).all()

    result = []
    for tx in transactions:
        items_out = []
        for item in tx.items:
            items_out.append(TransactionItemOut(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name if item.product else "Unknown Product",
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.subtotal
            ))
        result.append(TransactionOut(
            id=tx.id,
            customer_id=tx.customer_id,
            customer_name=tx.customer.name if tx.customer else "Guest Customer",
            shop_id=tx.shop_id,
            total_amount=tx.total_amount,
            payment_method=tx.payment_method,
            created_at=tx.created_at,
            items=items_out
        ))
    return result

@router.post("", response_model=TransactionOut)
def create_transaction(
    tx_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    tx = CRMService.process_transaction(db, tx_in, shop_id)
    
    items_out = []
    for item in tx.items:
        items_out.append(TransactionItemOut(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product.name if item.product else "Unknown Product",
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=item.subtotal
        ))

    return TransactionOut(
        id=tx.id,
        customer_id=tx.customer_id,
        customer_name=tx.customer.name if tx.customer else "Guest Customer",
        shop_id=tx.shop_id,
        total_amount=tx.total_amount,
        payment_method=tx.payment_method,
        created_at=tx.created_at,
        items=items_out
    )

@router.get("/{tx_id}", response_model=TransactionOut)
def get_transaction(
    tx_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.shop_id == shop_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    items_out = []
    for item in tx.items:
        items_out.append(TransactionItemOut(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product.name if item.product else "Unknown Product",
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=item.subtotal
        ))

    return TransactionOut(
        id=tx.id,
        customer_id=tx.customer_id,
        customer_name=tx.customer.name if tx.customer else "Guest Customer",
        shop_id=tx.shop_id,
        total_amount=tx.total_amount,
        payment_method=tx.payment_method,
        created_at=tx.created_at,
        items=items_out
    )
