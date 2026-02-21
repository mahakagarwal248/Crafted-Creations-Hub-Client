import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { addProduct } from '../../APIs/index';

const initialProduct = {
  name: '',
  description: '',
  category: '',
  price: '',
  minDaysToDispatch: '',
};

function AddProducts({ onProductAdded, onCancel }) {
  const [product, setProduct] = useState(initialProduct);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e) => {
    e?.preventDefault();
    if (isSubmitting) return;
    const name = product.name?.trim();
    const category = product.category?.trim();
    const price = Number(product.price);
    const minDaysToDispatch = Number(product.minDaysToDispatch);
    if (!name || !category || !price || isNaN(price) || price < 0) {
      window.alert('Name, category and price are required. Price must be ≥ 0.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        description: product.description?.trim() || undefined,
        category,
        price,
        minDaysToDispatch: !isNaN(minDaysToDispatch) && minDaysToDispatch >= 0 ? minDaysToDispatch : undefined,
      };
      const response = await addProduct(payload);
      if (response && response.status === 200) {
        window.alert('Product added successfully!');
        setProduct(initialProduct);
        onProductAdded?.();
      } else {
        window.alert(response?.data?.message || 'Failed to add product.');
      }
    } catch (err) {
      window.alert(err?.response?.data?.message || err?.message || 'Failed to add product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formStyle = {
    border: '1px solid #dee2e6',
    padding: '6px 10px',
    borderRadius: '6px',
    width: '100%',
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <h3 style={{ textAlign: 'center' }}>Add Product</h3>
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Name *</Form.Label>
          <Form.Control
            type="text"
            placeholder="Product name"
            value={product.name}
            onChange={(e) => setField('name', e.target.value)}
            style={formStyle}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Description (optional)"
            value={product.description}
            onChange={(e) => setField('description', e.target.value)}
            style={formStyle}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Category *</Form.Label>
          <Form.Control
            type="text"
            placeholder="Category"
            value={product.category}
            onChange={(e) => setField('category', e.target.value)}
            style={formStyle}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Price *</Form.Label>
          <Form.Control
            type="number"
            min={0}
            step="0.01"
            placeholder="0"
            value={product.price}
            onChange={(e) => setField('price', e.target.value)}
            style={formStyle}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Min days to dispatch</Form.Label>
          <Form.Control
            type="number"
            min={0}
            placeholder="Optional"
            value={product.minDaysToDispatch}
            onChange={(e) => setField('minDaysToDispatch', e.target.value)}
            style={formStyle}
          />
        </Form.Group>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Product'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline-secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
}

export default AddProducts;
