import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Dashboard from './pages/Dashboard';
import MyRentals from './pages/MyRentals';
import Wishlist from './pages/Wishlist';
import MyReviews from './pages/MyReviews';
import AdminDashboard from './pages/AdminDashboard';
import AuthorDashboard from './pages/AuthorDashboard';

function AppRoutes() {
  const { isAuthenticated, isAdmin, isAuthor } = useAuth();
  return (
    <Routes>
      <Route path="/"            element={<Home />} />
      <Route path="/login"       element={!isAuthenticated ? <Login />    : <Navigate to="/dashboard" />} />
      <Route path="/register"    element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/books"       element={<Books />} />
      <Route path="/books/:id"   element={<BookDetails />} />
      <Route path="/dashboard"   element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/rentals"     element={<PrivateRoute><MyRentals /></PrivateRoute>} />
      <Route path="/wishlist"    element={<PrivateRoute><Wishlist /></PrivateRoute>} />
      <Route path="/my-reviews"  element={<PrivateRoute><MyReviews /></PrivateRoute>} />
      <Route path="/admin/*"     element={<PrivateRoute requireAdmin><AdminDashboard /></PrivateRoute>} />
      <Route path="/author/*"    element={<PrivateRoute requireAuthor><AuthorDashboard /></PrivateRoute>} />
      <Route path="*"            element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <AppRoutes />
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}
