import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Requires login and `user.role === 'admin'`. */
function AdminRoute() {
  const { user, isHydrated } = useAuth();
  const location = useLocation();

  if (!isHydrated) {
    return null;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/catalogue" replace />;
  }
  return <Outlet />;
}

export default AdminRoute;
