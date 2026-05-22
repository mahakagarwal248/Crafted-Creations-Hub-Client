import axios from 'axios';
import { API_DOMAIN } from '../Constants';

export const addReview = async (payload) => {
  const response = await axios.post(`${API_DOMAIN}/reviews`, payload);
  return response;
};

export const getReviewsByProduct = async (productId) => {
  const response = await axios.get(`${API_DOMAIN}/reviews/product/${encodeURIComponent(productId)}`);
  return response;
};

export const getReviewsByUser = async (userId) => {
  const response = await axios.get(`${API_DOMAIN}/reviews/by-user/${encodeURIComponent(userId)}`);
  return response;
};

export const getLatestReviews = async ({ limit = 6, minRating = 4 } = {}) => {
  const response = await axios.get(
    `${API_DOMAIN}/reviews/latest?limit=${limit}&minRating=${minRating}`
  );
  return response;
};
