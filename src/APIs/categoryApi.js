import axios from './axiosClient';
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

/** Admin-only: download the printable product catalogue PDF for a category. */
export const downloadCategoryCataloguePdf = async (categoryId, fileName) => {
  const response = await axios.get(
    `${API_DOMAIN}/category/${encodeURIComponent(categoryId)}/catalogue.pdf`,
    { responseType: 'blob' },
  );
  const objectUrl = URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = fileName || `catalogue-${categoryId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
};
