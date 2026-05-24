import { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import * as cartAPI from '../APIs/Cart';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';
import ToastStack from './Toast';

const defaultCart = { items: [] };
const TOAST_DURATION = 3000;

function Layout() {
  const { user, isHydrated } = useAuth();
  const [guestCartId] = useState(() => cartAPI.getOrCreateCartId());
  // Wait for auth to load from localStorage so we use the correct cart (user vs guest)
  const cartId = isHydrated ? (user ? user._id : guestCartId) : null;
  const [cart, setCart] = useState(defaultCart);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, options = {}) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        variant: options.variant || 'success',
        duration: options.duration ?? TOAST_DURATION,
      },
    ]);
    return id;
  }, []);

  const refreshCart = useCallback(async () => {
    if (!cartId) return;
    try {
      const data = await cartAPI.getCart(cartId, user?._id);
      setCart(data || defaultCart);
    } catch {
      setCart(defaultCart);
    }
  }, [cartId, user?._id]);

  useEffect(() => {
    if (cartId) refreshCart();
  }, [cartId, refreshCart]);

  const addToCart = useCallback(
    async (item) => {
      try {
        const updated = await cartAPI.addToCart(
          cartId,
          {
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity ?? 1,
          },
          user?._id
        );
        setCart(updated || defaultCart);
        const label = item?.name ? `"${item.name}" added to cart` : 'Item added to cart';
        showToast(label, { variant: 'success' });
        return updated;
      } catch (err) {
        showToast(
          err?.response?.data?.message || err?.message || 'Could not add item to cart.',
          { variant: 'error' }
        );
        throw err;
      }
    },
    [cartId, user?._id, showToast]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      const updated = await cartAPI.updateCartItem(cartId, productId, quantity, user?._id);
      setCart(updated || defaultCart);
    },
    [cartId, user?._id]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      const updated = await cartAPI.removeFromCart(cartId, productId, user?._id);
      setCart(updated || defaultCart);
    },
    [cartId, user?._id]
  );

  const clearCart = useCallback(async () => {
    await cartAPI.clearCart(cartId, user?._id);
    setCart(defaultCart);
  }, [cartId, user?._id]);

  const items = cart?.items ?? [];
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <>
      <Outlet
        context={{
          cart,
          items,
          totalItems,
          totalAmount,
          cartId,
          addToCart,
          updateQuantity,
          removeFromCart,
          clearCart,
          refreshCart,
          showToast,
        }}
      />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <Footer />
    </>
  );
}

export default Layout;
