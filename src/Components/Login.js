import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Navbar from './Navbar';
import PasswordField from './PasswordField';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../APIs/auth';
import './Catalogue.css';
import './AuthPages.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/catalogue';

  useEffect(() => {
    if (location.state?.message) {
      setInfo(location.state.message);
    }
  }, [location.state?.message]);

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      login(user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="catalogue-page">
      <Navbar />
      <Container fluid="lg" className="catalogue-inner pt-3 pb-5">
        <div className="auth-shell">
          <h2 className="mb-2">Sign in</h2>
          <p className="text-white-50 small mb-4">
            New here? <Link to="/register">Create an account</Link>
          </p>
          <Form onSubmit={handleSubmit}>
            {info && (
              <div className="alert alert-success" role="alert">
                {info}
              </div>
            )}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
                autoComplete="email"
              />
            </Form.Group>
            <PasswordField
              id="login-password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPassword={showPassword}
              onToggleShow={() => setShowPassword((v) => !v)}
              placeholder="Password"
              required
              autoComplete="current-password"
            />
            <Button className="auth-btn-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
}

export default Login;
