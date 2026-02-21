import moment from 'moment';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { getOrders, updateOrderStatus } from '../../APIs/Orders';
import TableComp from '../Table';

const COMPLETE_STATUS = 'DELIVERED';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const response = await getOrders();
    if (response && response.status === 200) setOrders(response.data || []);
    else window.alert(response);
  };

  const handleMarkComplete = async (orderId) => {
    if (updatingId) return;
    setUpdatingId(orderId);
    try {
      const response = await updateOrderStatus(orderId, COMPLETE_STATUS);
      if (response && response.status === 200 && response.data?.data) {
        const updatedOrder = response.data.data;
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? updatedOrder : o))
        );
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
          <span className="text-success">Complete</span>
        ) : (
          <Button
            variant="success"
            size="sm"
            onClick={() => handleMarkComplete(row._id)}
            disabled={updatingId === row._id}
          >
            {updatingId === row._id ? 'Updating...' : 'Mark complete'}
          </Button>
        ),
    },
  ];

  return (
    <div>
      <h4>All Orders</h4>
      <TableComp
        data={orders}
        columns={ordersColumns}
        keyField="_id"
        emptyMessage="No Orders found!"
      />
    </div>
  );
}

export default Orders;
