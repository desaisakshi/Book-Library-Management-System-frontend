import React, { useState, useEffect } from 'react';
import { bookAPI } from '../services/api';
import BookModal from '../components/BookModal';
import './AdminBooks.css';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchBooks();
    fetchGenres();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookAPI.getAll({});
      console.log("response",response)
      if (response.data.success) {
        setBooks(response.data.data.books || []);
      } else {
        setError('Failed to load books');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading books');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await bookAPI.getGenres();
      setGenres(response.data.data || []);
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  const handleAddBook = () => {
    setCurrentBook(null);
    setShowModal(true);
  };

  const handleEditBook = (book) => {
    setCurrentBook(book);
    setShowModal(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    
    try {
      const response = await bookAPI.delete(bookId);
      if (response.data.success) {
        setBooks(books.filter(book => book.id !== bookId));
      } else {
        alert('Failed to delete book: ' + response.data.message);
      }
    } catch (err) {
      alert('Error deleting book: ' + (err.response?.data?.message || err.message));
      console.error('Error deleting book:', err);
    }
  };

  const handleModalSuccess = () => {
    fetchBooks(); // Refresh the list
  };

  const filteredBooks = books?.filter(book => {
    const matchesSearch = searchTerm === '' || 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book.isbn && book.isbn.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGenre = selectedGenre === '' || book.genre === selectedGenre;
    
    return matchesSearch && matchesGenre;
  });

  const getStatusBadge = (book) => {
    if (book.available_copies === 0) {
      return <span className="badge badge-error">Out of Stock</span>;
    } else if (book.available_copies < book.total_copies / 2) {
      return <span className="badge badge-warning">Low Stock</span>;
    } else {
      return <span className="badge badge-success">Available</span>;
    }
  };

  return (
    <div className="admin-books-page">
      <div className="container">
        <div className="page-header">
          <h1>Book Management</h1>
          <p>Manage all books in the library</p>
        </div>

        {/* Controls */}
        <div className="controls-section">
          <div className="search-filter">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search books by title, genre, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="filter-group">
              <select 
                value={selectedGenre} 
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
            
            <button className="btn btn-primary" onClick={handleAddBook}>
              <span className="btn-icon">➕</span> Add New Book
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <span className="stat-number">{books.length}</span>
              <span className="stat-label">Total Books</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📖</div>
            <div className="stat-info">
              <span className="stat-number">
                {books.reduce((sum, book) => sum + book.total_copies, 0)}
              </span>
              <span className="stat-label">Total Copies</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-number">
                {books.reduce((sum, book) => sum + book.available_copies, 0)}
              </span>
              <span className="stat-label">Available Copies</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <span className="stat-number">
                {books.filter(b => b.average_rating >= 4).length}
              </span>
              <span className="stat-label">Highly Rated</span>
            </div>
          </div>
        </div>

        {/* Books Table */}
        <div className="books-table-section">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading books...</p>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <p>{error}</p>
              <button onClick={fetchBooks} className="btn btn-secondary">Retry</button>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No books found</h3>
              <p>{searchTerm || selectedGenre ? 'Try changing your search criteria' : 'Add your first book to get started'}</p>
              <button onClick={handleAddBook} className="btn btn-primary">
                Add New Book
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="books-table">
                <thead>
                  <tr>
                    <th>Cover</th>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>ISBN</th>
                    <th>Copies</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book.id}>
                      <td>
                        <div className="book-cover">
                          {book.cover_image ? (
                            <img src={book.cover_image} alt={book.title} />
                          ) : (
                            <div className="cover-placeholder">📖</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="book-title">
                          <strong>{book.title}</strong>
                          <small>{book.author?.name || 'Unknown Author'}</small>
                        </div>
                      </td>
                      <td>
                        <span className="genre-badge">{book.genre}</span>
                      </td>
                      <td>
                        <code>{book.isbn || 'N/A'}</code>
                      </td>
                      <td>
                        <div className="copies-info">
                          <span className="available">{book.available_copies}</span>
                          <span className="separator">/</span>
                          <span className="total">{book.total_copies}</span>
                        </div>
                      </td>
                      <td>
                        <div className="rating-display">
                          <span className="stars">{"⭐".repeat(Math.floor(book.average_rating || 0))}</span>
                          <span className="rating-value">{ Number(book.average_rating)?.toFixed(1) || '0.0'}</span>
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(book)}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-action btn-edit"
                            onClick={() => handleEditBook(book)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteBook(book.id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                          <button 
                            className="btn-action btn-view"
                            onClick={() => window.open(`/books/${book.id}`, '_blank')}
                            title="View Details"
                          >
                            👁️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Book Modal */}
      <BookModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        book={currentBook}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default AdminBooks;