import Nav from 'react-bootstrap/Nav';
import Badge from 'react-bootstrap/Badge';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const outlet = useOutletContext();
  const { user, logout } = useAuth();
  const totalItems = outlet?.totalItems ?? 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Nav style={{ backgroundColor: 'white' }} defaultActiveKey="/home" as="ul">
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
            <Badge bg="primary" className="ms-1">
              {totalItems}
            </Badge>
          )}
        </Nav.Link>
      </Nav.Item>
      {user ? (
        <>
          <Nav.Item as="li">
            <Nav.Link onClick={() => navigate('/dashboard')}>Dashboard</Nav.Link>
          </Nav.Item>
          <Nav.Item as="li">
            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
          </Nav.Item>
        </>
      ) : (
        <Nav.Item as="li">
          <Nav.Link onClick={() => navigate('/login')}>Login</Nav.Link>
        </Nav.Item>
      )}
    </Nav>
  );
}

export default Navbar;