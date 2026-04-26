import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from '../Navbar';
import '../Catalogue.css';
import './Dashboard.css';
import AddExpenses from './AddExpenses';
import AddOrders from './AddOrders';
import AddProducts from './AddProducts';
import Expenses from './Expenses';
import Orders from './Orders';
import Products from './Products';

const PAGES = { EXPENSES: 'expenses', ORDERS: 'orders', PRODUCTS: 'products' };

function Dashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(PAGES.ORDERS);
  const [productsRefreshKey, setProductsRefreshKey] = useState(0);
  const [showAddProductForm, setShowAddProductForm] = useState(false);

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
              {showAddProductForm ? (
                <AddProducts
                  onProductAdded={() => {
                    setProductsRefreshKey((k) => k + 1);
                    setShowAddProductForm(false);
                  }}
                  onCancel={() => setShowAddProductForm(false)}
                />
              ) : (
                <Button variant="primary" onClick={() => setShowAddProductForm(true)}>
                  Add Product
                </Button>
              )}
              <Products key={productsRefreshKey} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
