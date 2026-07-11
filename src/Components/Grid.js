import logo from '../logo.jpeg';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useOutletContext, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Catalogue.css';

function ProductGrid({ data, showCategoryViewMore = false }) {
  const outlet = useOutletContext() || {};
  const { addToCart, updateQuantity, removeFromCart, items = [] } = outlet;
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const cartByProductId = items.reduce((acc, it) => {
    acc[String(it.productId)] = it;
    return acc;
  }, {});

  const handleAddToCart = (item) => {
    if (!user) {
      alert('Please log in to add items to your cart.');
      navigate('/login', { state: { from: location } });
      return;
    }
    addToCart?.({ productId: item.productId, name: item.name, price: item.price, quantity: 1 });
  };

  const handleIncrement = (cartItem) => {
    updateQuantity?.(cartItem.productId, cartItem.quantity + 1);
  };

  const handleDecrement = (cartItem) => {
    if (cartItem.quantity <= 1) {
      removeFromCart?.(cartItem.productId);
      return;
    }
    updateQuantity?.(cartItem.productId, cartItem.quantity - 1);
  };

  if (!data?.length) {
    return <p className="catalogue-empty">No products in the catalogue yet.</p>;
  }

  return (
    <>
      {data.map((item) => {
        const totalInCategory = item.totalCount ?? item.count ?? item.products?.length ?? 0;
        return (
        <section key={String(item._id)} className="catalogue-category-block">
          <div className="catalogue-category-head">
            <h2 className="catalogue-category-title">{item.name || 'Uncategorized'}</h2>
            <span className="catalogue-category-pill" aria-label={`${totalInCategory} products`}>
              {totalInCategory} {totalInCategory === 1 ? 'item' : 'items'}
            </span>
          </div>
          <Row className="g-3 g-lg-4 catalogue-grid-row">
            {item.products.map((ele) => (
              <Col sm={6} lg={4} key={ele._id || ele.productId}>
                <article className="catalogue-card">
                  <Link to={`/product/${ele.productId}`} className="catalogue-card-media">
                    <img
                      alt={ele.name || 'product'}
                      src={(Array.isArray(ele.photos) && ele.photos[0]) || ele.imageUrl || logo}
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>
                  <div className="catalogue-card-body">
                    <Link to={`/product/${ele.productId}`} className="catalogue-card-title d-block">
                      {ele.name}
                    </Link>
                    <p className="catalogue-card-price mb-0">₹{ele.price}</p>
                    <p className="catalogue-card-dispatch mb-0">
                      {ele.minDaysToDispatch != null
                        ? `Minimum ${ele.minDaysToDispatch} day${ele.minDaysToDispatch === 1 ? '' : 's'} to dispatch`
                        : 'Minimum days to dispatch: —'}
                    </p>
                    <div className="catalogue-card-actions">
                      <Link to={`/product/${ele.productId}`} className="catalogue-btn-secondary">
                        View details
                      </Link>
                      {(() => {
                        const inCart = cartByProductId[String(ele.productId)];
                        if (inCart) {
                          return (
                            <div className="catalogue-qty-stepper" aria-label="Adjust quantity">
                              <button
                                type="button"
                                className="catalogue-qty-btn"
                                onClick={() => handleDecrement(inCart)}
                                aria-label={inCart.quantity <= 1 ? 'Remove from cart' : 'Decrease quantity'}
                              >
                                −
                              </button>
                              <span className="catalogue-qty-value" aria-live="polite">
                                {inCart.quantity}
                              </span>
                              <button
                                type="button"
                                className="catalogue-qty-btn"
                                onClick={() => handleIncrement(inCart)}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          );
                        }
                        return (
                          <button
                            type="button"
                            className="catalogue-btn-primary"
                            onClick={() => handleAddToCart(ele)}
                          >
                            Add to cart
                          </button>
                        );
                      })()}
                    </div>
                    {cartByProductId[String(ele.productId)] && (
                      <div className="catalogue-card-cart-footer">
                        <span className="catalogue-card-in-cart">Already in cart</span>
                        <Link to="/cart" className="catalogue-card-view-cart">
                          View cart →
                        </Link>
                      </div>
                    )}
                  </div>
                </article>
              </Col>
            ))}
            {showCategoryViewMore && item.hasMore && (
              <Col sm={6} lg={4}>
                <Link
                  to={`/catalogue?category=${item._id}`}
                  className="catalogue-card catalogue-card--view-more"
                  aria-label={`View more in ${item.name || 'category'}`}
                >
                  <div className="catalogue-view-more-inner">
                    <span className="catalogue-view-more-icon" aria-hidden>
                      +
                    </span>
                    <span className="catalogue-view-more-label">View more</span>
                    <span className="catalogue-view-more-count">
                      {Math.max(0, totalInCategory - item.products.length)} more items
                    </span>
                  </div>
                </Link>
              </Col>
            )}
          </Row>
        </section>
        );
      })}
    </>
  );
}

export default ProductGrid;
