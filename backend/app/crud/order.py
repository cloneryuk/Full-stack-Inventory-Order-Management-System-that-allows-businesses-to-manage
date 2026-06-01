from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate


def create_order(db: Session, order_data: OrderCreate) -> Order:
    """
    Create a new order.
    - Validates customer exists
    - Validates each product exists and has sufficient stock
    - Auto-deducts stock from products
    - Auto-calculates total_amount
    """
    # Validate customer exists
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {order_data.customer_id} not found."
        )

    # Validate products and stock
    order_items = []
    total_amount = 0.0

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} not found."
            )
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}"
            )

        subtotal = product.price * item.quantity
        total_amount += subtotal

        order_items.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.price,
            "subtotal": subtotal,
        })

    # Create the order
    order = Order(
        customer_id=order_data.customer_id,
        total_amount=round(total_amount, 2),
        status="confirmed",
    )
    db.add(order)
    db.flush()  # Get the order ID without committing

    # Create order items and deduct stock
    for item_data in order_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            subtotal=item_data["subtotal"],
        )
        db.add(order_item)

        # Deduct stock
        item_data["product"].quantity -= item_data["quantity"]

    db.commit()
    db.refresh(order)
    return order


def get_all_orders(db: Session) -> list[dict]:
    """Retrieve all orders with customer name."""
    orders = db.query(Order).order_by(Order.id.desc()).all()
    result = []
    for order in orders:
        result.append({
            "id": order.id,
            "customer_id": order.customer_id,
            "customer_name": order.customer.full_name if order.customer else "Unknown",
            "total_amount": order.total_amount,
            "status": order.status,
            "created_at": order.created_at,
            "items": [],
        })
    return result


def get_order_by_id(db: Session, order_id: int) -> dict:
    """Retrieve an order by ID with full details."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found."
        )

    items = []
    for item in order.items:
        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product.name if item.product else "Unknown",
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "subtotal": item.subtotal,
        })

    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "customer_name": order.customer.full_name if order.customer else "Unknown",
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at,
        "items": items,
    }


def delete_order(db: Session, order_id: int) -> dict:
    """
    Delete/cancel an order.
    Restores stock for each order item.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found."
        )

    # Restore stock
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.quantity += item.quantity

    db.delete(order)
    db.commit()
    return {"message": f"Order #{order_id} cancelled and stock restored."}
