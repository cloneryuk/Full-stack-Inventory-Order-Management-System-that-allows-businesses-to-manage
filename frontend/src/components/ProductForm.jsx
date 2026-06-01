import { useState } from 'react';
import { createProduct, updateProduct } from '../api/api';

export default function ProductForm({ product, onClose }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    price: product?.price ?? '',
    quantity: product?.quantity ?? '',
    description: product?.description || '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.name.trim()) return setError('Product name is required.');
    if (!form.sku.trim()) return setError('SKU is required.');
    if (form.price === '' || Number(form.price) < 0) return setError('Price must be 0 or greater.');
    if (form.quantity === '' || Number(form.quantity) < 0) return setError('Quantity must be 0 or greater.');

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
      description: form.description.trim(),
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{isEdit ? 'Edit Product' : 'Add Product'}</h3>
          <button className="modal-close" onClick={() => onClose(false)}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="message message-error">✕ {error}</div>}

            <div className="form-group">
              <label htmlFor="product-name">Product Name *</label>
              <input
                id="product-name"
                name="name"
                className="form-control"
                placeholder="Enter product name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="product-sku">SKU / Code *</label>
                <input
                  id="product-sku"
                  name="sku"
                  className="form-control"
                  placeholder="e.g. PRD-001"
                  value={form.sku}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="product-price">Price ($) *</label>
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  placeholder="0.00"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="product-quantity">Quantity in Stock *</label>
              <input
                id="product-quantity"
                name="quantity"
                type="number"
                min="0"
                className="form-control"
                placeholder="0"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="product-description">Description</label>
              <input
                id="product-description"
                name="description"
                className="form-control"
                placeholder="Optional product description"
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => onClose(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
