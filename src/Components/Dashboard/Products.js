import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { listProducts, setProductActive } from '../../APIs/index';
import { getCategories } from '../../APIs/categoryApi';
import TableComp from '../Table';
import DashboardPagination from './DashboardPagination';

const PAGE_SIZE = 10;

function formatCategoryNames(categories) {
  if (!Array.isArray(categories) || !categories.length) return '—';
  return categories.map((c) => (typeof c === 'object' && c?.name ? c.name : c)).filter(Boolean).join(', ') || '—';
}

function isProductActive(row) {
  return row?.isActive !== false;
}

function Products({ onEdit }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listProducts({
        includeInactive: true,
        categoryId: categoryFilter || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setProducts(data?.products || []);
      setTotalPages(data?.totalPages ?? 1);
      setTotalCount(data?.totalCount ?? 0);
      if (data?.page) setPage(data.page);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  const handleActiveToggle = async (row) => {
    const productId = row?.productId;
    if (productId == null || togglingId != null) return;
    const nextActive = !isProductActive(row);
    setTogglingId(productId);
    try {
      await setProductActive(productId, nextActive);
      setProducts((prev) =>
        prev.map((p) => (p.productId === productId ? { ...p, isActive: nextActive } : p))
      );
    } catch (err) {
      window.alert(err?.response?.data?.message || err?.message || 'Could not update product status.');
    } finally {
      setTogglingId(null);
    }
  };

  const productColumns = [
    { key: 'productId', label: 'Product ID' },
    {
      key: 'photos',
      label: 'Photo',
      format: (photos, row) => {
        const src = (Array.isArray(photos) && photos[0]) || row?.imageUrl || null;
        if (!src) return '—';
        const id = row?.productId;
        if (id == null) return <img src={src} alt="" className="dashboard-thumb" />;
        return (
          <Link
            to={`/product/${id}`}
            className="dashboard-product-thumb-link"
            aria-label={`View ${row.name || 'product'} details`}
          >
            <img src={src} alt="" className="dashboard-thumb" />
          </Link>
        );
      },
    },
    { key: 'name', label: 'Name' },
    {
      key: 'category',
      label: 'Categories',
      format: (_value, row) => formatCategoryNames(row.category),
    },
    { key: 'price', label: 'Price' },
    { key: 'minDaysToDispatch', label: 'Min days to dispatch' },
    {
      key: 'actions',
      label: 'Actions',
      format: (_value, row) => (
        <Button type="button" size="sm" variant="outline-primary" onClick={() => onEdit?.(row)}>
          Edit
        </Button>
      ),
    },
    {
      key: 'isActive',
      label: 'Active',
      format: (_value, row) => {
        const active = isProductActive(row);
        const id = row?.productId;
        const busy = togglingId === id;
        return (
          <Form.Check
            type="switch"
            id={`product-active-${id}`}
            label={active ? 'Active' : 'Inactive'}
            checked={active}
            disabled={busy}
            onChange={() => handleActiveToggle(row)}
            className="dashboard-product-active-switch"
          />
        );
      },
    },
  ];

  return (
    <div className="dashboard-panel" style={{ overflowX: 'auto' }}>
      <div className="dashboard-products-toolbar">
        <h4 className="mb-0">All products</h4>
        <Form.Group className="dashboard-products-filter mb-0">
          <Form.Label htmlFor="dashboard-product-category-filter" className="catalogue-filter-label">
            Category
          </Form.Label>
          <Form.Select
            id="dashboard-product-category-filter"
            value={categoryFilter}
            onChange={onCategoryFilterChange}
            className="catalogue-filter-select"
            style={{ minWidth: '11rem' }}
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      {loading && !products.length ? (
        <p className="text-muted mb-0">Loading products...</p>
      ) : (
        <>
          <TableComp
            data={products}
            columns={productColumns}
            keyField="productId"
            emptyMessage="No products found."
            className="dashboard-table table-borderless"
            style={{ width: '100%', margin: 0 }}
          />
          <DashboardPagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            disabled={loading}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

export default Products;
