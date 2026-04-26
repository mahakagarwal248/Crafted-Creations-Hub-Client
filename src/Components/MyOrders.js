import moment from 'moment';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import Navbar from './Navbar';
import TableComp from './Table';
import { useAuth } from '../context/AuthContext';
import { getOrdersForUser } from '../APIs/Orders';
import './Catalogue.css';
import './MyOrders.css';

function formatShipping(addr) {
  if (!addr || typeof addr !== 'object') return '—';
  const street = addr.address?.trim();
  const cityState = [addr.city, addr.state].filter(Boolean).join(', ').trim();
  const zip = addr.zip != null ? String(addr.zip).trim() : '';
  const lines = [street, cityState || null, zip || null].filter(Boolean);
  if (!lines.length) return '—';
  return (
    <div className="my-orders-address">
      {lines.map((line, i) => (
        <span key={i} className="my-orders-address-line">
          {line}
        </span>
      ))}
    </div>
  );
}

function formatStatus(value) {
  const s = value != null ? String(value) : '';
  const key = s.toLowerCase().replace(/\s+/g, '');
  return <span className={`my-orders-status my-orders-status--${key}`}>{s || '—'}</span>;
}

const columns = [
  {
    key: 'items',
    label: 'Items',
    format: (items) =>
      Array.isArray(items) && items.length
        ? items.map((item) => `${item.name} × ${item.quantity ?? 0}`).join(', ')
        : '—',
  },
  {
    key: 'shippingAddress',
    label: 'Ship to',
    format: (addr) => formatShipping(addr),
  },
  {
    key: 'totalAmount',
    label: 'Total (₹)',
    format: (v) => (v != null ? `₹${Number(v).toFixed(0)}` : '—'),
  },
  {
    key: 'amountPaid',
    label: 'Paid (₹)',
    format: (v) => (v != null ? `₹${Number(v).toFixed(0)}` : '—'),
  },
  {
    key: 'pendingAmount',
    label: 'Pending (₹)',
    format: (v) => (v != null ? `₹${Number(v).toFixed(0)}` : '—'),
  },
  {
    key: 'status',
    label: 'Status',
    format: (v) => formatStatus(v),
  },
  {
    key: 'placedAt',
    label: 'Placed',
    format: (value) => (value ? moment(value).format('DD MMM YYYY, h:mm a') : '—'),
  },
];

function MyOrders() {
  const { user, isHydrated } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    getOrdersForUser(user._id)
      .then((data) => {
        if (!cancelled) setOrders(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setOrders([]);
          setError(err?.response?.data?.message || err?.message || 'Could not load orders.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  if (!isHydrated) {
    return null;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="catalogue-page">
      <Navbar />
      <Container fluid="lg" className="catalogue-inner pt-3">
        <header className="my-orders-head">
          <h1 className="my-orders-title">My orders</h1>
          <p className="my-orders-sub">Orders linked to your account ({user.email})</p>
        </header>

        <div className="my-orders-shell">
          {loading ? (
            <div className="my-orders-loading">
              <Spinner animation="border" size="sm" variant="light" role="status" />
            </div>
          ) : error ? (
            <p className="my-orders-error">{error}</p>
          ) : (
            <TableComp
              data={orders}
              columns={columns}
              keyField="_id"
              emptyMessage="You have not placed any orders yet."
              className="my-orders-table"
              style={{ width: '100%', margin: 0 }}
            />
          )}
        </div>
      </Container>
    </div>
  );
}

export default MyOrders;
