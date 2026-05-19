import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import logo from '../logo.jpeg';
import { getFeaturedHomepageCategories } from '../APIs/categoryApi';
import Navbar from './Navbar';
import './Catalogue.css';
import './Home.css';

function Home() {
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    getFeaturedHomepageCategories()
      .then((data) => setFeaturedCategories(Array.isArray(data) ? data : []))
      .catch(() => setFeaturedCategories([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  return (
    <div className="catalogue-page home-page" style={{ display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="home-hero">
        <div className="home-hero-inner catalogue-inner">
          <div className="home-hero-card">
            <div className="home-logo-wrap">
              <img src={logo} className="home-logo" alt="Crafted Creations Hub" />
            </div>
            <p className="home-kicker">Handmade · curated</p>
            <h1 className="home-title">
              Welcome to <span className="home-title-accent">Crafted Creations Hub</span>
            </h1>
            <p className="home-subtitle">
              Discover unique pieces, browse by category, and find something special — start with the
              catalogue.
            </p>
            <div className="home-actions">
              <Link to="/catalogue" className="home-cta-primary">
                View catalogue
              </Link>
              <Link to="/cart" className="home-cta-ghost">
                Go to cart
              </Link>
            </div>
          </div>

          {(loadingCategories || featuredCategories.length > 0) && (
            <section className="home-featured" aria-label="Featured categories">
              <h2 className="home-featured-title">Shop by category</h2>
              {loadingCategories ? (
                <div className="home-featured-loading">
                  <Spinner animation="border" size="sm" className="text-light" />
                </div>
              ) : (
                <div className="home-featured-grid">
                  {featuredCategories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/catalogue?category=${cat._id}`}
                      className="home-category-card"
                    >
                      <div className="home-category-card-media">
                        {cat.imageUrl ? (
                          <img src={cat.imageUrl} alt="" />
                        ) : (
                          <span className="home-category-card-placeholder" aria-hidden>
                            {(cat.name || '?').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="home-category-card-body">
                        <span className="home-category-card-name">{cat.name}</span>
                        {cat.isOccasional && (
                          <span className="home-category-occasional">Occasional</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
