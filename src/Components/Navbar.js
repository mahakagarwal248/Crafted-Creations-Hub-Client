import Nav from 'react-bootstrap/Nav';
import Badge from 'react-bootstrap/Badge';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar({ variant = 'dark' }) {
  const navigate = useNavigate();
  const outlet = useOutletContext();
  const { user, logout, isAdmin } = useAuth();
  const totalItems = outlet?.totalItems ?? 0;
  const isDark = variant === 'dark';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Nav
      className={`navbar-app ${isDark ? 'navbar-app--dark' : 'navbar-app--light'}`}
      defaultActiveKey="/home"
      as="ul"
    >
      <Nav.Item as="li">
        <Nav.Link onClick={() => navigate('/')}>Home</Nav.Link>
      </Nav.Item>
      <Nav.Item as="li">
        <Nav.Link onClick={() => navigate('/catalogue')}>Catalogue</Nav.Link>
      </Nav.Item>
      <Nav.Item as="li">
        <Nav.Link onClick={() => navigate('/cart')}>
          Cart
          {totalItems > 0 && (
            <Badge bg={isDark ? 'warning' : 'primary'} text={isDark ? 'dark' : undefined} className="ms-1">
              {totalItems}
            </Badge>
          )}
        </Nav.Link>
      </Nav.Item>
      {user ? (
        <>
          <Nav.Item as="li">
            <Nav.Link onClick={() => navigate('/my-orders')}>My orders</Nav.Link>
          </Nav.Item>
          {isAdmin ? (
            <Nav.Item as="li">
              <Nav.Link onClick={() => navigate('/dashboard')}>Dashboard</Nav.Link>
            </Nav.Item>
          ) : null}
          <Nav.Item as="li">
            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
          </Nav.Item>
        </>
      ) : (
        <>
          <Nav.Item as="li">
            <Nav.Link onClick={() => navigate('/register')}>Register</Nav.Link>
          </Nav.Item>
          <Nav.Item as="li">
            <Nav.Link onClick={() => navigate('/login')}>Login</Nav.Link>
          </Nav.Item>
        </>
      )}
    </Nav>
  );
}

export default Navbar;