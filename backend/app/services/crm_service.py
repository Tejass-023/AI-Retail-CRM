from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from app.models.models import Customer, Product, Transaction, TransactionItem, Inventory, Shop, CustomerSegment, StockStatus
from app.schemas.schemas import CustomerCreate, CustomerUpdate, ProductCreate, ProductUpdate, TransactionCreate

def get_stock_status(quantity: int, min_level: int) -> str:
    if quantity <= 0:
        return StockStatus.OUT_OF_STOCK.value
    elif quantity <= min_level:
        return StockStatus.LOW_STOCK.value
    return StockStatus.IN_STOCK.value

def calculate_customer_segment(total_spent: float, purchase_count: int, last_purchase_date: datetime) -> str:
    if total_spent >= 20000 or purchase_count >= 10:
        return CustomerSegment.HIGH_VALUE.value
    elif total_spent >= 5000 or purchase_count >= 3:
        return CustomerSegment.REGULAR.value
    elif purchase_count >= 1:
        return CustomerSegment.OCCASIONAL.value
    return CustomerSegment.INACTIVE.value

class CRMService:

    @staticmethod
    def create_customer(db: Session, customer_in: CustomerCreate, shop_id: int) -> Customer:
        customer = Customer(
            name=customer_in.name,
            phone=customer_in.phone,
            email=customer_in.email,
            address=customer_in.address,
            shop_id=shop_id,
            total_spent=0.0,
            purchase_count=0,
            segment=CustomerSegment.OCCASIONAL.value
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def update_customer(db: Session, customer_id: int, customer_in: CustomerUpdate, shop_id: int) -> Customer:
        customer = db.query(Customer).filter(Customer.id == customer_id, Customer.shop_id == shop_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        if customer_in.name is not None: customer.name = customer_in.name
        if customer_in.phone is not None: customer.phone = customer_in.phone
        if customer_in.email is not None: customer.email = customer_in.email
        if customer_in.address is not None: customer.address = customer_in.address

        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def create_product(db: Session, product_in: ProductCreate, shop_id: int) -> Product:
        product = Product(
            name=product_in.name,
            category_id=product_in.category_id,
            shop_id=shop_id,
            price=product_in.price,
            stock_quantity=product_in.stock_quantity,
            min_stock_level=product_in.min_stock_level,
            supplier=product_in.supplier
        )
        db.add(product)
        db.commit()
        db.refresh(product)

        # Create corresponding Inventory entry
        status = get_stock_status(product.stock_quantity, product.min_stock_level)
        inventory = Inventory(
            product_id=product.id,
            current_stock=product.stock_quantity,
            min_stock=product.min_stock_level,
            predicted_demand=int(product.stock_quantity * 1.5),
            status=status,
            recommended_reorder=max(0, (product.min_stock_level * 2) - product.stock_quantity)
        )
        db.add(inventory)
        db.commit()

        return product

    @staticmethod
    def update_product(db: Session, product_id: int, product_in: ProductUpdate, shop_id: int) -> Product:
        product = db.query(Product).filter(Product.id == product_id, Product.shop_id == shop_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        if product_in.name is not None: product.name = product_in.name
        if product_in.category_id is not None: product.category_id = product_in.category_id
        if product_in.price is not None: product.price = product_in.price
        if product_in.stock_quantity is not None: product.stock_quantity = product_in.stock_quantity
        if product_in.min_stock_level is not None: product.min_stock_level = product_in.min_stock_level
        if product_in.supplier is not None: product.supplier = product_in.supplier

        # Update Inventory status
        if product.inventory:
            product.inventory.current_stock = product.stock_quantity
            product.inventory.min_stock = product.min_stock_level
            product.inventory.status = get_stock_status(product.stock_quantity, product.min_stock_level)
            product.inventory.recommended_reorder = max(0, (product.min_stock_level * 2) - product.stock_quantity)

        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def process_transaction(db: Session, tx_in: TransactionCreate, shop_id: int) -> Transaction:
        customer = db.query(Customer).filter(Customer.id == tx_in.customer_id, Customer.shop_id == shop_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        if not tx_in.items:
            raise HTTPException(status_code=400, detail="Transaction must include at least one item")

        total_amount = 0.0
        tx_items = []

        # Validate stock availability and calculate total
        for item_in in tx_in.items:
            product = db.query(Product).filter(Product.id == item_in.product_id, Product.shop_id == shop_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product ID {item_in.product_id} not found")
            
            if product.stock_quantity < item_in.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for '{product.name}'. Available: {product.stock_quantity}, Requested: {item_in.quantity}"
                )

            subtotal = product.price * item_in.quantity
            total_amount += subtotal

            # Deduct stock
            product.stock_quantity -= item_in.quantity

            # Update associated Inventory record
            if product.inventory:
                product.inventory.current_stock = product.stock_quantity
                product.inventory.status = get_stock_status(product.stock_quantity, product.min_stock_level)
                product.inventory.recommended_reorder = max(0, (product.min_stock_level * 2) - product.stock_quantity)

            tx_items.append({
                "product_id": product.id,
                "quantity": item_in.quantity,
                "unit_price": product.price,
                "subtotal": subtotal
            })

        # Save Transaction
        transaction = Transaction(
            customer_id=customer.id,
            shop_id=shop_id,
            total_amount=total_amount,
            payment_method=tx_in.payment_method or "CASH",
            created_at=datetime.utcnow()
        )
        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        # Save Transaction Items
        for item_data in tx_items:
            t_item = TransactionItem(
                transaction_id=transaction.id,
                product_id=item_data["product_id"],
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                subtotal=item_data["subtotal"]
            )
            db.add(t_item)

        # Update Customer purchase metrics & segment
        customer.total_spent += total_amount
        customer.purchase_count += 1
        customer.last_purchase_date = datetime.utcnow()
        customer.segment = calculate_customer_segment(customer.total_spent, customer.purchase_count, customer.last_purchase_date)

        db.commit()
        db.refresh(transaction)
        return transaction
