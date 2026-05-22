import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import logo from '../logo.jpeg';
import { getFeaturedHomepageCategories } from '../APIs/categoryApi';
import { getLatestReviews } from '../APIs/reviewApi';
import Navbar from './Navbar';
import { CategoryTileSkeleton, ReviewCardSkeleton } from './Skeleton';
import './Catalogue.css';
import './Home.css';

function HomeStarRow({ value }) {
  return (
    <span className="home-review-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={value >= s ? 'home-review-star--filled' : ''}>
          ★
        </span>
      ))}
    </span>
  );
}

function Home() {
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    getFeaturedHomepageCategories()
      .then((data) => setFeaturedCategories(Array.isArray(data) ? data : []))
      .catch(() => setFeaturedCategories([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    getLatestReviews({ limit: 6, minRating: 4 })
      .then((res) => setReviews(Array.isArray(res?.data?.data) ? res.data.data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
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
                <div className="home-featured-grid">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <CategoryTileSkeleton key={i} />
                  ))}
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

          {(loadingReviews || reviews.length > 0) && (
            <section className="home-reviews" aria-label="Customer reviews">
              <div className="home-reviews-head">
                <h2 className="home-reviews-title">What customers are saying</h2>
                <p className="home-reviews-sub">Real words from people who bought handmade with us.</p>
              </div>
              {loadingReviews ? (
                <div className="home-reviews-grid">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ReviewCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="home-reviews-grid">
                  {reviews.map((r) => {
                    const productThumb =
                      (Array.isArray(r.product?.photos) && r.product.photos[0]) ||
                      r.product?.imageUrl ||
                      null;
                    const productPath = r.product?.productId
                      ? `/product/${r.product.productId}`
                      : null;
                    const avatarSrc = r.photoUrl || r.userAvatar;
                    return (
                      <article key={r._id} className="home-review-card">
                        <div className="home-review-avatar-wrap">
                          <img src={avatarSrc} alt="" className="home-review-avatar" />
                        </div>
                        <h3 className="home-review-name">{r.userName || 'Customer'}</h3>
                        <span className="home-review-date">
                          {r.createdAt ? moment(r.createdAt).format('DD MMM YYYY') : ''}
                        </span>
                        <HomeStarRow value={r.rating} />
                        {r.comment && (
                          <div className="home-review-text-wrap">
                            <p className="home-review-text">{r.comment}</p>
                          </div>
                        )}
                        {productPath && (
                          <div className="home-review-thumbs">
                            {productThumb ? (
                              <Link to={productPath} className="home-review-product">
                                <img src={productThumb} alt={r.product?.name || ''} />
                                <span>{r.product?.name}</span>
                              </Link>
                            ) : (
                              <Link to={productPath} className="home-review-product home-review-product--text">
                                {r.product?.name}
                              </Link>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
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
