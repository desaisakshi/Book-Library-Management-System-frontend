import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookAPI } from '../services/api';
import './Books.css';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    sort: 'newest',
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1
  });

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [filters]);

  const fetchGenres = async () => {
    try {
      const response = await bookAPI.getGenres();
      setGenres(response.data.data || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      // Map UI sort labels to backend sortBy/sortOrder params
      const sortMap = {
        newest:    { sortBy: 'created_at', sortOrder: 'desc' },
        oldest:    { sortBy: 'created_at', sortOrder: 'asc' },
        rating:    { sortBy: 'average_rating', sortOrder: 'desc' },
        popular:   { sortBy: 'rental_count', sortOrder: 'desc' },
        available: { sortBy: 'available_copies', sortOrder: 'desc' },
      };
      const { sortBy, sortOrder } = sortMap[filters.sort] || sortMap.newest;
      const response = await bookAPI.getAll({
        search: filters.search,
        genre: filters.genre,
        sortBy,
        sortOrder,
        page: filters.page,
        limit: pagination.limit
      });
      setBooks(response.data.data.books || []);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  return (
    <div className="books-page">
      <div className="container">
        <div className="page-header">
          <h1>Browse Books</h1>
          <p>Discover your next favorite book</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search books by title or author..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="filter-group">
            <select
              className="form-select"
              value={filters.genre}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>

            <select
              className="form-select"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
              <option value="available">Most Available</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info">
          <p>Showing {books.length} of {pagination.total} books</p>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="no-results">
            <p>No books found. Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="books-grid">
            {books.map((book) => (
              <Link to={`/books/${book.id}`} key={book.id} className="book-card">
                <div className="book-cover">
                  {book.cover_image ? (
                    <img src={book.cover_image} alt={book.title} />
                  ) : (
                    <div className="book-cover-placeholder">📖</div>
                  )}
                  {book.available_copies > 0 && (
                    <span className="badge badge-success available-badge">Available</span>
                  )}
                </div>
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">
                    {book.author?.user?.first_name} {book.author?.user?.last_name}
                  </p>
                  <span className="book-genre">{book.genre}</span>
                  <div className="book-meta">
                    <span className="book-rating">⭐ {book.average_rating?.toFixed(1) || '0.0'}</span>
                    <span className="book-copies">{book.available_copies} available</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handleFilterChange('page', pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            {[...Array(pagination.totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                className={`pagination-btn ${pagination.page === idx + 1 ? 'active' : ''}`}
                onClick={() => handleFilterChange('page', idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
            <button
              className="pagination-btn"
              onClick={() => handleFilterChange('page', pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;

