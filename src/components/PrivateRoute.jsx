import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requireAdmin, requireAuthor }) => {
  const { isAuthenticated, isAdmin, isAuthor, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="container mt-4 text-center"><div className="spinner"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (requireAuthor && !isAuthor) return <Navigate to="/dashboard" replace />;
  return children;
};

export default PrivateRoute;
