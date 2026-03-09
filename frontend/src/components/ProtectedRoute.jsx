import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ allowedRoles }) {
  const { user, token } = useSelector((state) => state.auth);

  console.log('ProtectedRoute debug:', { hasToken: !!token, user, allowedRoles });

  if (!token) {
    console.log('No token → redirect to login');
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    console.log('No user object → redirect to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`Wrong role: ${user.role} (allowed: ${allowedRoles}) → redirecting`);
    return <Navigate to="/" replace />;
  }

  console.log('Allowed → rendering children');
  return <Outlet />;
}

export default ProtectedRoute;