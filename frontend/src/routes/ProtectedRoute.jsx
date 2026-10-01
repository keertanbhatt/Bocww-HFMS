import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children || <Outlet />;
}

export function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}
