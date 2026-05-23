import { useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { getCategories } from '../../APIs/categoryApi';
import { addProduct, updateProduct } from '../../APIs/index';

const initialProduct = {
  name: '',
  description: '',
  price: '',
  minDaysToDispatch: '',
};

const MAX_FILES = 8;
const MAX_FILE_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function categoryIdsFromProduct(product) {
  if (!product?.category?.length) return [];
  return product.category
    .map((c) => (typeof c === 'object' && c?._id ? String(c._id) : null))
    .filter(Boolean);
}

function ProductForm({ editing, onSaved, onCancel }) {
  const [product, setProduct] = useState(initialProduct);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotoDataUrls, setNewPhotoDataUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (editing) {
      setProduct({
        name: editing.name || '',
        description: editing.description || '',
        price: editing.price != null ? String(editing.price) : '',
        minDaysToDispatch:
          editing.minDaysToDispatch != null ? String(editing.minDaysToDispatch) : '',
      });
      setSelectedCategoryIds(categoryIdsFromProduct(editing));
      setExistingPhotos(Array.isArray(editing.photos) ? [...editing.photos] : []);
      setNewPhotoDataUrls([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setProduct(initialProduct);
      setSelectedCategoryIds([]);
      setExistingPhotos([]);
      setNewPhotoDataUrls([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [editing]);

  const addCategoryId = (id) => {
    if (!id) return;
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeCategoryId = (id) => {
    setSelectedCategoryIds((prev) => prev.filter((cid) => cid !== id));
  };

  const getCategoryName = (id) => {
    const found = categories.find((c) => String(c._id) === String(id));
    return found?.name || 'Unknown';
  };

  const availableCategories = categories.filter(
    (c) => !selectedCategoryIds.includes(String(c._id)),
  );

  const setField = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const removeExistingPhoto = (index) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewPhoto = (index) => {
    setNewPhotoDataUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onPhotoFilesChange = async (e) => {
    const slotsLeft = MAX_FILES - existingPhotos.length - newPhotoDataUrls.length;
    if (slotsLeft <= 0) {
      window.alert(`Maximum ${MAX_FILES} photos allowed.`);
      return;
    }
    const files = Array.from(e.target.files || []).slice(0, slotsLeft);
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
    setNewPhotoDataUrls((prev) => [...prev, ...urls].slice(0, MAX_FILES - existingPhotos.length));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (e) => {
    e?.preventDefault();
    if (isSubmitting) return;
    const name = product.name?.trim();
    const price = Number(product.price);
    const minDaysToDispatch = Number(product.minDaysToDispatch);
    if (!name || selectedCategoryIds.length === 0 || !price || isNaN(price) || price < 0) {
      window.alert('Name, at least one category, and price are required. Price must be ≥ 0.');
      return;
    }
    if (isNaN(minDaysToDispatch) || minDaysToDispatch < 0) {
      window.alert('Min days to dispatch must be a number ≥ 0.');
      return;
    }
    if (!categories.length) {
      window.alert('Create at least one category before saving a product.');
      return;
    }

    const allPhotos = [...existingPhotos, ...newPhotoDataUrls].slice(0, MAX_FILES);
    const payload = {
      name,
      description: product.description?.trim() || undefined,
      category: selectedCategoryIds,
      price,
      minDaysToDispatch,
      photos: allPhotos,
    };

    setIsSubmitting(true);
    try {
      let response;
      if (editing?.productId != null) {
        response = await updateProduct(editing.productId, payload);
      } else {
        response = await addProduct(payload);
      }
      if (response && response.status === 200) {
        window.alert(editing ? 'Product updated successfully!' : 'Product added successfully!');
        if (!editing) {
          setProduct(initialProduct);
          setSelectedCategoryIds([]);
          setExistingPhotos([]);
          setNewPhotoDataUrls([]);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
        onSaved?.();
      } else {
        window.alert(response?.data?.message || 'Failed to save product.');
      }
    } catch (err) {
      window.alert(err?.response?.data?.message || err?.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allPhotosPreview = [...existingPhotos, ...newPhotoDataUrls];

  return (
    <div className="dashboard-panel" style={{ maxWidth: 560 }}>
      <h3>{editing ? `Edit product #${editing.productId}` : 'Add product'}</h3>
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
          <Form.Label>Categories *</Form.Label>
          {categories.length === 0 ? (
            <Form.Text className="text-muted d-block">
              No categories yet. Add categories from the Categories tab first.
            </Form.Text>
          ) : (
            <>
              {selectedCategoryIds.length > 0 && (
                <div className="dashboard-category-chips mb-2">
                  {selectedCategoryIds.map((id) => (
                    <span key={id} className="dashboard-category-chip">
                      {getCategoryName(id)}
                      <button
                        type="button"
                        className="dashboard-category-chip-remove"
                        onClick={() => removeCategoryId(id)}
                        aria-label={`Remove ${getCategoryName(id)}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <Form.Select
                value=""
                onChange={(e) => {
                  addCategoryId(e.target.value);
                  e.target.value = '';
                }}
                disabled={availableCategories.length === 0}
              >
                <option value="">
                  {availableCategories.length === 0
                    ? 'All categories selected'
                    : selectedCategoryIds.length === 0
                    ? 'Select a category'
                    : 'Add another category'}
                </option>
                {availableCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Pick one or more categories. Click × on a chip to remove it.
              </Form.Text>
            </>
          )}
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
          <Form.Label>Min days to dispatch *</Form.Label>
          <Form.Control
            type="number"
            min={0}
            placeholder="0"
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
            disabled={allPhotosPreview.length >= MAX_FILES}
            onChange={onPhotoFilesChange}
          />
          <Form.Text className="text-muted">
            Up to {MAX_FILES} images, max 2 MB each. First image is the catalogue thumbnail.
          </Form.Text>
          {allPhotosPreview.length > 0 && (
            <div className="mt-2 d-flex flex-wrap gap-2 align-items-start">
              {existingPhotos.map((src, i) => (
                <div key={`existing-${i}`} className="position-relative">
                  <img src={src} alt="" className="dashboard-thumb" style={{ width: 72, height: 72 }} />
                  <Button
                    type="button"
                    variant="outline-danger"
                    size="sm"
                    className="mt-1 w-100"
                    onClick={() => removeExistingPhoto(i)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {newPhotoDataUrls.map((src, i) => (
                <div key={`new-${i}`} className="position-relative">
                  <img src={src} alt="" className="dashboard-thumb" style={{ width: 72, height: 72 }} />
                  <Button
                    type="button"
                    variant="outline-danger"
                    size="sm"
                    className="mt-1 w-100"
                    onClick={() => removeNewPhoto(i)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Form.Group>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button type="submit" variant="primary" disabled={isSubmitting || !categories.length}>
            {isSubmitting ? 'Saving...' : editing ? 'Update product' : 'Add product'}
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

export default ProductForm;
