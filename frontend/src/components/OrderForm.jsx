import { useState, useEffect } from 'react';
import { getCustomers, getProducts, createOrder } from '../api/api';

export default function OrderForm({ onClose }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([getCustomers(), getProducts()]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        setError('Failed to load customers or products.');
      }
    };
    fetchData();
  }, []);

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const getTotal = () => {
    let total = 0;
    for (const item of items) {
      const product = products.find((p) => p.id === parseInt(item.product_id));
      if (product) {
        total += product.price * item.quantity;
      }
    }
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerId) return setError('Please select a customer.');
    if (items.some((item) => !item.product_id)) return setError('Please select a product for each item.');
    if (items.some((item) => item.quantity < 1)) return setError('Quantity must be at least 1.');

    const payload = {
      customer_id: parseInt(customerId),
      items: items.map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
      })),
    };

    try {
      setSubmitting(true);
      await createOrder(payload);
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>Create Order</h3>
          <button className="modal-close" onClick={() => onClose(false)}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="message message-error">✕ {error}</div>}

            {/* Customer Selection */}
            <div className="form-group">
              <label htmlFor="order-customer">Customer *</label>
              <select
                id="order-customer"
                className="form-control"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Order Items */}
            <div className="order-items-section">
              <h4>Order Items</h4>
              {items.map((item, index) => (
                <div className="order-item-row" key={index}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <select
                      className="form-control"
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                      id={`order-product-${index}`}
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ${p.price.toFixed(2)} ({p.quantity} avail.)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      id={`order-qty-${index}`}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={addItem}
                style={{ marginTop: '4px' }}
                id="btn-add-order-item"
              >
                + Add Item
              </button>
            </div>

            {/* Total */}
            <div className="order-total">
              <span>Estimated Total</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => onClose(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
