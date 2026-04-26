import axios from 'axios';
import { API_DOMAIN } from '../Constants';

export const sendCheckoutEmail = async ({
  name,
  phone,
  streetAddress,
  city,
  state,
  pincode,
  cartItems,
  totalAmount,
}) => {
  const response = await axios.post(`${API_DOMAIN}/checkout/send-email`, {
    name,
    phone,
    streetAddress,
    city,
    state,
    pincode,
    cartItems: cartItems || [],
    totalAmount: totalAmount ?? 0,
  });
  return response.data;
};
