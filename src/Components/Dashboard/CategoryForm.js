import { useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { createCategory, updateCategory } from '../../APIs/categoryApi';

const emptyForm = { name: '', description: '', isOccasional: false };
const MAX_FILE_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function CategoryForm({ editing, onSaved, onCancelEdit }) {
  const [form, setForm] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState('');
  const [imageCleared, setImageCleared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || '',
        description: editing.description || '',
        isOccasional: Boolean(editing.isOccasional),
      });
      setImagePreview(editing.imageUrl || '');
      setImageCleared(false);
    } else {
      setForm(emptyForm);
      setImagePreview('');
      setImageCleared(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [editing]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      window.alert('Please choose an image file.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      window.alert('Image is too large (max 2 MB).');
      return;
    }
    try {
      setImagePreview(await readFileAsDataUrl(file));
      setImageCleared(false);
    } catch {
      window.alert('Could not read the image.');
    }
  };

  const clearImage = () => {
    setImagePreview('');
    setImageCleared(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (e) => {
    e?.preventDefault();
    const name = form.name?.trim();
    if (!name) {
      window.alert('Category name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        description: form.description?.trim() || undefined,
        isOccasional: form.isOccasional,
      };
      if (imageCleared) {
        payload.imageUrl = null;
      } else if (imagePreview) {
        payload.imageUrl = imagePreview;
      }
      if (editing?._id) {
        await updateCategory(editing._id, payload);
        window.alert('Category updated.');
      } else {
        await createCategory(payload);
        window.alert('Category created.');
        setForm(emptyForm);
        setImagePreview('');
        setImageCleared(false);
      }
      onSaved?.();
    } catch (err) {
      window.alert(err?.response?.data?.message || err?.message || 'Could not save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-panel" style={{ maxWidth: 480 }}>
      <h3>{editing ? 'Edit category' : 'Add category'}</h3>
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Name *</Form.Label>
          <Form.Control
            type="text"
            placeholder="Category name"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Optional"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Category image</Form.Label>
          <Form.Control
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageChange}
          />
          <Form.Text className="text-muted">
            Shown on the homepage category tiles. Max 2 MB, square images work best.
          </Form.Text>
          {imagePreview && (
            <div className="mt-2 d-flex flex-wrap gap-2 align-items-center">
              <img
                src={imagePreview}
                alt=""
                className="dashboard-thumb"
                style={{ width: 96, height: 96, objectFit: 'cover' }}
              />
              <Button type="button" variant="outline-secondary" size="sm" onClick={clearImage}>
                Remove image
              </Button>
            </div>
          )}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check
            type="switch"
            id="category-is-occasional"
            label="Occasional category"
            checked={form.isOccasional}
            onChange={(e) => setField('isOccasional', e.target.checked)}
          />
          <Form.Text className="text-muted">
            Mark seasonal or limited-run categories shoppers should know about.
          </Form.Text>
        </Form.Group>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : editing ? 'Update' : 'Add category'}
          </Button>
          {editing && onCancelEdit && (
            <Button type="button" variant="outline-secondary" onClick={onCancelEdit} disabled={isSubmitting}>
              Cancel edit
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
}

export default CategoryForm;
