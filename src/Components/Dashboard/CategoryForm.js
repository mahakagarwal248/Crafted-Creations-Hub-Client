import { useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { createCategory, updateCategory } from '../../APIs/categoryApi';

const MAX_FILE_BYTES = 2 * 1024 * 1024;

const makeEmptyEntry = () => ({
  uid: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  _id: null,
  name: '',
  description: '',
  isOccasional: false,
  isDynamicPriceCategory: false,
  imagePreview: '',
  imageCleared: false,
  isExisting: false,
});

const makeEditingEntry = (editing) => ({
  uid: editing._id || `edit-${Date.now()}`,
  _id: editing._id || null,
  name: editing.name || '',
  description: editing.description || '',
  isOccasional: Boolean(editing.isOccasional),
  isDynamicPriceCategory: Boolean(editing.isDynamicPriceCategory),
  imagePreview: editing.imageUrl || '',
  imageCleared: false,
  isExisting: true,
});

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function CategoryForm({ editing, onSaved, onCancelEdit }) {
  const [entries, setEntries] = useState([makeEmptyEntry()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRefs = useRef({});

  useEffect(() => {
    if (editing) {
      setEntries([makeEditingEntry(editing)]);
    } else {
      setEntries([makeEmptyEntry()]);
    }
    fileInputRefs.current = {};
  }, [editing]);

  const updateEntry = (uid, patch) => {
    setEntries((prev) => prev.map((entry) => (entry.uid === uid ? { ...entry, ...patch } : entry)));
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, makeEmptyEntry()]);
  };

  const removeEntry = (uid) => {
    setEntries((prev) => {
      const target = prev.find((entry) => entry.uid === uid);
      if (target?.isExisting) {
        onCancelEdit?.();
        return prev;
      }
      if (prev.length <= 1) {
        return [makeEmptyEntry()];
      }
      return prev.filter((entry) => entry.uid !== uid);
    });
    delete fileInputRefs.current[uid];
  };

  const onImageChange = async (uid, e) => {
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
      const dataUrl = await readFileAsDataUrl(file);
      updateEntry(uid, { imagePreview: dataUrl, imageCleared: false });
    } catch {
      window.alert('Could not read the image.');
    }
  };

  const clearImage = (uid) => {
    updateEntry(uid, { imagePreview: '', imageCleared: true });
    const ref = fileInputRefs.current[uid];
    if (ref) ref.value = '';
  };

  const buildPayload = (entry) => {
    const payload = {
      name: entry.name.trim(),
      description: entry.description?.trim() || undefined,
      isOccasional: entry.isOccasional,
      isDynamicPriceCategory: entry.isDynamicPriceCategory,
    };
    if (entry.imageCleared) {
      payload.imageUrl = null;
    } else if (entry.imagePreview) {
      payload.imageUrl = entry.imagePreview;
    }
    return payload;
  };

  const onSubmit = async (e) => {
    e?.preventDefault();

    const trimmedEntries = entries.map((entry) => ({ ...entry, name: entry.name.trim() }));

    for (let i = 0; i < trimmedEntries.length; i += 1) {
      if (!trimmedEntries[i].name) {
        window.alert(`Category #${i + 1}: name is required.`);
        return;
      }
    }

    const names = trimmedEntries.map((entry) => entry.name.toLowerCase());
    const duplicate = names.find((name, idx) => names.indexOf(name) !== idx);
    if (duplicate) {
      window.alert(`Duplicate category name in form: "${duplicate}".`);
      return;
    }

    setIsSubmitting(true);
    const failures = [];
    let createdCount = 0;
    let updatedCount = 0;

    for (const entry of trimmedEntries) {
      try {
        const payload = buildPayload(entry);
        if (entry._id) {
          await updateCategory(entry._id, payload);
          updatedCount += 1;
        } else {
          await createCategory(payload);
          createdCount += 1;
        }
      } catch (err) {
        failures.push({
          name: entry.name,
          message: err?.response?.data?.message || err?.message || 'Unknown error',
        });
      }
    }

    setIsSubmitting(false);

    if (failures.length) {
      const detail = failures.map((f) => `• ${f.name}: ${f.message}`).join('\n');
      window.alert(`Some categories could not be saved:\n${detail}`);
    } else {
      const parts = [];
      if (updatedCount) parts.push(`${updatedCount} updated`);
      if (createdCount) parts.push(`${createdCount} created`);
      window.alert(`Categories saved (${parts.join(', ') || 'no changes'}).`);
    }

    if (!editing) {
      setEntries([makeEmptyEntry()]);
      fileInputRefs.current = {};
    }

    onSaved?.();
  };

  return (
    <div className="dashboard-panel" style={{ maxWidth: 560 }}>
      <h3>{editing ? 'Edit category' : 'Add categories'}</h3>
      <Form onSubmit={onSubmit}>
        {entries.map((entry, index) => {
          const canRemove = entry.isExisting ? Boolean(onCancelEdit) : entries.length > 1 || !editing;
          return (
            <div key={entry.uid} className="dashboard-category-entry">
              <div className="dashboard-category-entry-header">
                <span className="dashboard-category-entry-title">
                  {entry.isExisting
                    ? `Editing: ${entry.name || 'category'}`
                    : `New category${entries.length > 1 ? ` #${index + 1}` : ''}`}
                </span>
                {canRemove && (
                  <Button
                    type="button"
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeEntry(entry.uid)}
                    disabled={isSubmitting}
                  >
                    {entry.isExisting ? 'Cancel edit' : 'Remove'}
                  </Button>
                )}
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Category name"
                  value={entry.name}
                  onChange={(e) => updateEntry(entry.uid, { name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Optional"
                  value={entry.description}
                  onChange={(e) => updateEntry(entry.uid, { description: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Category image</Form.Label>
                <Form.Control
                  ref={(el) => {
                    if (el) fileInputRefs.current[entry.uid] = el;
                  }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageChange(entry.uid, e)}
                />
                <Form.Text className="text-muted">
                  Shown on the homepage category tiles. Max 2 MB, square images work best.
                </Form.Text>
                {entry.imagePreview && (
                  <div className="mt-2 d-flex flex-wrap gap-2 align-items-center">
                    <img
                      src={entry.imagePreview}
                      alt=""
                      className="dashboard-thumb"
                      style={{ width: 96, height: 96, objectFit: 'cover' }}
                    />
                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => clearImage(entry.uid)}
                    >
                      Remove image
                    </Button>
                  </div>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id={`category-is-occasional-${entry.uid}`}
                  label="Occasional category"
                  checked={entry.isOccasional}
                  onChange={(e) => updateEntry(entry.uid, { isOccasional: e.target.checked })}
                />
                <Form.Text className="text-muted">
                  Mark seasonal or limited-run categories shoppers should know about.
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id={`category-is-dynamic-price-${entry.uid}`}
                  label="Dynamic price category"
                  checked={entry.isDynamicPriceCategory}
                  onChange={(e) =>
                    updateEntry(entry.uid, { isDynamicPriceCategory: e.target.checked })
                  }
                />
                <Form.Text className="text-muted">
                  Products in this category will show a "Starting from" label before the price.
                </Form.Text>
              </Form.Group>
            </div>
          );
        })}

        <div className="dashboard-category-actions">
          <Button
            type="button"
            variant="outline-primary"
            size="sm"
            onClick={addEntry}
            disabled={isSubmitting}
          >
            + Add another category
          </Button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : editing
              ? entries.length > 1
                ? 'Save all'
                : 'Update'
              : entries.length > 1
              ? `Add ${entries.length} categories`
              : 'Add category'}
          </Button>
          {editing && onCancelEdit && (
            <Button
              type="button"
              variant="outline-secondary"
              onClick={onCancelEdit}
              disabled={isSubmitting}
            >
              Cancel edit
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
}

export default CategoryForm;
