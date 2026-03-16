import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewAPI } from '../services/api';
import './MyReviews.css';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getMyReviews();
      const responseData = response.data.data;
      setReviews(responseData?.reviews || responseData || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await reviewAPI.delete(reviewId);
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <div className="container">
        <div className="page-header">
          <h1>My Reviews</h1>
          <p>Reviews you've written</p>
        </div>

        {reviews.length === 0 ? (
          <div className="empty-state">
            <p>You haven't written any reviews yet</p>
            <Link to="/books" className="btn btn-primary">Browse Books</Link>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-book">
                  <div className="book-cover">
                    {review.book?.cover_image ? (
                      <img src={review.book.cover_image} alt={review.book.title} />
                    ) : (
                      <span>📖</span>
                    )}
                  </div>
                  <div className="book-details">
                    <Link to={`/books/${review.book?.id}`} className="book-title">
                      {review.book?.title}
                    </Link>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="review-content">
                  <p>{review.comment}</p>
                  <span className="review-date">
                    Posted on {new Date(review.created_at).toLocaleDateString()}
                  </span>
                  {!review.is_approved && (
                    <span className="badge badge-warning">Pending Approval</span>
                  )}
                </div>

                <div className="review-actions">
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(review.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;

