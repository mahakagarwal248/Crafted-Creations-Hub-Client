import { useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { getCategories, setFeaturedHomepageCategories } from '../../APIs/categoryApi';

const MAX_SLOTS = 5;

function FeaturedHomepageCategories() {
  const [featured, setFeatured] = useState([]);
  const [pool, setPool] = useState([]);
  const [dragSource, setDragSource] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getCategories();
      const list = Array.isArray(data) ? data : [];
      const slots = list
        .filter((c) => c.homepageOrder >= 1 && c.homepageOrder <= MAX_SLOTS)
        .sort((a, b) => a.homepageOrder - b.homepageOrder);
      const rest = list.filter((c) => !c.homepageOrder);
      setFeatured(slots);
      setPool(rest);
      setIsDirty(false);
    } catch {
      setFeatured([]);
      setPool([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addToFeatured = (cat) => {
    if (featured.length >= MAX_SLOTS) return;
    if (featured.some((c) => c._id === cat._id)) return;
    setFeatured((prev) => [...prev, cat]);
    setPool((prev) => prev.filter((c) => c._id !== cat._id));
    setIsDirty(true);
  };

  const removeFromFeatured = (cat) => {
    setFeatured((prev) => prev.filter((c) => c._id !== cat._id));
    setPool((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
    setIsDirty(true);
  };

  const reorderFeatured = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setFeatured((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setIsDirty(true);
  };

  const onDragStartSlot = (index) => {
    setDragSource({ type: 'slot', index });
  };

  const onDragStartPool = (cat) => {
    setDragSource({ type: 'pool', cat });
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDropSlot = (index) => {
    if (!dragSource) return;
    if (dragSource.type === 'slot') {
      reorderFeatured(dragSource.index, index);
    } else if (dragSource.type === 'pool') {
      if (featured.length >= MAX_SLOTS && !featured[index]) return;
      const cat = dragSource.cat;
      const nextFeatured = [...featured];
      const existingIndex = nextFeatured.findIndex((c) => c._id === cat._id);
      if (existingIndex >= 0) {
        const [moved] = nextFeatured.splice(existingIndex, 1);
        nextFeatured.splice(index, 0, moved);
      } else {
        if (featured.length >= MAX_SLOTS) return;
        setPool((p) => p.filter((c) => c._id !== cat._id));
        nextFeatured.splice(index, 0, cat);
        while (nextFeatured.length > MAX_SLOTS) nextFeatured.pop();
      }
      setFeatured(nextFeatured);
      setIsDirty(true);
    }
    setDragSource(null);
  };

  const onDropPool = () => {
    if (dragSource?.type === 'slot') {
      const cat = featured[dragSource.index];
      if (cat) removeFromFeatured(cat);
    }
    setDragSource(null);
  };

  const onSave = async () => {
    setIsSaving(true);
    try {
      await setFeaturedHomepageCategories(featured.map((c) => c._id));
      window.alert('Homepage categories saved.');
      await load();
    } catch (err) {
      window.alert(err?.response?.data?.message || err?.message || 'Could not save homepage categories.');
    } finally {
      setIsSaving(false);
    }
  };

  const slots = Array.from({ length: MAX_SLOTS }, (_, i) => featured[i] || null);

  return (
    <div className="dashboard-panel">
      <h4>Homepage featured categories</h4>
      <p className="dashboard-featured-lede">
        Drag up to {MAX_SLOTS} categories into the slots below. Their order is how shoppers see them on the home
        page (and first in the catalogue).
      </p>

      <div className="dashboard-featured-slots">
        {slots.map((cat, index) => (
          <div
            key={`slot-${index}`}
            className={`dashboard-featured-slot${cat ? ' dashboard-featured-slot--filled' : ''}`}
            onDragOver={onDragOver}
            onDrop={() => onDropSlot(index)}
          >
            <span className="dashboard-featured-slot-num">{index + 1}</span>
            {cat ? (
              <div
                draggable
                onDragStart={() => onDragStartSlot(index)}
                className="dashboard-featured-slot-card"
              >
                {cat.imageUrl && (
                  <img src={cat.imageUrl} alt="" className="dashboard-featured-slot-thumb" />
                )}
                <span>{cat.name}</span>
                {cat.isOccasional && <span className="dashboard-featured-occasional">Occasional</span>}
                <button
                  type="button"
                  className="dashboard-featured-remove"
                  onClick={() => removeFromFeatured(cat)}
                  aria-label={`Remove ${cat.name}`}
                >
                  ×
                </button>
              </div>
            ) : (
              <span className="dashboard-featured-slot-empty">Drop category here</span>
            )}
          </div>
        ))}
      </div>

      <p className="dashboard-featured-pool-label">All categories</p>
      <div
        className="dashboard-featured-pool"
        onDragOver={onDragOver}
        onDrop={onDropPool}
      >
        {pool.length === 0 ? (
          <span className="text-muted">No more categories available.</span>
        ) : (
          pool.map((cat) => (
            <div
              key={cat._id}
              draggable
              onDragStart={() => onDragStartPool(cat)}
              className="dashboard-featured-pool-item"
              onDoubleClick={() => addToFeatured(cat)}
              title="Drag to a slot, or double-click to add"
            >
              {cat.imageUrl && (
                <img src={cat.imageUrl} alt="" className="dashboard-featured-pool-thumb" />
              )}
              {cat.name}
              {cat.isOccasional && <span className="dashboard-featured-occasional">Occasional</span>}
            </div>
          ))
        )}
      </div>

      <div className="mt-3 d-flex flex-wrap gap-2">
        <Button variant="primary" onClick={onSave} disabled={isSaving || !isDirty}>
          {isSaving ? 'Saving...' : 'Save homepage order'}
        </Button>
        <Button variant="outline-secondary" onClick={load} disabled={isSaving}>
          Reset
        </Button>
      </div>
    </div>
  );
}

export default FeaturedHomepageCategories;
