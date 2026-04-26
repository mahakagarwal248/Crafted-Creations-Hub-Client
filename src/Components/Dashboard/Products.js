import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../APIs/index';
import TableComp from '../Table';

const productColumns = [
  { key: 'productId', label: 'Product ID' },
  {
    key: 'photos',
    label: 'Photo',
    format: (photos, row) => {
      const src =
        (Array.isArray(photos) && photos[0]) || row?.imageUrl || null;
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
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price' },
  { key: 'minDaysToDispatch', label: 'Min days to dispatch' },
];

function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      const list = data?.categories?.flatMap((cat) => cat.products || []) || [];
      setProducts(list);
    } catch {
      setProducts([]);
    }
  };

  return (
    <div className="dashboard-panel" style={{ overflowX: 'auto' }}>
      <h4>All products</h4>
      <TableComp
        data={products}
        columns={productColumns}
        keyField="productId"
        emptyMessage="No products found."
        className="dashboard-table table-borderless"
        style={{ width: '100%', margin: 0 }}
      />
    </div>
  );
}

export default Products;
