import logo from '../logo.jpeg';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useOutletContext, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Catalogue.css';

function ProductGrid({ data }) {
  const { addToCart } = useOutletContext() || {};
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddToCart = (item) => {
    if (!user) {
      alert('Please log in to add items to your cart.');
      navigate('/login', { state: { from: location } });
      return;
    }
    addToCart?.({ productId: item.productId, name: item.name, price: item.price, quantity: 1 });
  };

  if (!data?.length) {
    return <p className="catalogue-empty">No products in the catalogue yet.</p>;
  }

  return (
    <>
      {data.map((item) => (
        <section key={String(item._id)} className="catalogue-category-block">
          <div className="catalogue-category-head">
            <h2 className="catalogue-category-title">{item.name || 'Uncategorized'}</h2>
            <span className="catalogue-category-pill" aria-label={`${item.count} products`}>
              {item.count} {item.count === 1 ? 'item' : 'items'}
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
                      <button
                        type="button"
                        className="catalogue-btn-primary"
                        onClick={() => handleAddToCart(ele)}
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </article>
              </Col>
            ))}
          </Row>
        </section>
      ))}
    </>
  );
}

export default ProductGrid;
