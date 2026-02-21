import axios from 'axios';
import { API_DOMAIN } from '../Constants';

function cartUrl(cartId, path = '') {
  return `${API_DOMAIN}/carts/${cartId}${path}`;
}

export const getCart = async (cartId) => {
  const response = await axios.get(cartUrl(cartId));
  if (!response.data) throw new Error('Something went wrong!');
  return response.data;
};

export const addToCart = async (cartId, item) => {
  const response = await axios.post(cartUrl(cartId, '/items'), item);
  return response.data;
};

export const updateCartItem = async (cartId, productId, quantity) => {
  const response = await axios.patch(cartUrl(cartId, `/items/${productId}`), { quantity });
  return response.data;
};

export const removeFromCart = async (cartId, productId) => {
  const response = await axios.delete(cartUrl(cartId, `/items/${productId}`));
  return response.data;
};

export const clearCart = async (cartId) => {
  const response = await axios.delete(cartUrl(cartId));
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
