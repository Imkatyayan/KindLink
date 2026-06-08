import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../constants/areas';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  return <ProtectedRoute roles={[USER_ROLES.ADMIN]}>{children}</ProtectedRoute>;
}

export function UserRoute({ children }) {
  return (
    <ProtectedRoute roles={[USER_ROLES.DONOR, USER_ROLES.RECEIVER]}>{children}</ProtectedRoute>
  );
}
