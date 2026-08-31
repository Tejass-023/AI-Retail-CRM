from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.models import Product, Category, User, StockStatus
from app.schemas.schemas import ProductCreate, ProductUpdate, ProductOut, CategoryOut, CategoryCreate
from app.services.crm_service import CRMService, get_stock_status
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/products", tags=["Products"])

def get_shop_id(current_user: Optional[User]) -> int:
    return current_user.shop_id if (current_user and current_user.shop_id) else 1

@router.get("/categories", response_model=List[CategoryOut])
def list_categories(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    return db.query(Category).filter(Category.shop_id == shop_id).all()

@router.post("/categories", response_model=CategoryOut)
def create_category(
    cat_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    cat = Category(name=cat_in.name, description=cat_in.description, shop_id=shop_id)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.get("", response_model=List[ProductOut])
def list_products(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    stock_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    query = db.query(Product).filter(Product.shop_id == shop_id)

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    if category_id:
        query = query.filter(Product.category_id == category_id)

    products = query.order_by(Product.name.asc()).all()

    result = []
    for p in products:
        status = get_stock_status(p.stock_quantity, p.min_stock_level)
        if stock_filter and stock_filter.upper() != "ALL":
            if status != stock_filter.upper():
                continue
        cat_name = p.category.name if p.category else "General"
        result.append(ProductOut(
            id=p.id,
            name=p.name,
            category_id=p.category_id,
            category_name=cat_name,
            shop_id=p.shop_id,
            price=p.price,
            stock_quantity=p.stock_quantity,
            min_stock_level=p.min_stock_level,
            supplier=p.supplier,
            status=status,
            created_at=p.created_at
        ))
    return result

@router.post("", response_model=ProductOut)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    product = CRMService.create_product(db, product_in, shop_id)
    status = get_stock_status(product.stock_quantity, product.min_stock_level)
    cat_name = product.category.name if product.category else "General"
    return ProductOut(
        id=product.id,
        name=product.name,
        category_id=product.category_id,
        category_name=cat_name,
        shop_id=product.shop_id,
        price=product.price,
        stock_quantity=product.stock_quantity,
        min_stock_level=product.min_stock_level,
        supplier=product.supplier,
        status=status,
        created_at=product.created_at
    )

@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    p = db.query(Product).filter(Product.id == product_id, Product.shop_id == shop_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    status = get_stock_status(p.stock_quantity, p.min_stock_level)
    cat_name = p.category.name if p.category else "General"
    return ProductOut(
        id=p.id,
        name=p.name,
        category_id=p.category_id,
        category_name=cat_name,
        shop_id=p.shop_id,
        price=p.price,
        stock_quantity=p.stock_quantity,
        min_stock_level=p.min_stock_level,
        supplier=p.supplier,
        status=status,
        created_at=p.created_at
    )

@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    p = CRMService.update_product(db, product_id, product_in, shop_id)
    status = get_stock_status(p.stock_quantity, p.min_stock_level)
    cat_name = p.category.name if p.category else "General"
    return ProductOut(
        id=p.id,
        name=p.name,
        category_id=p.category_id,
        category_name=cat_name,
        shop_id=p.shop_id,
        price=p.price,
        stock_quantity=p.stock_quantity,
        min_stock_level=p.min_stock_level,
        supplier=p.supplier,
        status=status,
        created_at=p.created_at
    )

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    shop_id = get_shop_id(current_user)
    p = db.query(Product).filter(Product.id == product_id, Product.shop_id == shop_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(p)
    db.commit()
    return {"message": f"Product '{p.name}' deleted successfully"}
