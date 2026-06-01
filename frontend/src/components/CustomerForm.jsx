import { useState } from 'react';
import { createCustomer } from '../api/api';

export default function CustomerForm({ onClose }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.full_name.trim()) return setError('Full name is required.');
    if (!form.email.trim()) return setError('Email is required.');
    if (!form.phone.trim()) return setError('Phone number is required.');

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    };

    try {
      setSubmitting(true);
      await createCustomer(payload);
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
          <h3>Add Customer</h3>
          <button className="modal-close" onClick={() => onClose(false)}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="message message-error">✕ {error}</div>}

            <div className="form-group">
              <label htmlFor="customer-name">Full Name *</label>
              <input
                id="customer-name"
                name="full_name"
                className="form-control"
                placeholder="Enter full name"
                value={form.full_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="customer-email">Email Address *</label>
              <input
                id="customer-email"
                name="email"
                type="email"
                className="form-control"
                placeholder="email@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="customer-phone">Phone Number *</label>
              <input
                id="customer-phone"
                name="phone"
                className="form-control"
                placeholder="e.g. +1 234 567 8900"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => onClose(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
