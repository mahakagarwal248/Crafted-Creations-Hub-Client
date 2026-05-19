import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from '../Navbar';
import '../Catalogue.css';
import './Dashboard.css';
import AddExpenses from './AddExpenses';
import AddOrders from './AddOrders';
import ProductForm from './ProductForm';
import Expenses from './Expenses';
import Orders from './Orders';
import Products from './Products';
import CategoriesPanel from './CategoriesPanel';

const PAGES = { EXPENSES: 'expenses', ORDERS: 'orders', PRODUCTS: 'products', CATEGORIES: 'categories' };

function Dashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(PAGES.ORDERS);
  const [productsRefreshKey, setProductsRefreshKey] = useState(0);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  return (
    <div
      className="catalogue-page dashboard-page"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <Navbar />
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <Nav className="flex-column">
            <Nav.Link className="dashboard-nav-link" onClick={() => navigate('/')}>
              Home
            </Nav.Link>
            <Nav.Link
              className={`dashboard-nav-link${activePage === PAGES.EXPENSES ? ' dashboard-nav-link--active' : ''}`}
              onClick={() => setActivePage(PAGES.EXPENSES)}
            >
              Expenses
            </Nav.Link>
            <Nav.Link
              className={`dashboard-nav-link${activePage === PAGES.ORDERS ? ' dashboard-nav-link--active' : ''}`}
              onClick={() => setActivePage(PAGES.ORDERS)}
            >
              Orders
            </Nav.Link>
            <Nav.Link
              className={`dashboard-nav-link${activePage === PAGES.PRODUCTS ? ' dashboard-nav-link--active' : ''}`}
              onClick={() => setActivePage(PAGES.PRODUCTS)}
            >
              Products
            </Nav.Link>
            <Nav.Link
              className={`dashboard-nav-link${activePage === PAGES.CATEGORIES ? ' dashboard-nav-link--active' : ''}`}
              onClick={() => setActivePage(PAGES.CATEGORIES)}
            >
              Categories
            </Nav.Link>
          </Nav>
        </aside>
        <main className="dashboard-main catalogue-inner">
          {activePage === PAGES.EXPENSES && (
            <div className="dashboard-stack">
              <AddExpenses />
              <Expenses />
            </div>
          )}
          {activePage === PAGES.ORDERS && (
            <div className="dashboard-stack">
              <AddOrders />
              <Orders />
            </div>
          )}
          {activePage === PAGES.PRODUCTS && (
            <div className="dashboard-stack">
              {showProductForm || editingProduct ? (
                <ProductForm
                  editing={editingProduct}
                  onSaved={() => {
                    setProductsRefreshKey((k) => k + 1);
                    setShowProductForm(false);
                    setEditingProduct(null);
                  }}
                  onCancel={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                  }}
                />
              ) : (
                <Button variant="primary" onClick={() => setShowProductForm(true)}>
                  Add Product
                </Button>
              )}
              <Products
                key={productsRefreshKey}
                onEdit={(product) => {
                  setEditingProduct(product);
                  setShowProductForm(false);
                }}
              />
            </div>
          )}
          {activePage === PAGES.CATEGORIES && <CategoriesPanel />}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
