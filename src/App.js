import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import './APIs/axiosClient';
import { AuthProvider } from './context/AuthContext';
import Layout from './Components/Layout';
import Home from './Components/Home';
import Catalogue from './Components/Catalogue';
import ProductDetail from './Components/ProductDetail';
import Cart from './Components/Cart';
import MyOrders from './Components/MyOrders';
import Dashboard from './Components/Dashboard';
import Login from './Components/Login';
import Register from './Components/Register';
import AdminRoute from './Components/AdminRoute';
import InvoicePrint from './Components/Dashboard/InvoicePrint';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <AuthProvider>
          <Router>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/catalogue" element={<Catalogue />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              <Route element={<AdminRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/invoice/:orderId" element={<InvoicePrint />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </header>
    </div>
  );
}

export default App;
