import axios from 'axios';
import { API_DOMAIN } from '../Constants';

export const getProducts = async (category) => {
  try {
    const url = category ? `${API_DOMAIN}/product?category=${encodeURIComponent(category)}` : `${API_DOMAIN}/product`;
    const response = await axios.get(url);
    if (!response) throw new Error('Something went wrong!');
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const addProduct = async (data) => {
  try {
    const response = await axios.post(`${API_DOMAIN}/product`, data);
    if (!response) throw new Error('Something went wrong!');
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};