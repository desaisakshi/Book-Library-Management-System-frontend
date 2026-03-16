import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAPI, rentalAPI, wishlistAPI, reviewAPI } from '../services/api';
import './BookDetails.css';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [book,    setBook]    = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist]   = useState(false);
  const [rentalLoading,  setRentalL]  = useState(false);
  const [wishlistLoading, setWishL]   = useState(false);
  const [showReviewForm,  setShowRF]  = useState(false);
  const [reviewData, setReviewData]   = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubR]   = useState(false);
  const [message, setMessage]         = useState('');

  useEffect(() => { fetchBook(); }, [id]);
  useEffect(() => { if (isAuthenticated && book) checkWishlist(); }, [isAuthenticated, book]);

  const fetchBook = async () => {
    try {
      const res = await bookAPI.getById(id);
      setBook(res.data.data);
      const rv = await bookAPI.getReviews(id);
      // FIX: backend returns { reviews, pagination } not plain array
      const rvData = rv.data.data;
      setReviews(rvData?.reviews ?? (Array.isArray(rvData) ? rvData : []));
    } catch { navigate('/books'); }
    finally { setLoading(false); }
  };

  const checkWishlist = async () => {
    try {
      const res = await wishlistAPI.check(id);
      // FIX: backend returns { isInWishlist } (capital I)
      setInWishlist(res.data.data?.isInWishlist ?? false);
    } catch { /* ignore */ }
  };

  const handleRent = async () => {
    if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: `/books/${id}` } } }); return; }
    setRentalL(true);
    try {
      await rentalAPI.request(id);
      setMessage('✅ Rental request submitted!');
      setTimeout(() => navigate('/rentals'), 1500);
    } catch (e) { setMessage(e.response?.data?.message || 'Failed to rent book'); }
    setRentalL(false);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: `/books/${id}` } } }); return; }
    setWishL(true);
    try {
      if (inWishlist) { await wishlistAPI.remove(id); setInWishlist(false); }
      else            { await wishlistAPI.add(id);    setInWishlist(true); }
    } catch { /* ignore */ }
    setWishL(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubR(true);
    try {
      await reviewAPI.create({ book_id: id, rating: reviewData.rating, comment: reviewData.comment });
      setShowRF(false);
      setReviewData({ rating: 5, comment: '' });
      fetchBook();
    } catch (e) { alert(e.response?.data?.message || 'Failed to submit review'); }
    setSubR(false);
  };

  if (loading) return <div className="container mt-4 text-center"><div className="spinner"></div></div>;
  if (!book)   return <div className="container mt-4"><div className="alert alert-error">Book not found</div></div>;

  return (
    <div className="book-details-page">
      <div className="container">
        {message && <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{message}</div>}

        <div className="book-details">
          <div className="book-details-cover">
            {book.cover_image ? <img src={book.cover_image} alt={book.title} /> : <div className="book-cover-placeholder large">📖</div>}
          </div>

          <div className="book-details-info">
            <span className="book-genre-badge">{book.genre}</span>
            <h1>{book.title}</h1>
            <p className="book-author">by {book.author?.user?.first_name} {book.author?.user?.last_name}</p>
            <div className="book-stats">
              <div className="stat"><span className="stat-value">⭐ {parseFloat(book.average_rating || 0).toFixed(1)}</span><span className="stat-label">{book.review_count} reviews</span></div>
              <div className="stat"><span className="stat-value">{book.read_count}</span><span className="stat-label">Reads</span></div>
              <div className="stat"><span className="stat-value">{book.available_copies}</span><span className="stat-label">Available</span></div>
            </div>
            <p className="book-description">{book.description}</p>
            <div className="book-meta-info">
              {book.isbn && <p><strong>ISBN:</strong> {book.isbn}</p>}
              {book.publication_date && <p><strong>Published:</strong> {new Date(book.publication_date).toLocaleDateString()}</p>}
              <p><strong>Copies:</strong> {book.available_copies} / {book.total_copies}</p>
            </div>
            <div className="book-actions">
              <button className="btn btn-primary" onClick={handleRent} disabled={rentalLoading || book.available_copies === 0}>
                {rentalLoading ? 'Processing...' : book.available_copies === 0 ? 'Not Available' : 'Rent Book'}
              </button>
              <button className={`btn ${inWishlist ? 'btn-warning' : 'btn-outline'}`} onClick={handleWishlist} disabled={wishlistLoading}>
                {wishlistLoading ? '...' : inWishlist ? '❤️ In Wishlist' : '🤍 Wishlist'}
              </button>
            </div>
          </div>
        </div>

        <div className="reviews-section">
          <div className="reviews-header">
            <h2>Reviews</h2>
            {isAuthenticated && (
              <button className="btn btn-primary" onClick={() => setShowRF(!showReviewForm)}>
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
            )}
          </div>

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="review-form card">
              <h3>Write Your Review</h3>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`star ${s <= reviewData.rating ? 'filled' : ''}`}
                      onClick={() => setReviewData({ ...reviewData, rating: s })}>★</span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea className="form-textarea" value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="Share your thoughts..." required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first!</p>
            ) : reviews.map((r) => (
              <div key={r.id} className="review-card card">
                <div className="review-header">
                  <div className="review-user">
                    <strong>{r.user?.first_name} {r.user?.last_name}</strong>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => <span key={i} className={`star ${i < r.rating ? 'filled' : ''}`}>★</span>)}
                    </div>
                  </div>
                  <span className="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <p className="review-comment">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
