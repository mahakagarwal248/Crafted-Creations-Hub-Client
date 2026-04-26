import { useState, useRef } from 'react';
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

const MAX_FILES = 8;
const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB per file (keeps request reasonable)

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function AddProducts({ onProductAdded, onCancel }) {
  const [product, setProduct] = useState(initialProduct);
  const [photoDataUrls, setPhotoDataUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const setField = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const onPhotoFilesChange = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_FILES);
    const urls = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        window.alert(`${file.name} is not an image. Skipped.`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        window.alert(`${file.name} is too large (max 2 MB per image).`);
        continue;
      }
      try {
        urls.push(await readFileAsDataUrl(file));
      } catch {
        window.alert(`Could not read ${file.name}.`);
      }
    }
    setPhotoDataUrls(urls);
  };

  const clearPhotos = () => {
    setPhotoDataUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        photos: photoDataUrls.length ? photoDataUrls : undefined,
      };
      const response = await addProduct(payload);
      if (response && response.status === 200) {
        window.alert('Product added successfully!');
        setProduct(initialProduct);
        clearPhotos();
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

  return (
    <div className="dashboard-panel" style={{ maxWidth: 560 }}>
      <h3>Add product</h3>
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Name *</Form.Label>
          <Form.Control
            type="text"
            placeholder="Product name"
            value={product.name}
            onChange={(e) => setField('name', e.target.value)}
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
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Category *</Form.Label>
          <Form.Control
            type="text"
            placeholder="Category"
            value={product.category}
            onChange={(e) => setField('category', e.target.value)}
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
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Photos</Form.Label>
          <Form.Control
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onPhotoFilesChange}
          />
          <Form.Text className="text-muted">
            Up to {MAX_FILES} images, max 2 MB each. First image is used as the main thumbnail in the catalogue.
          </Form.Text>
          {photoDataUrls.length > 0 && (
            <div className="mt-2 d-flex flex-wrap gap-2 align-items-center">
              {photoDataUrls.map((src, i) => (
                <img key={i} src={src} alt="" className="dashboard-thumb" style={{ width: 72, height: 72 }} />
              ))}
              <Button type="button" variant="outline-secondary" size="sm" onClick={clearPhotos}>
                Clear photos
              </Button>
            </div>
          )}
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
