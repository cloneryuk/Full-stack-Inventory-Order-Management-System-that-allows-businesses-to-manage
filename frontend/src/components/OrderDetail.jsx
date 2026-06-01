import { useState, useEffect } from 'react';
import { getOrder } from '../api/api';

export default function OrderDetail({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await getOrder(orderId);
        setOrder(res.data);
      } catch (err) {
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>Order #{orderId}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              Loading...
            </div>
          )}

          {error && <div className="message message-error">✕ {error}</div>}

          {order && (
            <>
              <div className="order-detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Customer</span>
                  <span className="detail-value">{order.customer_name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">
                    <span className={`badge ${
                      order.status === 'confirmed' ? 'badge-success' :
                      order.status === 'pending' ? 'badge-warning' : 'badge-primary'
                    }`}>
                      {order.status}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Amount</span>
                  <span className="detail-value">${order.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                Order Items
              </h4>
              <div className="table-container" style={{ boxShadow: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Unit Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                        <td>${item.unit_price.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td style={{ fontWeight: 500 }}>${item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="order-total">
                <span>Total</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
