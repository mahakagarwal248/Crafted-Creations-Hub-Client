import axios from 'axios';
import { API_DOMAIN } from '../Constants';
import { withRequestCache, invalidateRequestCacheByPrefix } from './requestCache';

const PRODUCTS_CACHE_TTL = 120_000;
const PRODUCT_DETAIL_CACHE_TTL = 180_000;

export const listProducts = async ({
  includeInactive = false,
  categoryId,
  page = 1,
  limit = 10,
} = {}) => {
  try {
    const params = new URLSearchParams();
    if (includeInactive) params.set('includeInactive', 'true');
    if (categoryId) params.set('category', categoryId);
    params.set('page', String(page));
    params.set('limit', String(limit));
    const qs = params.toString();
    const url = `${API_DOMAIN}/product/list?${qs}`;
    const response = await axios.get(url);
    if (!response?.data) throw new Error('Something went wrong!');
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getProducts = async (
  categoryId,
  { includeInactive = false, page = 1, limit = 12, limitPerCategory = 5 } = {},
) => {
  try {
    const params = new URLSearchParams();
    if (categoryId) params.set('category', categoryId);
    if (includeInactive) params.set('includeInactive', 'true');
    if (categoryId) {
      params.set('page', String(page));
      params.set('limit', String(limit));
    } else {
      params.set('limitPerCategory', String(limitPerCategory));
    }
    const qs = params.toString();
    const url = qs ? `${API_DOMAIN}/product?${qs}` : `${API_DOMAIN}/product`;
    const cacheKey = `products:${qs || 'all'}`;
    return await withRequestCache(
      cacheKey,
      async () => {
        const response = await axios.get(url);
        if (!response) throw new Error('Something went wrong!');
        return response.data;
      },
      PRODUCTS_CACHE_TTL,
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getProductById = async (productId, { includeInactive = false } = {}) => {
  try {
    const params = includeInactive ? '?includeInactive=true' : '';
    const cacheKey = `product:detail:${productId}:${includeInactive ? 'all' : 'active'}`;
    return await withRequestCache(
      cacheKey,
      async () => {
        const response = await axios.get(
          `${API_DOMAIN}/product/${encodeURIComponent(productId)}${params}`,
        );
        if (!response?.data) throw new Error('Something went wrong!');
        return response.data;
      },
      PRODUCT_DETAIL_CACHE_TTL,
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const setProductActive = async (productId, isActive) => {
  try {
    const response = await axios.patch(`${API_DOMAIN}/product/${encodeURIComponent(productId)}/active`, {
      isActive,
    });
    if (!response?.data) throw new Error('Something went wrong!');
    invalidateRequestCacheByPrefix('products:');
    invalidateRequestCacheByPrefix('product:detail:');
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateProduct = async (productId, data) => {
  try {
    const response = await axios.put(`${API_DOMAIN}/product/${encodeURIComponent(productId)}`, data);
    if (!response?.data) throw new Error('Something went wrong!');
    invalidateRequestCacheByPrefix('products:');
    invalidateRequestCacheByPrefix('product:detail:');
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const addProduct = async (data) => {
  try {
    const response = await axios.post(`${API_DOMAIN}/product`, data);
    if (!response) throw new Error('Something went wrong!');
    invalidateRequestCacheByPrefix('products:');
    invalidateRequestCacheByPrefix('product:detail:');
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};