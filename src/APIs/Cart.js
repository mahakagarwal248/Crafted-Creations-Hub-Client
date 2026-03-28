import axios from 'axios';
import { API_DOMAIN } from '../Constants';

function cartUrl(cartId, path = '') {
  return `${API_DOMAIN}/carts/${cartId}${path}`;
}

function cartHeaders(userId) {
  if (!userId) return {};
  return { 'X-User-Id': userId };
}

export const getCart = async (cartId, userId = null) => {
  const response = await axios.get(cartUrl(cartId), { headers: cartHeaders(userId) });
  if (!response.data) throw new Error('Something went wrong!');
  return response.data;
};

export const addToCart = async (cartId, item, userId = null) => {
  const body = userId ? { ...item, userId } : item;
  const response = await axios.post(cartUrl(cartId, '/items'), body, { headers: cartHeaders(userId) });
  return response.data;
};

export const updateCartItem = async (cartId, productId, quantity, userId = null) => {
  const response = await axios.patch(cartUrl(cartId, `/items/${productId}`), { quantity }, { headers: cartHeaders(userId) });
  return response.data;
};

export const removeFromCart = async (cartId, productId, userId = null) => {
  const response = await axios.delete(cartUrl(cartId, `/items/${productId}`), { headers: cartHeaders(userId) });
  return response.data;
};

export const clearCart = async (cartId, userId = null) => {
  const response = await axios.delete(cartUrl(cartId), { headers: cartHeaders(userId) });
  return response.data;
};

export const getOrCreateCartId = () => {
  let id = localStorage.getItem('cartId');
  if (!id) {
    id = 'cart_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    localStorage.setItem('cartId', id);
  }
  return id;
};
