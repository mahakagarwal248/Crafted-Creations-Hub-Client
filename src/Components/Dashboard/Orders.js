import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { getOrders, updateOrderStatus } from '../../APIs/Orders';
import TableComp from '../Table';
import DashboardPagination from './DashboardPagination';

const COMPLETE_STATUS = 'DELIVERED';
const PAGE_SIZE = 10;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getOrders({ page, limit: PAGE_SIZE });
      if (response?.status === 200) {
        const data = response.data;
        setOrders(data?.items || []);
        setTotalPages(data?.totalPages ?? 1);
        setTotalCount(data?.totalCount ?? 0);
        if (data?.page) setPage(data.page);
      } else {
        window.alert(response);
      }
    } catch (err) {
      window.alert(err?.response?.data?.message || err?.message || 'Failed to load orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleMarkComplete = async (orderId) => {
    if (updatingId) return;
    setUpdatingId(orderId);
    try {
      const response = await updateOrderStatus(orderId, COMPLETE_STATUS);
      if (response?.status === 200 && response.data?.data) {
        const updatedOrder = response.data.data;
        setOrders((prev) => prev.map((o) => (o._id === orderId ? updatedOrder : o)));
      } else {
        window.alert(response?.data?.message || 'Failed to update status.');
      }
    } catch (err) {
      window.alert(err?.response?.data?.message || err?.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const ordersColumns = [
    {
      key: 'items',
      label: 'Items',
      format: (items) =>
        Array.isArray(items) && items.length
          ? items.map((item) => `${item.name} (${item.quantity ?? 0})`).join(', ')
          : '—',
    },
    {
      key: 'shippingAddress',
      label: 'Shipping Address',
      format: (addr) => {
        if (!addr || typeof addr !== 'object') return '—';
        const parts = [addr.address, addr.city, addr.state, addr.zip].filter(Boolean);
        return parts.length ? parts.join(', ') : '—';
      },
    },
    { key: 'totalAmount', label: 'Total Amount' },
    { key: 'amountPaid', label: 'Amount Paid' },
    { key: 'pendingAmount', label: 'Pending Amount' },
    { key: 'status', label: 'Status' },
    {
      key: 'placedAt',
      label: 'Placed At',
      format: (value) => (value ? moment(value).format('DD-MM-YYYY hh:mm') : ''),
    },
    {
      key: 'action',
      label: 'Action',
      format: (_, row) =>
        row.status === COMPLETE_STATUS ? (
          <span className="dashboard-status-complete">Complete</span>
        ) : (
          <Button
            variant="success"
            size="sm"
            className="btn-dashboard-success"
            onClick={() => handleMarkComplete(row._id)}
            disabled={updatingId === row._id}
          >
            {updatingId === row._id ? 'Updating...' : 'Mark complete'}
          </Button>
        ),
    },
  ];

  return (
    <div className="dashboard-panel" style={{ overflowX: 'auto' }}>
      <h4>All orders</h4>
      {loading && !orders.length ? (
        <p className="text-muted mb-0">Loading orders...</p>
      ) : (
        <>
          <TableComp
            data={orders}
            columns={ordersColumns}
            keyField="_id"
            emptyMessage="No orders found."
            className="dashboard-table table-borderless"
            style={{ width: '100%', margin: 0 }}
          />
          <DashboardPagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            disabled={loading}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

export default Orders;
