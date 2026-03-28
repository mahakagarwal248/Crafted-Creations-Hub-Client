import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import * as cartAPI from '../APIs/Cart';
import { useAuth } from '../context/AuthContext';

const defaultCart = { items: [] };

function Layout() {
  const { user, isHydrated } = useAuth();
  const [guestCartId] = useState(() => cartAPI.getOrCreateCartId());
  // Wait for auth to load from localStorage so we use the correct cart (user vs guest)
  const cartId = isHydrated ? (user ? user._id : guestCartId) : null;
  const [cart, setCart] = useState(defaultCart);

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
    },
    [cartId, user?._id]
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
      }}
    />
  );
}

export default Layout;
