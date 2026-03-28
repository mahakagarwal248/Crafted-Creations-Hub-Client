import logo from '../logo.jpeg';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  return (
    <Container>
      {data.map((item) => (
        <div key={item._id} style={{ marginBottom: '25px' }}>
          <h2>{item._id} - {item.count}</h2>
          <Row>
            {item.products.map((ele) => (
              <Col xl={4} key={ele._id || ele.productId} style={{ marginBottom: '25px' }}>
                <div style={{ border: '2px solid white', padding: '1rem' }}>
                  <img alt="product" src={logo} style={{ height: '150px', width: '150px' }} />
                  <h5>{ele.name}</h5>
                  <h5>₹{ele.price}</h5>
                  <p>Minimum days to dispatch: {ele.minDaysToDispatch ?? '—'}</p>
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={() => handleAddToCart(ele)}
                  >
                    Add to cart
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </Container>
  );
}

export default ProductGrid;
