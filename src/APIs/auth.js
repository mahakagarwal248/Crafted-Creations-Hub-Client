import axios from 'axios';
import { API_DOMAIN } from '../Constants';

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_DOMAIN}/users/login`, { email, password });
  return response.data;
};

export const registerUser = async ({ name, email, phone, password, shippingAddress }) => {
  const response = await axios.post(`${API_DOMAIN}/users`, {
    name,
    email,
    phone,
    password,
    shippingAddress,
  });
  return response.data;
};

export const updateUserProfile = async (userId, { name, phone, shippingAddress }) => {
  const response = await axios.patch(`${API_DOMAIN}/users/${userId}`, {
    name,
    phone,
    shippingAddress,
  });
  return response.data;
};
