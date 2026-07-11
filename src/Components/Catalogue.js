import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { getProducts } from '../APIs';
import { downloadCategoryCataloguePdf, getCategories } from '../APIs/categoryApi';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import ProductGrid from './Grid';
import CatalogueLoader from './CatalogueLoader';
import { ProductCardSkeleton, Skeleton } from './Skeleton';
import './Catalogue.css';

const CATALOGUE_PAGE_LIMIT = 12;

function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || '';

  if (!categoryFilter) {
    return <Navigate to="/categories" replace />;
  }

  return <CatalogueProducts categoryFilter={categoryFilter} setSearchParams={setSearchParams} />;
}

function CatalogueProducts({ categoryFilter, setSearchParams }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [downloadingCatalogue, setDownloadingCatalogue] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const sentinelRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const activeCategoryName = useMemo(() => {
    if (!categoryFilter) return null;
    const match = categories.find((c) => c._id === categoryFilter);
    return match?.name || null;
  }, [categories, categoryFilter]);

  const handleDownloadCatalogue = async () => {
    if (!categoryFilter || downloadingCatalogue) return;
    setDownloadingCatalogue(true);
    try {
      const safeName = (activeCategoryName || 'category')
        .replace(/[^a-zA-Z0-9-_]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'category';
      await downloadCategoryCataloguePdf(categoryFilter, `catalogue-${safeName}.pdf`);
    } catch (err) {
      window.alert(err?.response?.data?.message || err?.message || 'Could not download catalogue.');
    } finally {
      setDownloadingCatalogue(false);
    }
  };

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setProducts([]);
    setLoading(true);
    setPage(1);
    setHasMore(false);

    getProducts(categoryFilter, { page: 1, limit: CATALOGUE_PAGE_LIMIT })
      .then((res) => {
        if (cancelled) return;
        setProducts(res?.categories ?? []);
        setTotalCount(res?.totalCount || 0);
        setHasMore((res?.page || 1) < (res?.totalPages || 1));
      })
      .catch((err) => {
        if (cancelled) return;
        window.alert(err?.message || String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryFilter]);

  const loadMore = useCallback(async () => {
    if (!categoryFilter || loadingMoreRef.current || !hasMore || loading) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getProducts(categoryFilter, {
        page: nextPage,
        limit: CATALOGUE_PAGE_LIMIT,
      });
      const nextBatch = res?.categories?.[0]?.products ?? [];
      setProducts((prev) => {
        if (!prev.length) return res?.categories ?? [];
        const [first, ...rest] = prev;
        return [
          {
            ...first,
            products: [...(first.products || []), ...nextBatch],
          },
          ...rest,
        ];
      });
      setPage(nextPage);
      setHasMore(nextPage < (res?.totalPages || 1));
      setTotalCount(res?.totalCount || 0);
    } catch (err) {
      window.alert(err?.message || 'Could not load more products.');
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [categoryFilter, page, hasMore, loading]);

  useEffect(() => {
    if (!categoryFilter || !hasMore) return undefined;
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '240px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [categoryFilter, hasMore, loadMore, products.length]);

  const onCategoryFilterChange = (e) => {
    const value = e.target.value;
    if (value) {
      setSearchParams({ category: value });
    } else {
      navigate('/categories');
    }
  };

  const filterBar = (
    <div className="catalogue-filter-bar">
      <Link to="/categories" className="catalogue-back-link">
        ← All categories
      </Link>
      <Form.Group className="catalogue-filter-group mb-0">
        <Form.Label htmlFor="catalogue-category-filter" className="catalogue-filter-label">
          Category
        </Form.Label>
        <Form.Select
          id="catalogue-category-filter"
          value={categoryFilter}
          onChange={onCategoryFilterChange}
          className="catalogue-filter-select"
          disabled={loading && !categories.length}
        >
          <option value="">Browse categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      {activeCategoryName && (
        <p className="catalogue-filter-active mb-0">
          Showing: <span>{activeCategoryName}</span>
          {totalCount > 0 && (
            <span className="catalogue-filter-count"> · {totalCount} products</span>
          )}
        </p>
      )}
      {isAdmin && categoryFilter && (
        <button
          type="button"
          className="catalogue-download-btn"
          onClick={handleDownloadCatalogue}
          disabled={downloadingCatalogue}
        >
          {downloadingCatalogue ? 'Preparing PDF…' : 'Download catalogue'}
        </button>
      )}
    </div>
  );

  const showInitialSkeleton = loading && !products.length;

  if (showInitialSkeleton) {
    return (
      <div className="catalogue-page">
        <Navbar />
        <Container fluid="lg" className="catalogue-body pt-2 pt-md-3">
          <header className="catalogue-page-header">
            <h1 className="catalogue-page-title">Catalogue</h1>
            <p className="catalogue-page-lede">
              Browse by category. Tap a photo or title for details, or add straight to your cart.
            </p>
          </header>
          {filterBar}
          <section className="catalogue-category-block">
            <div className="catalogue-category-head">
              <Skeleton width="180px" height="1.4rem" />
              <Skeleton width="60px" height="1.05rem" radius="999px" />
            </div>
            <Row className="g-3 g-lg-4 catalogue-grid-row">
              {Array.from({ length: 6 }).map((_, i) => (
                <Col sm={6} lg={4} key={i}>
                  <ProductCardSkeleton />
                </Col>
              ))}
            </Row>
          </section>
        </Container>
      </div>
    );
  }

  return (
    <div className="catalogue-page">
      <Navbar />
      <Container fluid="lg" className="catalogue-body pt-2 pt-md-3">
        <header className="catalogue-page-header">
          <h1 className="catalogue-page-title">Catalogue</h1>
          <p className="catalogue-page-lede">
            Browse by category. Tap a photo or title for details, or add straight to your cart.
          </p>
        </header>
        {filterBar}
        <div className={loading ? 'catalogue-content catalogue-content--loading' : 'catalogue-content'}>
          <ProductGrid data={products} />
          {categoryFilter && hasMore && (
            <div ref={sentinelRef} className="catalogue-infinite-sentinel" aria-hidden="true" />
          )}
          {categoryFilter && loadingMore && (
            <CatalogueLoader inline label="Loading more products…" />
          )}
          {categoryFilter && !hasMore && !loading && totalCount > CATALOGUE_PAGE_LIMIT && (
            <p className="catalogue-infinite-end">All {totalCount} products loaded.</p>
          )}
        </div>
      </Container>
    </div>
  );
}

export default Catalogue;
