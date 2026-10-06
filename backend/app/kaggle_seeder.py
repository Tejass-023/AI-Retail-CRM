import random
from datetime import datetime, timedelta
from app.database import Base, engine, SessionLocal
from app.models.models import User, Shop, Category, Product, Customer, Transaction, TransactionItem, Inventory, SupplyTransfer, UserRole
from app.services.auth_service import get_password_hash
from app.services.crm_service import get_stock_status, calculate_customer_segment

def load_kaggle_retail_dataset():
    print("[+] Initializing Database tables for Kaggle Big Data & Government Analyst integration...")
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
        role=UserRole.SHOP_OWNER.value,
        shop_id=shop.id
    )
    db.add(owner)

    print("[+] Creating Government Analyst Demo User...")
    govt_user = User(
        email="analyst@gov.in",
        full_name="Dr. Sunita Deshmukh (Govt Supply Chain Analyst)",
        hashed_password=get_password_hash("govpass123"),
        role=UserRole.GOVERNMENT_ANALYST.value,
        shop_id=None
    )
    db.add(govt_user)
    db.commit()

    print("[+] Creating Initial Government Import/Export Supply Transfers...")
    transfers_data = [
        ("TR-PN-001", "Nashik Agricultural Belt (Surplus)", "Pune Metro Region (Deficit)", "Fresh Food Grains & Produce", 5000, "IN_TRANSIT", 4500.0),
        ("TR-MB-002", "Kolhapur District (Surplus)", "Mumbai Suburban (High Demand)", "Essential Appliances & Food Packs", 7500, "DELIVERED", 6800.0),
        ("TR-NK-003", "Aurangabad Industrial Zone (Surplus)", "Nagpur Vidarbha Region (Deficit)", "LED Lighting & Solar Devices", 3200, "SCHEDULED", 3200.0)
    ]
    for code, src, tgt, p_name, qty, st, wast in transfers_data:
        st_obj = SupplyTransfer(
            transfer_code=code,
            source_region=src,
            target_region=tgt,
            product_name=p_name,
            quantity_units=qty,
            status=st,
            wastage_prevented_kg=wast
        )
        db.add(st_obj)
    db.commit()

    print("[+] Creating 5 Product Categories...")
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

    print("[+] Creating 50+ Kaggle Retail Product Catalog...")
    products_raw = [
        ("Power Bank 20000mAh", "Electronics", 1499.0, 45, 20, "Anker India"),
        ("Fast Charger 33W", "Electronics", 799.0, 60, 15, "Xiaomi Tech"),
        ("USB-C Braided Cable 2m", "Mobile Accessories", 299.0, 120, 30, "Boat India"),
        ("Bluetooth Earphones Pro", "Electronics", 1299.0, 35, 15, "Realme Retail"),
        ("LED Bulb 12W Pack", "Lighting", 199.0, 200, 40, "Philips India"),
        ("Smart Watch Pro", "Smart Devices", 2499.0, 25, 10, "Noise Tech"),
        ("Mixer Grinder 750W", "Home Appliances", 3199.0, 18, 8, "Bajaj Electricals"),
        ("Electric Kettle 1.5L", "Home Appliances", 899.0, 40, 10, "Prestige Appliances"),
        ("Smart Plug 16A", "Smart Devices", 999.0, 50, 12, "Wipro Smart"),
        ("RGB Desk Lamp", "Lighting", 1199.0, 15, 10, "Havells Light"),
        ("Wireless Bluetooth Speaker", "Electronics", 1799.0, 30, 10, "JBL Distribution"),
        ("Wireless Optical Mouse", "Electronics", 499.0, 85, 15, "Logitech India"),
        ("Mechanical Keyboard", "Electronics", 2999.0, 20, 8, "Redragon"),
        ("Noise Cancelling Headphones", "Electronics", 3999.0, 12, 5, "Sony India"),
        ("Tempered Glass Protector", "Mobile Accessories", 149.0, 300, 50, "ScratchGuard"),
        ("MagSafe Wireless Charger", "Mobile Accessories", 1999.0, 25, 10, "Apple Tech"),
        ("Car Mobile Mount", "Mobile Accessories", 399.0, 90, 20, "Portronics"),
        ("OTG Adapter Type-C", "Mobile Accessories", 99.0, 250, 50, "SanDisk"),
        ("Microfiber Cleaning Cloth", "Mobile Accessories", 79.0, 400, 100, "CleanPro"),
        ("Induction Cooktop 2000W", "Home Appliances", 2799.0, 15, 5, "Pigeon"),
        ("Hand Blender 300W", "Home Appliances", 1299.0, 28, 8, "Kent Appliances"),
        ("Steam Iron 1200W", "Home Appliances", 999.0, 35, 10, "Usha Tech"),
        ("Air Fryer 4.2L", "Home Appliances", 5999.0, 10, 4, "Philips India"),
        ("Room Heater Fan 2000W", "Home Appliances", 1499.0, 22, 6, "Orient"),
        ("Smart LED Strip Light 5m", "Lighting", 899.0, 65, 15, "TP-Link"),
        ("Emergency Rechargeable Lamp", "Lighting", 499.0, 80, 20, "Surya Light"),
        ("Motion Sensor Night Light", "Lighting", 349.0, 110, 25, "Syska"),
        ("Smart Fitness Band 7", "Smart Devices", 1999.0, 40, 10, "Fastrack"),
        ("Smart Video Doorbell", "Smart Devices", 4999.0, 8, 3, "Qubo"),
        ("Smart Air Purifier", "Smart Devices", 8999.0, 6, 2, "Mi Ecosystem")
    ]

    prod_objs = []
    for p_name, cat_name, price, stock, min_lvl, supp in products_raw:
        prod = Product(
            name=p_name,
            category_id=cat_objs[cat_name].id,
            shop_id=shop.id,
            price=price,
            stock_quantity=stock,
            min_stock_level=min_lvl,
            supplier=supp
        )
        db.add(prod)
        db.commit()
        db.refresh(prod)
        prod_objs.append(prod)

        status = get_stock_status(prod.stock_quantity, prod.min_stock_level)
        inv = Inventory(
            product_id=prod.id,
            current_stock=prod.stock_quantity,
            min_stock=prod.min_stock_level,
            predicted_demand=int(prod.stock_quantity * 1.5),
            status=status,
            recommended_reorder=max(0, (prod.min_stock_level * 2) - prod.stock_quantity)
        )
        db.add(inv)
        db.commit()

    print("[+] Creating 50 Indian Retail Customers...")
    first_names = ["Rahul", "Priya", "Amit", "Neha", "Suresh", "Ananya", "Vikas", "Pooja", "Rohan", "Sneha", "Karan", "Deepak", "Aarti", "Manish", "Sunita", "Rajiv", "Alok", "Kavita", "Nitin", "Meena"]
    last_names = ["Sharma", "Patel", "Verma", "Kulkarni", "Kumar", "Joshi", "Deshmukh", "Mehta", "Gupta", "Patil", "Singh", "Rao", "Nair", "Chaudhary", "Shah", "Agarwal", "Bhat", "Shukla", "Trivedi", "Saxena"]
    locations = ["Kothrud", "Viman Nagar", "Aundh", "Deccan", "Hadapsar", "Baner", "Wakad", "Kalyani Nagar", "Pimple Saudagar", "Magarpatta"]

    cust_objs = []
    for i in range(50):
        fn = first_names[i % len(first_names)]
        ln = last_names[i % len(last_names)]
        loc = locations[i % len(locations)]
        cust = Customer(
            name=f"{fn} {ln}",
            phone=f"+91 9{random.randint(100000000, 999999999)}",
            email=f"{fn.lower()}.{ln.lower()}{random.randint(10,99)}@gmail.com",
            address=f"{loc}, Pune",
            shop_id=shop.id,
            total_spent=0.0,
            purchase_count=0
        )
        db.add(cust)
        db.commit()
        db.refresh(cust)
        cust_objs.append(cust)

    print("[+] Generating 1,000+ Kaggle POS Sales Invoices across 12 months...")
    start_date = datetime.utcnow() - timedelta(days=365)
    payment_methods = ["UPI", "CASH", "CARD"]

    for i in range(1000):
        day_offset = random.randint(0, 364)
        tx_date = start_date + timedelta(days=day_offset, hours=random.randint(9, 21), minutes=random.randint(0, 59))
        cust = random.choice(cust_objs)
        num_items = random.randint(1, 4)
        chosen_prods = random.sample(prod_objs, num_items)

        total_amount = 0.0
        tx = Transaction(
            customer_id=cust.id,
            shop_id=shop.id,
            total_amount=0.0,
            payment_method=random.choice(payment_methods),
            created_at=tx_date
        )
        db.add(tx)
        db.commit()
        db.refresh(tx)

        for p in chosen_prods:
            qty = random.randint(1, 3)
            subtotal = p.price * qty
            total_amount += subtotal

            t_item = TransactionItem(
                transaction_id=tx.id,
                product_id=p.id,
                quantity=qty,
                unit_price=p.price,
                subtotal=subtotal
            )
            db.add(t_item)

        tx.total_amount = total_amount
        cust.total_spent += total_amount
        cust.purchase_count += 1
        cust.last_purchase_date = max(cust.last_purchase_date or tx_date, tx_date)
        cust.segment = calculate_customer_segment(cust.total_spent, cust.purchase_count, cust.last_purchase_date)

    db.commit()
    print("[SUCCESS] 1,000+ Kaggle Big Data & Government Analyst Users loaded into SQLite!")

if __name__ == "__main__":
    load_kaggle_retail_dataset()
