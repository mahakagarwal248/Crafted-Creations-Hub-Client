import { useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { deleteCategory, getCategories } from '../../APIs/categoryApi';
import TableComp from '../Table';
import CategoryForm from './CategoryForm';
import FeaturedHomepageCategories from './FeaturedHomepageCategories';

function CategoriesPanel() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (row) => {
    const id = row?._id;
    if (!id || deletingId) return;
    if (!window.confirm(`Delete category "${row.name}"?`)) return;
    setDeletingId(id);
    try {
      await deleteCategory(id);
      if (editing?._id === id) setEditing(null);
      await fetchCategories();
    } catch (err) {
      window.alert(err?.response?.data?.message || err?.message || 'Could not delete category.');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: 'imageUrl',
      label: 'Image',
      format: (value) =>
        value ? (
          <img src={value} alt="" className="dashboard-thumb" style={{ width: 48, height: 48, objectFit: 'cover' }} />
        ) : (
          '—'
        ),
    },
    { key: 'name', label: 'Name' },
    {
      key: 'description',
      label: 'Description',
      format: (value) => value || '—',
    },
    {
      key: 'isOccasional',
      label: 'Occasional',
      format: (value) => (value ? 'Yes' : 'No'),
    },
    {
      key: 'isDynamicPriceCategory',
      label: 'Dynamic price',
      format: (value) => (value ? 'Yes' : 'No'),
    },
    {
      key: 'homepageOrder',
      label: 'Homepage',
      format: (value) => (value ? `#${value}` : '—'),
    },
    {
      key: '_id',
      label: 'Actions',
      format: (_id, row) => (
        <div className="d-flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline-primary"
            onClick={() => setEditing(row)}
          >
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline-danger"
            disabled={deletingId === _id}
            onClick={() => handleDelete(row)}
          >
            {deletingId === _id ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-stack">
      <CategoryForm
        editing={editing}
        onSaved={() => {
          setEditing(null);
          fetchCategories();
        }}
        onCancelEdit={() => setEditing(null)}
      />
      <FeaturedHomepageCategories />
      <div className="dashboard-panel" style={{ overflowX: 'auto' }}>
        <h4>All categories</h4>
        <TableComp
          data={categories}
          columns={columns}
          keyField="_id"
          emptyMessage="No categories yet. Add one above."
          className="dashboard-table table-borderless"
          style={{ width: '100%', margin: 0 }}
        />
      </div>
    </div>
  );
}

export default CategoriesPanel;
