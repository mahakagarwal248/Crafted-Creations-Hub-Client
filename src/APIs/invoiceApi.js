import axios from './axiosClient';
import { API_DOMAIN } from '../Constants';

export const generateOrderInvoice = async (orderId) => {
  const response = await axios.post(`${API_DOMAIN}/orders/${orderId}/invoice`);
  return response;
};

export const getOrderInvoice = async (orderId) => {
  const response = await axios.get(`${API_DOMAIN}/orders/${orderId}/invoice`);
  return response;
};

export const getOrderInvoicePdfUrl = (orderId, { download } = {}) => {
  const params = new URLSearchParams();
  if (download) params.set('download', '1');
  const qs = params.toString();
  return `${API_DOMAIN}/orders/${orderId}/invoice/pdf${qs ? `?${qs}` : ''}`;
};

/** Fetch the invoice PDF as a blob (so the Authorization header is sent) and return a temporary object URL. */
export const fetchOrderInvoicePdfBlobUrl = async (orderId, { download } = {}) => {
  const url = getOrderInvoicePdfUrl(orderId, { download });
  const response = await axios.get(url, { responseType: 'blob' });
  return URL.createObjectURL(response.data);
};

/** Trigger a browser download for an invoice PDF (auth header is attached automatically). */
export const downloadOrderInvoicePdf = async (orderId, fileName) => {
  const objectUrl = await fetchOrderInvoicePdfBlobUrl(orderId, { download: true });
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = fileName || `invoice-${orderId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
};
