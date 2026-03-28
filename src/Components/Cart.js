import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Navbar from './Navbar';
import { sendCheckoutEmail } from '../APIs/Checkout';
import { useAuth } from '../context/AuthContext';

function Cart() {
  const outlet = useOutletContext();
  const { user } = useAuth();
  const items = outlet?.items ?? [];
  const totalAmount = outlet?.totalAmount ?? 0;
  const updateQuantity = outlet?.updateQuantity ?? (() => {});
  const removeFromCart = outlet?.removeFromCart ?? (() => {});
  const clearCart = outlet?.clearCart ?? (() => {});
  const navigate = useNavigate();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const openCheckoutModal = () => {
    if (items.length === 0) {
      window.alert('Your cart is empty.');
      return;
    }
    setFormData({
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      address: user?.address ?? '',
    });
    setShowCheckoutModal(true);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    const { name, phone, address } = formData;
    if (!name?.trim() || !phone?.toString().trim() || !address?.trim()) {
      window.alert('Please fill in name, phone and address.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await sendCheckoutEmail({
        name: name.trim(),
        phone: phone.toString().trim(),
        address: address.trim(),
        cartItems: items,
        totalAmount,
      });
      if (result?.success) {
        setShowCheckoutModal(false);
        await clearCart();
        window.alert('Details sent successfully! We will contact you soon.');
        navigate('/catalogue');
      } else {
        window.alert(result?.message || 'Something went wrong.');
      }
    } catch (err) {
      window.alert(err?.response?.data?.message || err?.message || 'Failed to send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !showCheckoutModal) {
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

  // const discountPct = Number(discount) || 0;
  // const discountAmount = (totalAmount * discountPct) / 100;
  const totalToPay = totalAmount;

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
                  style={{ width: 70, margin: '0 auto' }}
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
      <div style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
        {/* <p style={{ marginBottom: '0.25rem' }}>
          <strong>Total discount:</strong> {discountPct}% {discountAmount > 0 && `(₹${discountAmount.toFixed(2)})`}
        </p> */}
        <p style={{ marginBottom: 0, fontSize: '1.25rem' }}>
          <strong>Total amount to pay:</strong> ₹{Math.max(0, totalToPay).toFixed(2)}
        </p>
      </div>
      <Button variant="primary" onClick={openCheckoutModal}>Checkout</Button>

      <Modal show={showCheckoutModal} onHide={() => !submitting && setShowCheckoutModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Checkout – Your details</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCheckoutSubmit}>
          <Modal.Body>
            <p className="text-muted small">We’ll send your cart and contact details to complete the order.</p>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Phone number"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                placeholder="Address"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCheckoutModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send & complete checkout'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      </div>
    </div>
  );
}

export default Cart;
