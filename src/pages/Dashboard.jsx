import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, rentalAPI, bookAPI, wishlistAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAdmin, isAuthor } = useAuth();
  const [stats, setStats] = useState({
    booksRead: 0,
    activeRentals: 0,
    wishlistCount: 0,
    reviewCount: 0
  });
  const [recentRentals, setRecentRentals] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [rentalsRes, booksRes, wishlistRes] = await Promise.all([
        rentalAPI.getUserRentals(),
        bookAPI.getAll({ limit: 5 }),
        wishlistAPI.getAll()
      ]);

      const rentalsData = rentalsRes.data.data;
      const rentals = rentalsData?.rentals || rentalsData || [];
      const activeRentals = rentals.filter(r => ['requested', 'dispatched'].includes(r.status));
      const completedRentals = rentals.filter(r => r.status === 'completed');

      const wishlistData = wishlistRes.data.data;
      const wishlistItems = wishlistData?.wishlist || wishlistData || [];

      setStats({
        booksRead: completedRentals.length,
        activeRentals: activeRentals.length,
        wishlistCount: wishlistItems.length,
        reviewCount: 0
      });

      setRecentRentals(rentals.slice(0, 5));
      setRecentBooks(booksRes.data.data?.books || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      requested: { class: 'badge-warning', label: 'Pending' },
      dispatched: { class: 'badge-primary', label: 'Dispatched' },
      return_initiated: { class: 'badge-info', label: 'Return Initiated' },
      completed: { class: 'badge-success', label: 'Returned' },
      overdue: { class: 'badge-danger', label: 'Overdue' }
    };
    const { class: badgeClass, label } = statusMap[status] || { class: 'badge-secondary', label: status };
    return <span className={`badge ${badgeClass}`}>{label}</span>;
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.first_name || user?.email}!</h1>
          <p>Here's an overview of your library activity</p>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📖</div>
            <div className="stat-content">
              <span className="stat-number">{stats.booksRead}</span>
              <span className="stat-label">Books Read</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <span className="stat-number">{stats.activeRentals}</span>
              <span className="stat-label">Active Rentals</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-content">
              <span className="stat-number">{stats.wishlistCount}</span>
              <span className="stat-label">Wishlist Items</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <span className="stat-number">{stats.reviewCount}</span>
              <span className="stat-label">My Reviews</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/books" className="action-card">
              <span className="action-icon">🔍</span>
              <span>Browse Books</span>
            </Link>
            <Link to="/rentals" className="action-card">
              <span className="action-icon">📋</span>
              <span>My Rentals</span>
            </Link>
            <Link to="/wishlist" className="action-card">
              <span className="action-icon">💝</span>
              <span>My Wishlist</span>
            </Link>
            <Link to="/my-reviews" className="action-card">
              <span className="action-icon">✍️</span>
              <span>My Reviews</span>
            </Link>
            {isAuthor && (
              <Link to="/author" className="action-card">
                <span className="action-icon">✏️</span>
                <span>Author Portal</span>
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="action-card">
                <span className="action-icon">⚙️</span>
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-grid">
          {/* Recent Rentals */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Rentals</h3>
              <Link to="/rentals" className="view-all">View All</Link>
            </div>
            <div className="card-body">
              {recentRentals.length === 0 ? (
                <p className="empty-message">No rentals yet. <Link to="/books">Browse books</Link></p>
              ) : (
                <div className="rental-list">
                  {recentRentals.map((rental) => (
                    <div key={rental.id} className="rental-item">
                      <div className="rental-info">
                        <strong>{rental.book?.title}</strong>
                        <span className="rental-date">
                          {new Date(rental.rental_date).toLocaleDateString()}
                        </span>
                      </div>
                      {getStatusBadge(rental.status)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* New Books */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>New Arrivals</h3>
              <Link to="/books" className="view-all">View All</Link>
            </div>
            <div className="card-body">
              {recentBooks.length === 0 ? (
                <p className="empty-message">No books available yet.</p>
              ) : (
                <div className="book-list">
                  {recentBooks.map((book) => (
                    <Link to={`/books/${book.id}`} key={book.id} className="book-item">
                      <div className="book-thumb">
                        {book.cover_image ? (
                          <img src={book.cover_image} alt={book.title} />
                        ) : (
                          <span>📖</span>
                        )}
                      </div>
                      <div className="book-info">
                        <strong>{book.title}</strong>
                        <span>{Number(book.average_rating)?.toFixed(1) || '0.0'} ⭐</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

