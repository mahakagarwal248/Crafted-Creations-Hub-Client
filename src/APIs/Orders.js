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

export const getExpenses = async(data) => {
    try {
        const response = await axios.get(`${API_DOMAIN}/orders/get-expenses`);
        if(!response) throw new Error("Something went wrong!");
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getOrders = async() => {
    try {
        const response = await axios.get(`${API_DOMAIN}/orders`);
        if(!response) throw new Error("Something went wrong!");
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

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