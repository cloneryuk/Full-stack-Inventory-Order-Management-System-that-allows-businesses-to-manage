from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate


def create_customer(db: Session, customer_data: CustomerCreate) -> Customer:
    """Create a new customer. Email must be unique."""
    existing = db.query(Customer).filter(Customer.email == customer_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Customer with email '{customer_data.email}' already exists."
        )
    customer = Customer(**customer_data.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def get_all_customers(db: Session) -> list[Customer]:
    """Retrieve all customers."""
    return db.query(Customer).order_by(Customer.id.desc()).all()


def get_customer_by_id(db: Session, customer_id: int) -> Customer:
    """Retrieve a customer by ID."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found."
        )
    return customer


def delete_customer(db: Session, customer_id: int) -> dict:
    """Delete a customer by ID."""
    customer = get_customer_by_id(db, customer_id)
    db.delete(customer)
    db.commit()
    return {"message": f"Customer '{customer.full_name}' deleted successfully."}
