import axios from 'axios';
import { API_DOMAIN } from '../Constants';

export const addOrders = async(data) => {
    try {
        const response = await axios.post(`${API_DOMAIN}/orders`, data);
        if(!response) throw new Error("Something went wrong!");
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const addExpenses = async(data) => {
    try {
        const response = await axios.post(`${API_DOMAIN}/orders/add-expense`, data);
        if(!response) throw new Error("Something went wrong!");
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getExpenses = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const response = await axios.get(
      `${API_DOMAIN}/orders/get-expenses?page=${page}&limit=${limit}`
    );
    if (!response) throw new Error('Something went wrong!');
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getOrders = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const response = await axios.get(`${API_DOMAIN}/orders?page=${page}&limit=${limit}`);
    if (!response) throw new Error('Something went wrong!');
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getOrdersForUser = async (userId) => {
    try {
        const response = await axios.get(`${API_DOMAIN}/orders/by-user/${encodeURIComponent(userId)}`);
        if (!response) throw new Error("Something went wrong!");
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await axios.patch(`${API_DOMAIN}/orders/${orderId}`, { status });
        if (!response) throw new Error("Something went wrong!");
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}