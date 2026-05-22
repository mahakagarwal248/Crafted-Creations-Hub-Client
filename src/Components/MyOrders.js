import moment from 'moment';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import Navbar from './Navbar';
import TableComp from './Table';
import ReviewModal from './ReviewModal';
import { useAuth } from '../context/AuthContext';
import { getOrdersForUser } from '../APIs/Orders';
import { downloadOrderInvoicePdf } from '../APIs/invoiceApi';
import { getReviewsByUser } from '../APIs/reviewApi';
import './Catalogue.css';
import './MyOrders.css';

const reviewKey = (orderId, productId) => `${orderId}::${productId}`;

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

function MyOrders() {
  const { user, isHydrated } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewedKeys, setReviewedKeys] = useState(new Set());
  const [reviewTarget, setReviewTarget] = useState(null);

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([
      getOrdersForUser(user._id),
      getReviewsByUser(user._id).catch(() => ({ data: { data: [] } })),
    ])
      .then(([ordersData, reviewsRes]) => {
        if (cancelled) return;
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        const reviews = reviewsRes?.data?.data || [];
        setReviewedKeys(new Set(reviews.map((r) => reviewKey(r.orderId, r.productId))));
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

  const handleReviewSubmitted = (review) => {
    if (!review?.orderId || !review?.productId) return;
    setReviewedKeys((prev) => {
      const next = new Set(prev);
      next.add(reviewKey(review.orderId, review.productId));
      return next;
    });
  };

  const columns = [
    {
      key: 'items',
      label: 'Items',
      format: (items, row) => {
        if (!Array.isArray(items) || !items.length) return '—';
        const canReview = row?.status === 'DELIVERED';
        return (
          <ul className="my-orders-items">
            {items.map((item) => {
              const reviewed = reviewedKeys.has(reviewKey(row._id, item.productId));
              return (
                <li key={`${row._id}-${item.productId}`} className="my-orders-item">
                  <span className="my-orders-item-name">
                    {item.name} × {item.quantity ?? 0}
                  </span>
                  {canReview ? (
                    reviewed ? (
                      <span className="my-orders-review-done">Reviewed</span>
                    ) : (
                      <button
                        type="button"
                        className="my-orders-review-btn"
                        onClick={() => setReviewTarget({ order: row, item })}
                      >
                        Review
                      </button>
                    )
                  ) : null}
                </li>
              );
            })}
          </ul>
        );
      },
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
    {
      key: 'invoice',
      label: 'Invoice',
      format: (_, row) => {
        if (!row?.hasInvoice && !row?.invoiceNumber) {
          return <span className="my-orders-invoice-pending">Not yet</span>;
        }
        return (
          <button
            type="button"
            className="my-orders-invoice-link"
            onClick={async () => {
              try {
                await downloadOrderInvoicePdf(row._id, `${row.invoiceNumber || `invoice-${row._id}`}.pdf`);
              } catch (err) {
                window.alert(err?.response?.data?.message || err?.message || 'Could not download invoice.');
              }
            }}
          >
            Download
          </button>
        );
      },
    },
  ];

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

      <ReviewModal
        show={!!reviewTarget}
        onHide={() => setReviewTarget(null)}
        item={reviewTarget?.item}
        order={reviewTarget?.order}
        user={user}
        onSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}

export default MyOrders;
