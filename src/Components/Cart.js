import { useState } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Navbar from './Navbar';
import { sendCheckoutEmail } from '../APIs/Checkout';
import { addOrders } from '../APIs/Orders';
import { updateUserProfile } from '../APIs/auth';
import { useAuth } from '../context/AuthContext';
import './Catalogue.css';
import './Cart.css';

function Cart() {
  const outlet = useOutletContext();
  const { user, login } = useAuth();
  const items = outlet?.items ?? [];
  const totalAmount = outlet?.totalAmount ?? 0;
  const updateQuantity = outlet?.updateQuantity ?? (() => {});
  const removeFromCart = outlet?.removeFromCart ?? (() => {});
  const clearCart = outlet?.clearCart ?? (() => {});
  const navigate = useNavigate();
  const location = useLocation();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
  });

  const openCheckoutModal = () => {
    if (items.length === 0) {
      window.alert('Your cart is empty.');
      return;
    }
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: '/cart', search: location.search, hash: location.hash, state: location.state },
          message: 'Please sign in to complete checkout. Your cart will be waiting.',
        },
      });
      return;
    }
    setFormData({
      name: user?.name ?? '',
      phone: user?.phone != null ? String(user.phone) : '',
      streetAddress: user?.shippingAddress?.address ?? '',
      city: user?.shippingAddress?.city ?? '',
      state: user?.shippingAddress?.state ?? '',
      pincode: user?.shippingAddress?.zip != null ? String(user.shippingAddress.zip) : '',
    });
    setShowCheckoutModal(true);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    const { name, phone, streetAddress, city, state, pincode } = formData;
    const street = streetAddress?.trim();
    const cityT = city?.trim();
    const stateT = state?.trim();
    const pin = pincode?.toString().trim();
    if (!name?.trim() || !phone?.toString().trim()) {
      window.alert('Please fill in your name and phone number.');
      return;
    }
    if (!street || !cityT || !stateT || !pin) {
      window.alert('Please fill in street address, city, state and PIN code.');
      return;
    }
    if (!user?._id) {
      window.alert('You must be signed in to place an order.');
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    setSubmitting(true);
    try {
      const updatedUser = await updateUserProfile(user._id, {
        name: name.trim(),
        phone: phone.toString().trim(),
        shippingAddress: {
          address: street,
          city: cityT,
          state: stateT,
          zip: pin,
        },
      });
      login(updatedUser);

      const orderPayload = {
        customerId: user._id,
        productDetails: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        discount: 0,
        amountPaid: 0,
      };

      const orderRes = await addOrders(orderPayload);
      if (!orderRes || orderRes.status !== 200) {
        window.alert(orderRes?.data?.message || 'Order could not be placed.');
        return;
      }

      try {
        await sendCheckoutEmail({
          name: name.trim(),
          phone: phone.toString().trim(),
          streetAddress: street,
          city: cityT,
          state: stateT,
          pincode: pin,
          cartItems: items,
          totalAmount,
        });
      } catch (emailErr) {
        console.warn('Checkout email failed:', emailErr);
      }

      setShowCheckoutModal(false);
      await clearCart();
      window.alert('Order placed successfully! We will contact you soon.');
      navigate('/catalogue');
    } catch (err) {
      window.alert(
        err?.response?.data?.message || err?.response?.data?.Message || err?.message || 'Checkout failed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !showCheckoutModal) {
    return (
      <div className="catalogue-page">
        <Navbar />
        <Container fluid="lg" className="catalogue-inner pt-3">
          <div className="cart-empty-shell text-center">
            <h1 className="cart-page-title">Your cart is empty</h1>
            <p className="cart-empty-sub">Add pieces from the catalogue to get started.</p>
            <Button className="cart-btn-catalogue" onClick={() => navigate('/catalogue')}>
              Browse catalogue
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const totalToPay = totalAmount;

  return (
    <div className="catalogue-page">
      <Navbar />
      <Container fluid="lg" className="catalogue-inner pt-3">
        <header className="mb-3">
          <h1 className="cart-page-title mb-0">Cart</h1>
          <p className="cart-empty-sub mb-0 mt-2">Review your items and checkout when ready.</p>
        </header>

        <div className="cart-shell">
          <Table responsive borderless size="sm" className="cart-table">
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
                      className="cart-qty-input"
                    />
                  </td>
                  <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <Button className="cart-btn-remove" size="sm" onClick={() => removeFromCart(item.productId)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="cart-total-strip">
            <p className="cart-total-label mb-0">Total amount to pay</p>
            <p className="cart-total-value">₹{Math.max(0, totalToPay).toFixed(2)}</p>
          </div>

          <Button className="cart-btn-checkout" onClick={openCheckoutModal}>
            Checkout
          </Button>
        </div>

        <Modal
          show={showCheckoutModal}
          onHide={() => !submitting && setShowCheckoutModal(false)}
          centered
          contentClassName="cart-checkout-modal-content"
        >
          <Modal.Header closeButton>
            <Modal.Title>Checkout</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCheckoutSubmit}>
            <Modal.Body>
              <p className="text-muted small mb-3">
                We save these details to your account and attach them to your order. You are signed in as{' '}
                <strong className="text-white">{user?.email}</strong>.
              </p>
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
              <hr className="my-3" />
              <p className="text-muted small mb-2 fw-semibold">Shipping address (all required)</p>
              <Form.Group className="mb-3">
                <Form.Label>Street address</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) => setFormData((p) => ({ ...p, streetAddress: e.target.value }))}
                  placeholder="House / street / locality"
                  required
                  autoComplete="street-address"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>PIN code</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="numeric"
                  value={formData.pincode}
                  onChange={(e) => setFormData((p) => ({ ...p, pincode: e.target.value }))}
                  placeholder="PIN / postal code"
                  required
                  minLength={4}
                  maxLength={12}
                  autoComplete="postal-code"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                  placeholder="City"
                  required
                  autoComplete="address-level2"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>State</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                  placeholder="State"
                  required
                  autoComplete="address-level1"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                type="button"
                className="cart-modal-btn-cancel"
                onClick={() => setShowCheckoutModal(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="cart-modal-btn-submit" disabled={submitting}>
                {submitting ? 'Placing order…' : 'Place order'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
}

export default Cart;
