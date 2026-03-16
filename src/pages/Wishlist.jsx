import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI } from '../services/api';
import './Wishlist.css';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistAPI.getAll();
      const responseData = response.data.data;
      setWishlist(responseData?.wishlist || responseData || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookId) => {
    if (!window.confirm('Remove this book from your wishlist?')) return;
    
    try {
      await wishlistAPI.remove(bookId);
      setWishlist(wishlist.filter(item => item.book_id !== bookId));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove from wishlist');
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
    <div className="wishlist-page">
      <div className="container">
        <div className="page-header">
          <h1>My Wishlist</h1>
          <p>Books you've saved for later</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-state">
            <p>Your wishlist is empty</p>
            <Link to="/books" className="btn btn-primary">Browse Books</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((item) => (
              <div key={item.id} className="wishlist-card">
                <Link to={`/books/${item.book?.id}`} className="book-cover">
                  {item.book?.cover_image ? (
                    <img src={item.book.cover_image} alt={item.book.title} />
                  ) : (
                    <span>📖</span>
                  )}
                </Link>
                <div className="book-info">
                  <Link to={`/books/${item.book?.id}`} className="book-title">
                    {item.book?.title}
                  </Link>
                  <p className="book-author">
                    by {item.book?.author?.user?.first_name} {item.book?.author?.user?.last_name}
                  </p>
                  <div className="book-meta">
                    <span>⭐ {item.book?.average_rating?.toFixed(1) || '0.0'}</span>
                    <span>{item.book?.available_copies} available</span>
                  </div>
                </div>
                <div className="card-actions">
                  <Link to={`/books/${item.book?.id}`} className="btn btn-primary btn-sm">
                    View
                  </Link>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemove(item.book?.id)}
                  >
                    Remove
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

export default Wishlist;

