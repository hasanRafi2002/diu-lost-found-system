# import app.models


from app.database.database import SessionLocal
from app.models.category import Category

DEFAULT_CATEGORIES = [
    "Wallet", "Phone", "Laptop", "ID Card", "Book",
    "Bag", "Bottle", "Watch", "Jewelry", "Keys",
    "Electronics", "Others",
]

db = SessionLocal()

for order, name in enumerate(DEFAULT_CATEGORIES):
    exists = db.query(Category).filter(Category.name == name).first()
    if not exists:
        db.add(Category(name=name, display_order=order))

db.commit()
print("Seeded", db.query(Category).count(), "categories")
db.close()
