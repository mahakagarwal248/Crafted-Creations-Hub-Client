import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Navbar from './Navbar';
import PasswordField from './PasswordField';
import { registerUser } from '../APIs/auth';
import './Catalogue.css';
import './AuthPages.css';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        password: form.password,
      });
      navigate('/login', { replace: true, state: { message: 'Account created. You can sign in now.' } });
    } catch (err) {
      setError(err?.response?.data?.Message || err?.response?.data?.message || err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="catalogue-page">
      <Navbar />
      <Container fluid="lg" className="catalogue-inner pt-3 pb-5">
        <div className="auth-shell">
          <h2 className="mb-3">Create account</h2>
          <p className="text-white-50 small mb-4">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <Form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                required
                autoComplete="name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                required
                autoComplete="email"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                required
                autoComplete="tel"
              />
            </Form.Group>
            <PasswordField
              id="register-password"
              label="Password"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              showPassword={showPassword}
              onToggleShow={() => setShowPassword((v) => !v)}
              required
              minLength={4}
              autoComplete="new-password"
            />
            <PasswordField
              id="register-password-confirm"
              label="Confirm password"
              value={form.confirm}
              onChange={(e) => setField('confirm', e.target.value)}
              showPassword={showPassword}
              onToggleShow={() => setShowPassword((v) => !v)}
              required
              autoComplete="new-password"
            />
            <Button className="auth-btn-submit" type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create account'}
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
}

export default Register;
