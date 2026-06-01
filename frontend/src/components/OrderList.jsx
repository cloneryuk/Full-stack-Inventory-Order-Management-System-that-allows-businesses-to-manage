import { useState, useEffect } from 'react';
import { getOrders, deleteOrder } from '../api/api';
import OrderForm from './OrderForm';
import OrderDetail from './OrderDetail';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOrder(id);
      setSuccess('Order cancelled and stock restored.');
      setDeleteConfirm(null);
      fetchOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cancel order.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleFormClose = (refresh) => {
    setShowForm(false);
    if (refresh) {
      fetchOrders();
      setSuccess('Order created successfully.');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading orders...
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Orders</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          id="btn-create-order"
        >
          + Create Order
        </button>
      </div>

      {success && <div className="message message-success">✓ {success}</div>}
      {error && <div className="message message-error">✕ {error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <p>No orders yet.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Create your first order
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>#{order.id}</td>
                  <td>{order.customer_name}</td>
                  <td style={{ fontWeight: 500 }}>${order.total_amount.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${
                      order.status === 'confirmed' ? 'badge-success' :
                      order.status === 'pending' ? 'badge-warning' : 'badge-primary'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setViewOrder(order.id)}
                        id={`btn-view-order-${order.id}`}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteConfirm(order)}
                        id={`btn-cancel-order-${order.id}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <OrderForm onClose={handleFormClose} />}

      {viewOrder && (
        <OrderDetail orderId={viewOrder} onClose={() => setViewOrder(null)} />
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Cancel Order</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Are you sure you want to cancel <strong>Order #{deleteConfirm.id}</strong>?
                Stock will be restored for all items.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Keep Order</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Cancel Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
