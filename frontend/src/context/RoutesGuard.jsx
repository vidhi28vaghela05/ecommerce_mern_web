import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { DataContext } from '../context/UserContext';

// Protect routes - redirect to login if not authenticated
export const ProtectedRoute = () => {
  const { centerData, loading } = useContext(DataContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!centerData) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Public route - redirect to home if already logged in
export const PublicRoute = ({ children }) => {
  const { centerData, loading } = useContext(DataContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (centerData) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Admin route - redirect to home if not admin
export const AdminRoute = ({ children }) => {
  const { centerData, loading } = useContext(DataContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!centerData || centerData.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};
