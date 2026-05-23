import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { getProducts } from '../APIs';
import { downloadCategoryCataloguePdf, getCategories } from '../APIs/categoryApi';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import ProductGrid from './Grid';
import { ProductCardSkeleton, Skeleton } from './Skeleton';
import './Catalogue.css';

function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || '';
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingCatalogue, setDownloadingCatalogue] = useState(false);
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
    setLoading(true);
    getProducts(categoryFilter || undefined)
      .then((res) => {
        setProducts(res?.categories ?? []);
      })
      .catch((err) => {
        console.log(err);
        window.alert(err?.message || String(err));
      })
      .finally(() => setLoading(false));
  }, [categoryFilter]);

  const onCategoryFilterChange = (e) => {
    const value = e.target.value;
    if (value) {
      setSearchParams({ category: value });
    } else {
      setSearchParams({});
    }
  };

  const filterBar = (
    <div className="catalogue-filter-bar">
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
          <option value="">All categories</option>
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

  if (loading && !products.length) {
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
        <ProductGrid data={products} />
      </Container>
    </div>
  );
}

export default Catalogue;
