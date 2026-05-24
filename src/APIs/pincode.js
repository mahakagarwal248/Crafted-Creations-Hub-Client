import { API_DOMAIN } from '../Constants';

/**
 * Look up city + state for a 6-digit Indian pincode via our backend proxy.
 *
 * @param {string|number} pincode - 6-digit Indian pincode
 * @param {AbortSignal} [signal] - optional abort signal to cancel the request
 * @returns {Promise<{ city: string, state: string, district: string, pincode: string }>}
 */
export async function lookupPincode(pincode, signal) {
  const pin = String(pincode ?? '').trim();
  if (!/^\d{6}$/.test(pin)) {
    throw new Error('PIN code must be 6 digits.');
  }

  const url = `${API_DOMAIN}/pincode?pincode=${encodeURIComponent(pin)}`;
  const response = await fetch(url, { signal });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || `Lookup failed (HTTP ${response.status}).`);
  }
  if (!data?.city || !data?.state) {
    throw new Error('No city / state found for this PIN code.');
  }

  return {
    pincode: String(data.pincode || pin),
    city: String(data.city).trim(),
    state: String(data.state).trim(),
    district: String(data.district || '').trim(),
  };
}
