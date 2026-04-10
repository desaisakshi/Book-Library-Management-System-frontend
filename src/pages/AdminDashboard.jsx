import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import AdminBooks from './AdminBooks';
import AdminAuthors from './AdminAuthors';
import './AdminDashboard.css';

// Placeholder components for other admin sections
const AdminRentals = () => <div className="admin-section"><h2>Rental Management</h2><p>Manage book rentals here.</p></div>;
const AdminReviews = () => <div className="admin-section"><h2>Review Management</h2><p>Moderate reviews here.</p></div>;

const AdminDashboard = () => {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await analyticsAPI.getOverview();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your library operations</p>
        </div>

        {/* Admin Navigation */}
        <div className="admin-nav">
          <Link to="/admin" className={`admin-nav-link ${location.pathname === '/admin' || location.pathname === '/admin/' ? 'active' : ''}`}>
            📊 Overview
          </Link>
          <Link to="/admin/rentals" className={`admin-nav-link ${location.pathname.includes('/rentals') ? 'active' : ''}`}>
            📚 Rentals
          </Link>
          <Link to="/admin/authors" className={`admin-nav-link ${location.pathname.includes('/authors') ? 'active' : ''}`}>
            ✍️ Authors
          </Link>
          <Link to="/admin/reviews" className={`admin-nav-link ${location.pathname.includes('/reviews') ? 'active' : ''}`}>
            ⭐ Reviews
          </Link>
          <Link to="/admin/books" className={`admin-nav-link ${location.pathname.includes('/books') ? 'active' : ''}`}>
            📖 Books
          </Link>
        </div>

        <Routes>
          <Route path="/" element={
            loading ? (
              <div className="text-center mt-4">
                <div className="spinner"></div>
              </div>
            ) : stats ? (
              <div className="admin-content">
                {/* Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                      <span className="stat-number">{stats.totalUsers || 0}</span>
                      <span className="stat-label">Total Users</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">✍️</div>
                    <div className="stat-info">
                      <span className="stat-number">{stats.totalAuthors || 0}</span>
                      <span className="stat-label">Total Authors</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-info">
                      <span className="stat-number">{stats.totalBooks || 0}</span>
                      <span className="stat-label">Total Books</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-info">
                      <span className="stat-number">{stats.activeRentals || 0}</span>
                      <span className="stat-label">Active Rentals</span>
                    </div>
                  </div>
                  <div className="stat-card stat-warning">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-info">
                      <span className="stat-number">{stats.overdueRentals || 0}</span>
                      <span className="stat-label">Overdue Rentals</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-section">
                  <h2>Quick Actions</h2>
                  <div className="quick-actions-grid">
                    <Link to="/admin/rentals" className="action-card">
                      <span className="action-icon">📋</span>
                      <span>Manage Rentals</span>
                    </Link>
                    <Link to="/admin/authors" className="action-card">
                      <span className="action-icon">✅</span>
                      <span>Approve Authors</span>
                    </Link>
                    <Link to="/admin/reviews" className="action-card">
                      <span className="action-icon">⭐</span>
                      <span>Moderate Reviews</span>
                    </Link>
                    <Link to="/admin/books" className="action-card">
                      <span className="action-icon">➕</span>
                      <span>Add New Book</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-error">Failed to load dashboard data</div>
            )
          } />
          <Route path="/rentals" element={<AdminRentals />} />
          <Route path="/authors" element={<AdminAuthors />} />
          <Route path="/reviews" element={<AdminReviews />} />
          <Route path="/books" element={<AdminBooks />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;

