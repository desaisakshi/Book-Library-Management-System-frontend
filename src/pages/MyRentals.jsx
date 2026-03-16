import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rentalAPI } from '../services/api';
import './MyRentals.css';

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRentals();
  }, [filter]);

  const fetchRentals = async () => {
    try {
      const response = await rentalAPI.getUserRentals();
      const responseData = response.data.data;
      let allRentals = responseData?.rentals || responseData || [];
      
      if (filter === 'active') {
        allRentals = allRentals.filter(r => ['requested', 'dispatched'].includes(r.status));
      } else if (filter === 'completed') {
        allRentals = allRentals.filter(r => r.status === 'completed');
      }
      
      setRentals(allRentals);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (rentalId) => {
    if (!window.confirm('Are you sure you want to initiate a return?')) return;
    
    try {
      await rentalAPI.initiateReturn(rentalId);
      alert('Return initiated successfully!');
      fetchRentals();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to initiate return');
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
    <div className="rentals-page">
      <div className="container">
        <div className="page-header">
          <h1>My Rentals</h1>
          <p>Manage your book rentals</p>
        </div>

        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Rentals
          </button>
          <button 
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        {rentals.length === 0 ? (
          <div className="empty-state">
            <p>No rentals found</p>
            <Link to="/books" className="btn btn-primary">Browse Books</Link>
          </div>
        ) : (
          <div className="rentals-list">
            {rentals.map((rental) => (
              <div key={rental.id} className="rental-card">
                <div className="rental-book">
                  <div className="book-cover">
                    {rental.book?.cover_image ? (
                      <img src={rental.book.cover_image} alt={rental.book.title} />
                    ) : (
                      <span>📖</span>
                    )}
                  </div>
                  <div className="book-details">
                    <Link to={`/books/${rental.book?.id}`} className="book-title">
                      {rental.book?.title}
                    </Link>
                    <p className="book-author">
                      by {rental.book?.author?.user?.first_name} {rental.book?.author?.user?.last_name}
                    </p>
                  </div>
                </div>
                
                <div className="rental-info">
                  <div className="info-item">
                    <span className="label">Status</span>
                    <span className="value">{getStatusBadge(rental.status)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Rented On</span>
                    <span className="value">{new Date(rental.rental_date).toLocaleDateString()}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Due Date</span>
                    <span className="value">{new Date(rental.due_date).toLocaleDateString()}</span>
                  </div>
                  {rental.return_date && (
                    <div className="info-item">
                      <span className="label">Returned On</span>
                      <span className="value">{new Date(rental.return_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="rental-actions">
                  {['requested', 'dispatched'].includes(rental.status) && (
                    <button 
                      className="btn btn-warning"
                      onClick={() => handleReturn(rental.id)}
                    >
                      Return Book
                    </button>
                  )}
                  <Link to={`/books/${rental.book?.id}`} className="btn btn-outline">
                    View Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRentals;

