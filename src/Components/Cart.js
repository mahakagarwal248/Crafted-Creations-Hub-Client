import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Navbar from './Navbar';
import { addOrders } from '../APIs/Orders';

const DEFAULT_CUSTOMER_ID = '68bf26d76e5cd2f5a15e9cc1';

function Cart() {
  const outlet = useOutletContext();
  const items = outlet?.items ?? [];
  const totalAmount = outlet?.totalAmount ?? 0;
  const updateQuantity = outlet?.updateQuantity ?? (() => {});
  const removeFromCart = outlet?.removeFromCart ?? (() => {});
  const clearCart = outlet?.clearCart ?? (() => {});
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState(DEFAULT_CUSTOMER_ID);
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      window.alert('Your cart is empty.');
      return;
    }
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const payload = {
        productDetails: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customerId: customerId.trim() || DEFAULT_CUSTOMER_ID,
        discount: Number(discount) || 0,
        amountPaid: Number(amountPaid) || 0,
      };
      const response = await addOrders(payload);
      if (response && response.status === 200) {
        await clearCart();
        window.alert('Order placed successfully!');
        navigate('/catalogue');
      } else {
        window.alert(response?.data?.message || 'Failed to place order.');
      }
    } catch (err) {
      window.alert(err?.response?.data?.message || err?.message || 'Failed to place order.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0 && !isCheckingOut) {
    return (
      <div style={{ color: 'white' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h4>Your cart is empty</h4>
          <Button variant="outline-light" onClick={() => navigate('/catalogue')}>
            Browse catalogue
          </Button>
        </div>
      </div>
    );
  }

  const formStyle = { maxWidth: 200, marginBottom: '1rem' };

  return (
    <div style={{ color: 'white' }}>
      <Navbar />
      <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
        <h3>Cart</h3>
      <Table responsive bordered size="sm" style={{ color: 'white', marginBottom: '1.5rem' }}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.productId}>
              <td>{item.name}</td>
              <td>₹{item.price}</td>
              <td>
                <Form.Control
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, e.target.value)}
                  style={{ width: 70 }}
                />
              </td>
              <td>₹{item.price * item.quantity}</td>
              <td>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeFromCart(item.productId)}
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <p>
        <strong>Total: ₹{totalAmount.toFixed(2)}</strong>
      </p>
      <div style={{ marginTop: '1.5rem' }}>
        <Form.Group className="mb-2">
          <Form.Label>Customer ID</Form.Label>
          <Form.Control
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="Customer ID for order"
            style={formStyle}
          />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Discount (%)</Form.Label>
          <Form.Control
            type="number"
            min={0}
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            style={formStyle}
          />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Amount to pay now</Form.Label>
          <Form.Control
            type="number"
            min={0}
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            style={formStyle}
          />
        </Form.Group>
        <div style={{ marginTop: '1rem' }}>
          <Button
            variant="primary"
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="me-2"
          >
            {isCheckingOut ? 'Placing order...' : 'Checkout'}
          </Button>
          <Button variant="outline-light" onClick={() => navigate('/catalogue')}>
            Continue shopping
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Cart;
