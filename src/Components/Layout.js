import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import * as cartAPI from '../APIs/Cart';

const defaultCart = { items: [] };

function Layout() {
  const [cartId] = useState(() => cartAPI.getOrCreateCartId());
  const [cart, setCart] = useState(defaultCart);

  const refreshCart = useCallback(async () => {
    try {
      const data = await cartAPI.getCart(cartId);
      setCart(data || defaultCart);
    } catch {
      setCart(defaultCart);
    }
  }, [cartId]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(
    async (item) => {
      const updated = await cartAPI.addToCart(cartId, {
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity ?? 1,
      });
      setCart(updated || defaultCart);
    },
    [cartId]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      const updated = await cartAPI.updateCartItem(cartId, productId, quantity);
      setCart(updated || defaultCart);
    },
    [cartId]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      const updated = await cartAPI.removeFromCart(cartId, productId);
      setCart(updated || defaultCart);
    },
    [cartId]
  );

  const clearCart = useCallback(async () => {
    await cartAPI.clearCart(cartId);
    setCart(defaultCart);
  }, [cartId]);

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
