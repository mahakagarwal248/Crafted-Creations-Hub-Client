import logo from '../logo.jpeg';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useOutletContext } from 'react-router-dom';

function ProductGrid({ data }) {
  const { addToCart } = useOutletContext() || {};

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
                    onClick={() => addToCart?.({ productId: ele.productId, name: ele.name, price: ele.price, quantity: 1 })}
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
