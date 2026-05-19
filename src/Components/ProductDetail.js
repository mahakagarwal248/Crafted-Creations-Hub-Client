import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useParams, Link, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Navbar from './Navbar';
import { getProductById } from '../APIs';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.jpeg';
import './ProductDetail.css';

function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useOutletContext() || {};
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const gallery = useMemo(() => {
    const fromPhotos = Array.isArray(product?.photos) ? product.photos.filter(Boolean) : [];
    if (fromPhotos.length) return fromPhotos;
    if (product?.imageUrl) return [product.imageUrl];
    return [logo];
  }, [product]);

  useEffect(() => {
    setActivePhotoIndex(0);
  }, [productId]);

  useEffect(() => {
    let cancelled = false;
    const id = Number(productId);
    if (!Number.isFinite(id) || id < 1) {
      setError('Invalid product');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getProductById(id)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setProduct(null);
          setError(err?.response?.data?.message || err?.message || 'Could not load product');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const mainSrc = gallery[Math.min(activePhotoIndex, gallery.length - 1)];

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      window.alert('Please log in to add items to your cart.');
      navigate('/login', { state: { from: location } });
      return;
    }
    addToCart?.({
      productId: product.productId,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <Container className="py-5 text-center">
          <Spinner animation="border" role="status" className="text-light" />
        </Container>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <Container className="py-4 product-detail-shell">
          <p className="mb-3">{error || 'Product not found.'}</p>
          <Button variant="outline-light" as={Link} to="/catalogue">
            Back to catalogue
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <Navbar />
      <Container fluid="lg" className="px-3">
        <div className="product-detail-shell">
          <Link to="/catalogue" className="product-detail-back">
            ← Back to catalogue
          </Link>
          <Row className="g-4 g-lg-5 align-items-start">
            <Col lg={6}>
              <div className="product-detail-media">
                <img src={mainSrc} alt={product.name} />
              </div>
              {gallery.length > 1 && (
                <div className="d-flex flex-wrap gap-2 mt-3">
                  {gallery.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePhotoIndex(i)}
                      className={`product-detail-thumb-btn ${i === activePhotoIndex ? 'product-detail-thumb-btn--active' : ''}`}
                      aria-label={`Show image ${i + 1}`}
                    >
                      <img src={src} alt="" className="product-detail-thumb" />
                    </button>
                  ))}
                </div>
              )}
            </Col>
            <Col lg={6} className="ps-lg-4">
              <p className="product-detail-meta mb-0">Product #{product.productId}</p>
              <h1 className="product-detail-title" style={{ textTransform: 'capitalize' }}>
                {product.name}
              </h1>
              <p className="product-detail-price">₹{product.price}</p>
              <div className="product-detail-spec">
                <div className="product-detail-spec-row">
                  <span className="product-detail-spec-label">Category</span>
                  <span className="product-detail-spec-value">
                    {Array.isArray(product.category) && product.category.length
                      ? product.category.map((c) => c?.name || c).filter(Boolean).join(', ')
                      : '—'}
                  </span>
                </div>
                <div className="product-detail-spec-row">
                  <span className="product-detail-spec-label">Dispatch time</span>
                  <span className="product-detail-spec-value">
                    {product.minDaysToDispatch != null ? `${product.minDaysToDispatch} day(s)` : '—'}
                  </span>
                </div>
              </div>
              {product.description ? (
                <div className="mb-4">
                  <h2 className="product-detail-desc-title">About this piece</h2>
                  <p className="product-detail-desc-body mb-0">{product.description}</p>
                </div>
              ) : null}
              <button type="button" className="btn product-detail-cta" onClick={handleAddToCart}>
                Add to cart
              </button>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}

export default ProductDetail;
