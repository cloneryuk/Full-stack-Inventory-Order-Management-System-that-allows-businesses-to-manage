import { useState, useEffect } from 'react';
import { getCustomers, deleteCustomer } from '../api/api';
import CustomerForm from './CustomerForm';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (err) {
      setError('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomer(id);
      setSuccess('Customer deleted successfully.');
      setDeleteConfirm(null);
      fetchCustomers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete customer.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleFormClose = (refresh) => {
    setShowForm(false);
    if (refresh) {
      fetchCustomers();
      setSuccess('Customer created successfully.');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading customers...
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Customers</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          id="btn-add-customer"
        >
          + Add Customer
        </button>
      </div>

      {success && <div className="message message-success">✓ {success}</div>}
      {error && <div className="message message-error">✕ {error}</div>}

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="search-customers"
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p>No customers found.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Add your first customer
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td style={{ fontWeight: 500 }}>{customer.full_name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteConfirm(customer)}
                        id={`btn-delete-customer-${customer.id}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <CustomerForm onClose={handleFormClose} />}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Are you sure you want to delete <strong>{deleteConfirm.full_name}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
