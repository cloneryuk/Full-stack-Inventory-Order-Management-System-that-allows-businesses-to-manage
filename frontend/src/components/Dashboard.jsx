import { useState, useEffect } from 'react';
import { getDashboardSummary } from '../api/api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await getDashboardSummary();
      setSummary(res.data);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return <div className="message message-error">{error}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary" id="stat-products">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{summary.total_products}</div>
        </div>
        <div className="stat-card success" id="stat-customers">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{summary.total_customers}</div>
        </div>
        <div className="stat-card warning" id="stat-orders">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{summary.total_orders}</div>
        </div>
        <div className="stat-card danger" id="stat-low-stock">
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-value">{summary.low_stock_count}</div>
        </div>
      </div>

      {/* Low Stock Products */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          ⚠️ Low Stock Products (Below 10 units)
        </h3>
        {summary.low_stock_products.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <p>All products are well stocked!</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {summary.low_stock_products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td><code>{product.sku}</code></td>
                    <td>
                      <span className={`badge ${product.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                        {product.quantity} left
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
