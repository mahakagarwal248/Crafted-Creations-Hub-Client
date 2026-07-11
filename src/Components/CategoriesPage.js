import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import { getCategories } from '../APIs/categoryApi';
import { useDelayedBusy } from '../hooks/useDelayedBusy';
import Navbar from './Navbar';
import CatalogueLoader from './CatalogueLoader';
import { CategoryTileSkeleton } from './Skeleton';
import './Catalogue.css';
import './Home.css';
import './CategoriesPage.css';

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const showBusyOverlay = useDelayedBusy(loading);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="catalogue-page categories-page">
      <Navbar />
      <Container fluid="lg" className="catalogue-body pt-2 pt-md-3">
        <header className="categories-page-header">
          <Link to="/" className="categories-page-back">
            ← Back to home
          </Link>
          <h1 className="catalogue-page-title">All categories</h1>
          <p className="catalogue-page-lede">
            Choose a category to browse its products.
          </p>
        </header>

        <div className="categories-page-content">
          {showBusyOverlay && <CatalogueLoader label="Loading categories…" />}
          {loading ? (
          <div className="categories-page-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <CategoryTileSkeleton key={i} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="catalogue-empty">No categories yet. Check back soon.</p>
        ) : (
          <div className="categories-page-grid">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/catalogue?category=${cat._id}`}
                className="home-category-card categories-page-card"
              >
                <div className="home-category-card-media">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="home-category-card-placeholder" aria-hidden>
                      {(cat.name || '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="home-category-card-body">
                  <span className="home-category-card-name">{cat.name}</span>
                  {cat.description ? (
                    <span className="categories-page-card-desc">{cat.description}</span>
                  ) : null}
                  {cat.isOccasional && (
                    <span className="home-category-occasional">Occasional</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        </div>
      </Container>
    </div>
  );
}

export default CategoriesPage;
