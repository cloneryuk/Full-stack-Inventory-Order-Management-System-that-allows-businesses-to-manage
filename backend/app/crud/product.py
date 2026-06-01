from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def create_product(db: Session, product_data: ProductCreate) -> Product:
    """Create a new product. SKU must be unique."""
    existing = db.query(Product).filter(Product.sku == product_data.sku).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product with SKU '{product_data.sku}' already exists."
        )
    product = Product(**product_data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_all_products(db: Session) -> list[Product]:
    """Retrieve all products."""
    return db.query(Product).order_by(Product.id.desc()).all()


def get_product_by_id(db: Session, product_id: int) -> Product:
    """Retrieve a product by ID."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found."
        )
    return product


def update_product(db: Session, product_id: int, product_data: ProductUpdate) -> Product:
    """Update a product. If SKU is changed, it must remain unique."""
    product = get_product_by_id(db, product_id)
    update_dict = product_data.model_dump(exclude_unset=True)

    if "sku" in update_dict and update_dict["sku"] != product.sku:
        existing = db.query(Product).filter(Product.sku == update_dict["sku"]).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Product with SKU '{update_dict['sku']}' already exists."
            )

    for key, value in update_dict.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> dict:
    """Delete a product by ID."""
    product = get_product_by_id(db, product_id)
    db.delete(product)
    db.commit()
    return {"message": f"Product '{product.name}' deleted successfully."}


def get_low_stock_products(db: Session, threshold: int = 10) -> list[Product]:
    """Retrieve products with stock below a threshold."""
    return db.query(Product).filter(Product.quantity < threshold).order_by(Product.quantity.asc()).all()
