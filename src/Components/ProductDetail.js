import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useParams, Link, useLocation } from 'react-router-dom';
import moment from 'moment';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Navbar from './Navbar';
import { getProductById } from '../APIs';
import { getReviewsByProduct } from '../APIs/reviewApi';
import { useAuth } from '../context/AuthContext';
import { ReviewCardSkeleton, Skeleton } from './Skeleton';
import logo from '../logo.jpeg';
import './ProductDetail.css';

function StarRow({ value, size = 'sm' }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className={`product-detail-stars product-detail-stars--${size}`}>
      {stars.map((s) => (
        <span key={s} className={value >= s ? 'product-detail-star--filled' : ''}>
          ★
        </span>
      ))}
    </span>
  );
}

function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const outlet = useOutletContext() || {};
  const { addToCart, updateQuantity, removeFromCart, items = [] } = outlet;
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ totalCount: 0, averageRating: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const gallery = useMemo(() => {
    const fromPhotos = Array.isArray(product?.photos) ? product.photos.filter(Boolean) : [];
    if (fromPhotos.length) return fromPhotos;
    if (product?.imageUrl) return [product.imageUrl];
    return [logo];
  }, [product]);

  const hasDynamicPriceCategory = useMemo(() => {
    if (!Array.isArray(product?.category)) return false;
    return product.category.some((c) => c && typeof c === 'object' && c.isDynamicPriceCategory);
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
    setProduct(null);
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

  useEffect(() => {
    if (!product?._id) {
      setReviews([]);
      setReviewStats({ totalCount: 0, averageRating: 0 });
      return undefined;
    }
    let cancelled = false;
    setReviewsLoading(true);
    getReviewsByProduct(product._id)
      .then((res) => {
        if (cancelled) return;
        const payload = res?.data?.data || {};
        setReviews(Array.isArray(payload.reviews) ? payload.reviews : []);
        setReviewStats({
          totalCount: payload.totalCount || 0,
          averageRating: payload.averageRating || 0,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setReviews([]);
        setReviewStats({ totalCount: 0, averageRating: 0 });
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product?._id]);

  const mainSrc = gallery[Math.min(activePhotoIndex, gallery.length - 1)];

  const cartItem = useMemo(
    () =>
      product?.productId != null
        ? items.find((it) => String(it.productId) === String(product.productId))
        : null,
    [items, product?.productId]
  );

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

  const handleIncrement = () => {
    if (!cartItem) return;
    updateQuantity?.(cartItem.productId, cartItem.quantity + 1);
  };

  const handleDecrement = () => {
    if (!cartItem) return;
    if (cartItem.quantity <= 1) {
      removeFromCart?.(cartItem.productId);
      return;
    }
    updateQuantity?.(cartItem.productId, cartItem.quantity - 1);
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <Container fluid="lg" className="px-3">
          <div className="product-detail-shell">
            <Skeleton width="170px" height="2rem" radius="999px" />
            <Row className="g-4 g-lg-5 align-items-start mt-1">
              <Col lg={6}>
                <Skeleton width="100%" height="60vh" radius="1rem" />
                <div className="d-flex gap-2 mt-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} width="76px" height="76px" radius="0.5rem" />
                  ))}
                </div>
              </Col>
              <Col lg={6} className="ps-lg-4">
                <Skeleton width="40%" height="0.85rem" />
                <div style={{ marginTop: '0.7rem' }}>
                  <Skeleton width="80%" height="2rem" radius="0.45rem" />
                </div>
                <div style={{ marginTop: '0.9rem' }}>
                  <Skeleton width="35%" height="1.65rem" />
                </div>
                <div className="d-flex flex-column gap-2 mt-4">
                  <Skeleton width="100%" height="2.4rem" radius="0.5rem" />
                  <Skeleton width="100%" height="2.4rem" radius="0.5rem" />
                </div>
                <div style={{ marginTop: '1.5rem' }}>
                  <Skeleton width="50%" height="0.8rem" />
                  <div style={{ marginTop: '0.5rem' }}>
                    <Skeleton width="100%" height="0.85rem" />
                  </div>
                  <div style={{ marginTop: '0.4rem' }}>
                    <Skeleton width="92%" height="0.85rem" />
                  </div>
                  <div style={{ marginTop: '0.4rem' }}>
                    <Skeleton width="70%" height="0.85rem" />
                  </div>
                </div>
                <div style={{ marginTop: '1.4rem' }}>
                  <Skeleton width="55%" height="2.7rem" radius="0.5rem" />
                </div>
              </Col>
            </Row>
          </div>
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
              <p className="product-detail-price">
                {hasDynamicPriceCategory && (
                  <span className="product-detail-price-prefix">Starting from </span>
                )}
                ₹{product.price}
              </p>
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
              {cartItem ? (
                <div className="product-detail-cart-block">
                  <p className="product-detail-in-cart">Already in cart</p>
                  <div className="product-detail-qty-stepper" aria-label="Adjust quantity">
                    <button
                      type="button"
                      className="product-detail-qty-btn"
                      onClick={handleDecrement}
                      aria-label={cartItem.quantity <= 1 ? 'Remove from cart' : 'Decrease quantity'}
                    >
                      −
                    </button>
                    <span className="product-detail-qty-value" aria-live="polite">
                      {cartItem.quantity}
                    </span>
                    <button
                      type="button"
                      className="product-detail-qty-btn"
                      onClick={handleIncrement}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <Link to="/cart" className="product-detail-go-cart">
                    Go to cart →
                  </Link>
                </div>
              ) : (
                <button type="button" className="btn product-detail-cta" onClick={handleAddToCart}>
                  Add to cart
                </button>
              )}
            </Col>
          </Row>

          <section className="product-detail-reviews">
            <header className="product-detail-reviews-head">
              <h2 className="product-detail-reviews-title">Customer reviews</h2>
              {reviewsLoading ? (
                <Skeleton width="180px" height="0.9rem" />
              ) : reviewStats.totalCount > 0 ? (
                <div className="product-detail-reviews-summary">
                  <StarRow value={Math.round(reviewStats.averageRating)} />
                  <span className="product-detail-reviews-avg">
                    {reviewStats.averageRating.toFixed(1)}
                  </span>
                  <span className="product-detail-reviews-count">
                    ({reviewStats.totalCount} {reviewStats.totalCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              ) : (
                <p className="product-detail-reviews-empty">
                  No reviews yet — be the first after your next order.
                </p>
              )}
            </header>

            {reviewsLoading && (
              <ul className="product-detail-review-list">
                {Array.from({ length: 2 }).map((_, i) => (
                  <li key={i}>
                    <ReviewCardSkeleton />
                  </li>
                ))}
              </ul>
            )}

            {!reviewsLoading && reviews.length > 0 && (
              <ul className="product-detail-review-list">
                {reviews.map((r) => {
                  const avatarSrc = r.photoUrl || r.userAvatar;
                  return (
                    <li key={r._id} className="product-detail-review">
                      <div className="product-detail-review-avatar-wrap">
                        <img src={avatarSrc} alt="" className="product-detail-review-avatar" />
                      </div>
                      <h3 className="product-detail-review-name">{r.userName || 'Customer'}</h3>
                      <span className="product-detail-review-date">
                        {r.createdAt ? moment(r.createdAt).format('DD MMM YYYY') : ''}
                      </span>
                      <StarRow value={r.rating} />
                      {r.comment && (
                        <div className="product-detail-review-text-wrap">
                          <p className="product-detail-review-text">{r.comment}</p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}

export default ProductDetail;
