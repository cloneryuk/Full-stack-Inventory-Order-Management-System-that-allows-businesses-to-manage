import { useState, useEffect } from 'react';
import { getProducts, deleteProduct } from '../api/api';
import ProductForm from './ProductForm';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setSuccess('Product deleted successfully.');
      setDeleteConfirm(null);
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete product.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleFormClose = (refresh) => {
    setShowForm(false);
    setEditProduct(null);
    if (refresh) {
      fetchProducts();
      setSuccess(editProduct ? 'Product updated successfully.' : 'Product created successfully.');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const getStockBadge = (qty) => {
    if (qty === 0) return <span className="badge badge-danger">Out of stock</span>;
    if (qty < 10) return <span className="badge badge-warning">{qty} left</span>;
    return <span className="badge badge-success">{qty} in stock</span>;
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading products...
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Products</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          id="btn-add-product"
        >
          + Add Product
        </button>
      </div>

      {success && <div className="message message-success">✓ {success}</div>}
      {error && <div className="message message-error">✕ {error}</div>}

      {/* Search */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="search-products"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>No products found.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Add your first product
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td style={{ fontWeight: 500 }}>{product.name}</td>
                  <td><code>{product.sku}</code></td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{getStockBadge(product.quantity)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setEditProduct(product);
                          setShowForm(true);
                        }}
                        id={`btn-edit-product-${product.id}`}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteConfirm(product)}
                        id={`btn-delete-product-${product.id}`}
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

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editProduct}
          onClose={handleFormClose}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
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
