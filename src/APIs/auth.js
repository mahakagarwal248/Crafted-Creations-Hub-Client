import axios from 'axios';
import { API_DOMAIN } from '../Constants';

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_DOMAIN}/users/login`, { email, password });
  return response.data;
};
