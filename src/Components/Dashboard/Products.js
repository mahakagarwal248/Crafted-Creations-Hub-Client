import { useEffect, useState } from 'react';
import { getProducts } from '../../APIs/index';
import TableComp from '../Table';

const productColumns = [
  { key: 'productId', label: 'Product ID' },
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
    <div>
      <h4>All Products</h4>
      <TableComp
        data={products}
        columns={productColumns}
        keyField="productId"
        emptyMessage="No products found."
      />
    </div>
  );
}

export default Products;
