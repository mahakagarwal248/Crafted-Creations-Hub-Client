import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import { getProducts } from '../APIs';
import Navbar from './Navbar';
import ProductGrid from './Grid';
import './Catalogue.css';

function Catalogue() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData()
      .then((res) => {
        setProducts(res?.categories ?? []);
      })
      .catch((err) => {
        console.log(err);
        window.alert(err?.message || String(err));
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchData = async () => {
    const response = await getProducts();
    return response;
  };

  if (loading) {
    return (
      <div className="catalogue-page">
        <Navbar />
        <div className="catalogue-loading">
          <Spinner animation="border" role="status" className="text-light" />
        </div>
      </div>
    );
  }

  return (
    <div className="catalogue-page">
      <Navbar />
      <Container fluid="lg" className="catalogue-body pt-2 pt-md-3">
        <header className="catalogue-page-header">
          <h1 className="catalogue-page-title">Catalogue</h1>
          <p className="catalogue-page-lede">
            Browse by category. Tap a photo or title for details, or add straight to your cart.
          </p>
        </header>
        <ProductGrid data={products} />
      </Container>
    </div>
  );
}

export default Catalogue;
