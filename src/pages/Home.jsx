import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookAPI } from '../services/api';
import './Home.css';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const [featuredRes, popularRes] = await Promise.all([
        bookAPI.getAll({ limit: 6, sort: 'newest' }),
        bookAPI.getPopular('rented')
      ]);
      
      setFeaturedBooks(featuredRes.data.data.books || []);
      const popData = popularRes.data.data; setPopularBooks(Array.isArray(popData) ? popData : (popData?.books || []));
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to the Library</h1>
            <p>Discover, Read, and Rent Books from Our Extensive Collection</p>
            <div className="hero-buttons">
              <Link to="/books" className="btn btn-primary btn-lg">
                Browse Books
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Our Library?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Extensive Collection</h3>
              <p>Access thousands of books across various genres and categories</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📖</div>
              <h3>Online Reading</h3>
              <p>Read books online securely from anywhere, anytime</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏠</div>
              <h3>Home Delivery</h3>
              <p>Rent physical books and get them delivered to your doorstep</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Reviews & Ratings</h3>
              <p>Read reviews and rate books to help others discover great reads</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="featured-books">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">New Arrivals</h2>
            <Link to="/books" className="view-all">View All →</Link>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="books-grid">
              {featuredBooks.map((book) => (
                <Link to={`/books/${book.id}`} key={book.id} className="book-card">
                  <div className="book-cover">
                    {book.cover_image ? (
                      <img src={book.cover_image} alt={book.title} />
                    ) : (
                      <div className="book-cover-placeholder">📖</div>
                    )}
                  </div>
                  <div className="book-info">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">{book.author?.user?.first_name} {book.author?.user?.last_name}</p>
                    <div className="book-meta">
                      <span className="book-rating">⭐ {Number(book.average_rating)?.toFixed(1) || '0.0'}</span>
                      <span className="book-copies">{Number(book.available_copies)} available</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Books */}
      <section className="popular-books">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Most Popular</h2>
            <Link to="/books?sort=popular" className="view-all">View All →</Link>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="books-grid">
              {popularBooks.slice(0, 6).map((book) => (
                <Link to={`/books/${book.id}`} key={book.id} className="book-card">
                  <div className="book-cover">
                    {book.cover_image ? (
                      <img src={book.cover_image} alt={book.title} />
                    ) : (
                      <div className="book-cover-placeholder">📖</div>
                    )}
                  </div>
                  <div className="book-info">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">{book.author?.user?.first_name} {book.author?.user?.last_name}</p>
                    <div className="book-meta">
                      <span className="book-rating">⭐ {Number(book.average_rating)?.toFixed(1) || '0.0'}</span>
                      <span className="book-copies">{book.rental_count} rentals</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Start Your Reading Journey Today</h2>
          <p>Join thousands of readers who have discovered the joy of reading with our library</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Library Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

