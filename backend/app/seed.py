from datetime import datetime, timedelta
import random
from app.database import Base, engine, SessionLocal
from app.models.models import User, Shop, Category, Product, Customer, Transaction, TransactionItem, Inventory, CustomerSegment, StockStatus
from app.services.auth_service import get_password_hash
from app.services.crm_service import get_stock_status, calculate_customer_segment

def seed_database():
    print("[+] Initializing Database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    print("[+] Creating Default Shop & Owner...")
    shop = Shop(name="Apna Retail Mart", location="FC Road, Pune, Maharashtra")
    db.add(shop)
    db.commit()
    db.refresh(shop)

    owner = User(
        email="owner@apnacrm.com",
        full_name="Rajesh Sharma (Shop Owner)",
        hashed_password=get_password_hash("password123"),
        role="SHOP_OWNER",
        shop_id=shop.id
    )
    db.add(owner)
    db.commit()

    print("[+] Creating Categories...")
    categories_data = [
        {"name": "Electronics", "desc": "Power banks, chargers, audio devices"},
        {"name": "Mobile Accessories", "desc": "Cables, covers, tempered glass"},
        {"name": "Home Appliances", "desc": "Mixers, kettles, irons"},
        {"name": "Lighting", "desc": "LED bulbs, tube lights, smart lamps"},
        {"name": "Smart Devices", "desc": "Smart watches, fitness bands, smart plugs"}
    ]

    cat_objs = {}
    for cdata in categories_data:
        cat = Category(name=cdata["name"], description=cdata["desc"], shop_id=shop.id)
        db.add(cat)
        db.commit()
        db.refresh(cat)
        cat_objs[cdata["name"]] = cat

    print("[+] Creating Products & Initial Stock...")
    products_data = [
        {"name": "Power Bank 20000mAh", "cat": "Electronics", "price": 1499.0, "stock": 25, "min": 20, "supplier": "Anker India"},
        {"name": "Fast Charger 33W", "cat": "Electronics", "price": 799.0, "stock": 45, "min": 15, "supplier": "Xiaomi Tech"},
        {"name": "USB-C Braided Cable", "cat": "Mobile Accessories", "price": 299.0, "stock": 80, "min": 25, "supplier": "Boat India"},
        {"name": "Bluetooth Earphones", "cat": "Electronics", "price": 1299.0, "stock": 12, "min": 15, "supplier": "Realme Retail"},
        {"name": "LED Bulb 12W", "cat": "Lighting", "price": 199.0, "stock": 120, "min": 30, "supplier": "Philips India"},
        {"name": "Smart Watch Pro", "cat": "Smart Devices", "price": 2499.0, "stock": 8, "min": 10, "supplier": "Noise Tech"},
        {"name": "Mixer Grinder 750W", "cat": "Home Appliances", "price": 3199.0, "stock": 6, "min": 8, "supplier": "Bajaj Electricals"},
        {"name": "Electric Kettle 1.5L", "cat": "Home Appliances", "price": 899.0, "stock": 18, "min": 10, "supplier": "Prestige Appliances"},
        {"name": "Smart Plug 16A", "cat": "Smart Devices", "price": 999.0, "stock": 35, "min": 12, "supplier": "Wipro Smart"},
        {"name": "RGB Desk Lamp", "cat": "Lighting", "price": 1199.0, "stock": 5, "min": 10, "supplier": "Havells Light"},
        {"name": "Wireless Bluetooth Speaker", "cat": "Electronics", "price": 1799.0, "stock": 22, "min": 10, "supplier": "JBL Distribution"},
        {"name": "Wireless Mouse", "cat": "Electronics", "price": 499.0, "stock": 50, "min": 15, "supplier": "Logitech India"}
    ]

    prod_objs = []
    for pdata in products_data:
        prod = Product(
            name=pdata["name"],
            category_id=cat_objs[pdata["cat"]].id,
            shop_id=shop.id,
            price=pdata["price"],
            stock_quantity=pdata["stock"],
            min_stock_level=pdata["min"],
            supplier=pdata["supplier"]
        )
        db.add(prod)
        db.commit()
        db.refresh(prod)
        prod_objs.append(prod)

        # Inventory record
        status = get_stock_status(prod.stock_quantity, prod.min_stock_level)
        inv = Inventory(
            product_id=prod.id,
            current_stock=prod.stock_quantity,
            min_stock=prod.min_stock_level,
            predicted_demand=int(prod.stock_quantity * 1.6),
            status=status,
            recommended_reorder=max(0, (prod.min_stock_level * 2) - prod.stock_quantity)
        )
        db.add(inv)
        db.commit()

    print("[+] Creating Indian Retail Customers...")
    customers_raw = [
        {"name": "Rahul Sharma", "phone": "+91 98230 11223", "email": "rahul.sharma@gmail.com", "address": "Kothrud, Pune"},
        {"name": "Priya Patel", "phone": "+91 97112 33445", "email": "priya.patel@yahoo.com", "address": "Viman Nagar, Pune"},
        {"name": "Amit Verma", "phone": "+91 98901 55667", "email": "amit.verma@outlook.com", "address": "Aundh, Pune"},
        {"name": "Neha Kulkarni", "phone": "+91 94220 77889", "email": "neha.kulkarni@gmail.com", "address": "Deccan, Pune"},
        {"name": "Suresh Kumar", "phone": "+91 93710 99001", "email": "suresh.kumar@hotmail.com", "address": "Hadapsar, Pune"},
        {"name": "Ananya Joshi", "phone": "+91 98225 44332", "email": "ananya.j@gmail.com", "address": "Baner, Pune"},
        {"name": "Vikas Deshmukh", "phone": "+91 91580 88776", "email": "vikas.d@gmail.com", "address": "Wakad, Pune"},
        {"name": "Pooja Mehta", "phone": "+91 98765 43210", "email": "pooja.m@gmail.com", "address": "Kalyani Nagar, Pune"},
        {"name": "Rohan Gupta", "phone": "+91 98334 55661", "email": "rohan.g@yahoo.com", "address": "Pimple Saudagar, Pune"},
        {"name": "Sneha Patil", "phone": "+91 94231 66778", "email": "sneha.p@rediffmail.com", "address": "Magarpatta, Pune"}
    ]

    cust_objs = []
    for cinfo in customers_raw:
        cust = Customer(
            name=cinfo["name"],
            phone=cinfo["phone"],
            email=cinfo["email"],
            address=cinfo["address"],
            shop_id=shop.id,
            total_spent=0.0,
            purchase_count=0
        )
        db.add(cust)
        db.commit()
        db.refresh(cust)
        cust_objs.append(cust)

    print("[+] Generating 100+ Transactions across past 8 months...")
    start_date = datetime.utcnow() - timedelta(days=210) # ~7 months ago
    methods = ["CASH", "UPI", "CARD"]

    for day_offset in range(0, 210, 2):
        tx_date = start_date + timedelta(days=day_offset, hours=random.randint(9, 20))
        cust = random.choice(cust_objs)
        num_items = random.randint(1, 3)
        chosen_prods = random.sample(prod_objs, num_items)

        total = 0.0
        tx = Transaction(
            customer_id=cust.id,
            shop_id=shop.id,
            total_amount=0.0,
            payment_method=random.choice(methods),
            created_at=tx_date
        )
        db.add(tx)
        db.commit()
        db.refresh(tx)

        for p in chosen_prods:
            qty = random.randint(1, 4)
            sub = p.price * qty
            total += sub
            item = TransactionItem(
                transaction_id=tx.id,
                product_id=p.id,
                quantity=qty,
                unit_price=p.price,
                subtotal=sub
            )
            db.add(item)

        tx.total_amount = total
        cust.total_spent += total
        cust.purchase_count += 1
        cust.last_purchase_date = max(cust.last_purchase_date or tx_date, tx_date)
        cust.segment = calculate_customer_segment(cust.total_spent, cust.purchase_count, cust.last_purchase_date)

    db.commit()
    print("[SUCCESS] Seed Data successfully created!")

if __name__ == "__main__":
    seed_database()
