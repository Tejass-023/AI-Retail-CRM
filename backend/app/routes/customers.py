from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.models import Customer, Transaction, TransactionItem, Product, User
from app.schemas.schemas import CustomerCreate, CustomerUpdate, CustomerOut, TransactionOut
from app.services.crm_service import CRMService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/customers", tags=["Customers"])

def get_shop_id(current_user: Optional[User]) -> int:
    return current_user.shop_id if (current_user and current_user.shop_id) else 1

@router.get("", response_model=List[CustomerOut])
def list_customers(
    search: Optional[str] = None,
    segment: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    query = db.query(Customer).filter(Customer.shop_id == shop_id)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Customer.name.ilike(search_pattern)) | 
            (Customer.email.ilike(search_pattern)) | 
            (Customer.phone.ilike(search_pattern))
        )

    if segment and segment.upper() != "ALL":
        query = query.filter(Customer.segment == segment.upper())

    return query.order_by(Customer.created_at.desc()).all()

@router.post("", response_model=CustomerOut)
def create_customer(
    customer_in: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    return CRMService.create_customer(db, customer_in, shop_id)

@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    customer = db.query(Customer).filter(Customer.id == customer_id, Customer.shop_id == shop_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(
    customer_id: int,
    customer_in: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    return CRMService.update_customer(db, customer_id, customer_in, shop_id)

@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    customer = db.query(Customer).filter(Customer.id == customer_id, Customer.shop_id == shop_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db.delete(customer)
    db.commit()
    return {"message": f"Customer '{customer.name}' deleted successfully"}

@router.get("/{customer_id}/purchases")
def get_customer_purchases(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    customer = db.query(Customer).filter(Customer.id == customer_id, Customer.shop_id == shop_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    transactions = db.query(Transaction).filter(Transaction.customer_id == customer_id, Transaction.shop_id == shop_id).order_by(Transaction.created_at.desc()).all()

    history = []
    for tx in transactions:
        for item in tx.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            history.append({
                "transaction_id": tx.id,
                "date": tx.created_at.strftime("%Y-%m-%d %H:%M"),
                "product_name": product.name if product else "Product",
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "amount": item.subtotal,
                "payment_method": tx.payment_method
            })

    # Basic recommendation logic for cross-selling
    recommended_product = "Fast Chargers & Mobile Accessories"
    if customer.total_spent > 15000:
        recommended_product = "Smart Watches & Home Appliances"

    return {
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "segment": customer.segment,
            "total_spent": customer.total_spent,
            "purchase_count": customer.purchase_count,
            "last_purchase_date": customer.last_purchase_date
        },
        "lifetime_value": round(customer.total_spent * 1.25, 2),
        "recommended_cross_sell": f"Customer may be interested in {recommended_product}.",
        "purchase_history": history
    }
