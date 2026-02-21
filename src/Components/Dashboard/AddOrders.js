import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { addOrders } from '../../APIs/Orders';

const initialProductRow = () => ({ productId: '', quantity: 0 });

function AddOrders() {
  const [productRows, setProductRows] = useState([initialProductRow()]);
  const [orderDetails, setOrderDetails] = useState({
    customerId: '68bf26d76e5cd2f5a15e9cc1',
    discount: 0,
    amountPaid: 0,
  });
  const [isSubmitClicked, setIsSubmitClicked] = useState(false);

  const setOrderField = (field, value) => {
    setOrderDetails((prev) => ({ ...prev, [field]: value }));
  };

  const setProductRow = (index, field, value) => {
    setProductRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: field === 'quantity' ? Number(value) || 0 : value };
      return next;
    });
  };

  const addProductRow = () => {
    setProductRows((prev) => [...prev, initialProductRow()]);
  };

  const removeProductRow = (index) => {
    if (productRows.length <= 1) return;
    setProductRows((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    if (isSubmitClicked) return;
    setIsSubmitClicked(true);

    const validRows = productRows.filter((row) => row.productId.trim() !== '' && row.quantity > 0);
    if (validRows.length === 0) {
      window.alert('Add at least one product with Product Id and Quantity > 0.');
      setIsSubmitClicked(false);
      return;
    }

    const payload = {
      productDetails: validRows.map((row) => ({
        productId: row.productId.trim(),
        quantity: row.quantity,
      })),
      customerId: orderDetails.customerId,
      discount: Number(orderDetails.discount) || 0,
      amountPaid: Number(orderDetails.amountPaid) || 0,
    };

    try {
      const response = await addOrders(payload);
      if (response && response.status === 200) {
        window.alert('Order added successfully!');
        setProductRows([initialProductRow()]);
      } else {
        window.alert(response?.data?.message || response || 'Something went wrong.');
      }
    } catch (err) {
      window.alert(err?.response?.data?.message || err?.message || 'Failed to add order.');
    } finally {
      setIsSubmitClicked(false);
    }
  };

  const formControlStyle = {
    border: '1px solid #dee2e6',
    padding: '6px 10px',
    borderRadius: '6px',
    width: '100%',
  };

  return (
    <div style={{ maxWidth: 720, margin: 'auto' }}>
      <h3>Add Order</h3>

      <div style={{ marginBottom: '1.5rem' }}>
        <h5 className="mb-3">Products</h5>
        <Table bordered size="sm">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Product Id</th>
              <th style={{ width: '25%' }}>Quantity</th>
              <th style={{ width: '25%' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {productRows.map((row, index) => (
              <tr key={index}>
                <td>
                  <Form.Control
                    type="text"
                    placeholder="Product Id"
                    value={row.productId}
                    onChange={(e) => setProductRow(index, 'productId', e.target.value)}
                    style={formControlStyle}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={row.quantity || ''}
                    onChange={(e) => setProductRow(index, 'quantity', e.target.value)}
                    style={formControlStyle}
                  />
                </td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeProductRow(index)}
                    disabled={productRows.length <= 1}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button variant="outline-primary" size="sm" onClick={addProductRow}>
          + Add another product
        </Button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h5 className="mb-3">Order details</h5>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ minWidth: 200, flex: 1 }}>
            <Form.Label>Customer Id</Form.Label>
            <Form.Control
              type="text"
              placeholder="Customer Id"
              value={orderDetails.customerId}
              onChange={(e) => setOrderField('customerId', e.target.value)}
              style={formControlStyle}
            />
          </div>
          <div style={{ minWidth: 120 }}>
            <Form.Label>Discount (%)</Form.Label>
            <Form.Control
              type="number"
              min={0}
              placeholder="0"
              value={orderDetails.discount || ''}
              onChange={(e) => setOrderField('discount', e.target.value)}
              style={formControlStyle}
            />
          </div>
          <div style={{ minWidth: 120 }}>
            <Form.Label>Amount Paid</Form.Label>
            <Form.Control
              type="number"
              min={0}
              placeholder="0"
              value={orderDetails.amountPaid || ''}
              onChange={(e) => setOrderField('amountPaid', e.target.value)}
              style={formControlStyle}
            />
          </div>
        </div>
      </div>

      <Button variant="primary" onClick={onSubmit} disabled={isSubmitClicked}>
        {isSubmitClicked ? 'Submitting...' : 'Submit Order'}
      </Button>
    </div>
  );
}

export default AddOrders;
