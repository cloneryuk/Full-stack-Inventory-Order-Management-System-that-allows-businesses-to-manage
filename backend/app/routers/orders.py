from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.order import OrderCreate, OrderResponse
from app.crud import order as order_crud

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", status_code=201)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order. Validates stock and auto-deducts inventory."""
    order = order_crud.create_order(db, order_data)
    return order_crud.get_order_by_id(db, order.id)


@router.get("/")
def get_all_orders(db: Session = Depends(get_db)):
    """Retrieve all orders."""
    return order_crud.get_all_orders(db)


@router.get("/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Retrieve an order by ID with full details."""
    return order_crud.get_order_by_id(db, order_id)


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Cancel/delete an order and restore stock."""
    return order_crud.delete_order(db, order_id)
