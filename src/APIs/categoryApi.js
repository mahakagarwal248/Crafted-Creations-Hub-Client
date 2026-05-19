import axios from 'axios';
import { API_DOMAIN } from '../Constants';

export const getCategories = async () => {
  const response = await axios.get(`${API_DOMAIN}/category`);
  return response.data;
};

export const getFeaturedHomepageCategories = async () => {
  const response = await axios.get(`${API_DOMAIN}/category/featured/homepage`);
  return response.data;
};

export const setFeaturedHomepageCategories = async (categoryIds) => {
  const response = await axios.put(`${API_DOMAIN}/category/featured/homepage`, {
    categoryIds,
  });
  return response.data;
};

export const createCategory = async (data) => {
  const response = await axios.post(`${API_DOMAIN}/category`, data);
  return response;
};

export const updateCategory = async (id, data) => {
  const response = await axios.put(`${API_DOMAIN}/category/${encodeURIComponent(id)}`, data);
  return response;
};

export const deleteCategory = async (id) => {
  const response = await axios.delete(`${API_DOMAIN}/category/${encodeURIComponent(id)}`);
  return response;
};
