import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import AddExpenses from './AddExpenses';
import AddOrders from './AddOrders';
import AddProducts from './AddProducts';
import Expenses from './Expenses';
import Orders from './Orders';
import Products from './Products';

const PAGES = { EXPENSES: 'expenses', ORDERS: 'orders', PRODUCTS: 'products' };

const sidebarStyle = {
  width: 220,
  minHeight: 'calc(100vh - 60px)',
  padding: '1rem 0',
  borderRight: '1px solid rgba(255,255,255,0.2)',
  flexShrink: 0,
};

const navLinkStyle = {
  padding: '0.75rem 1.25rem',
  color: 'rgba(255,255,255,0.85)',
  cursor: 'pointer',
  borderLeft: '3px solid transparent',
};

function Dashboard() {
  const [activePage, setActivePage] = useState(PAGES.ORDERS);
  const [productsRefreshKey, setProductsRefreshKey] = useState(0);
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: 'calc(100vh - 60px)' }}>
      <aside style={sidebarStyle}>
        <Nav variant="pills" className="flex-column">
          <Nav.Link
            active={activePage === PAGES.EXPENSES}
            onClick={() => setActivePage(PAGES.EXPENSES)}
            style={{
              ...navLinkStyle,
              ...(activePage === PAGES.EXPENSES
                ? { borderLeftColor: '#0d6efd', backgroundColor: 'rgba(13, 110, 253, 0.15)' }
                : {}),
            }}
          >
            Expenses
          </Nav.Link>
          <Nav.Link
            active={activePage === PAGES.ORDERS}
            onClick={() => setActivePage(PAGES.ORDERS)}
            style={{
              ...navLinkStyle,
              ...(activePage === PAGES.ORDERS
                ? { borderLeftColor: '#0d6efd', backgroundColor: 'rgba(13, 110, 253, 0.15)' }
                : {}),
            }}
          >
            Orders
          </Nav.Link>
          <Nav.Link
            active={activePage === PAGES.PRODUCTS}
            onClick={() => setActivePage(PAGES.PRODUCTS)}
            style={{
              ...navLinkStyle,
              ...(activePage === PAGES.PRODUCTS
                ? { borderLeftColor: '#0d6efd', backgroundColor: 'rgba(13, 110, 253, 0.15)' }
                : {}),
            }}
          >
            Products
          </Nav.Link>
        </Nav>
      </aside>
      <main style={{ flex: 1, padding: '1.5rem 2rem', overflow: 'auto' }}>
        {activePage === PAGES.EXPENSES && (
          <>
            <AddExpenses />
            <br />
            <Expenses />
          </>
        )}
        {activePage === PAGES.ORDERS && (
          <>
            <AddOrders />
            <br />
            <Orders />
          </>
        )}
        {activePage === PAGES.PRODUCTS && (
          <>
            {showAddProductForm ? (
              <>
                <AddProducts
                  onProductAdded={() => {
                    setProductsRefreshKey((k) => k + 1);
                    setShowAddProductForm(false);
                  }}
                  onCancel={() => setShowAddProductForm(false)}
                />
                <br />
              </>
            ) : (
              <Button variant="primary" onClick={() => setShowAddProductForm(true)} className="mb-3">
                Add Product
              </Button>
            )}
            <Products key={productsRefreshKey} />
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
