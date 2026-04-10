import React, { useState, useEffect } from 'react';
import { bookAPI, authorAPI } from '../services/api';
import './BookModal.css';

const BookModal = ({ isOpen, onClose, book = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    description: '',
    isbn: '',
    publication_date: '',
    cover_image: '',
    pdf_url: '',
    total_copies: 1,
    available_copies: 1,
    author_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchGenres();
      fetchAuthors();
      if (book) {
        setFormData({
          title: book.title || '',
          genre: book.genre || '',
          description: book.description || '',
          isbn: book.isbn || '',
          publication_date: book.publication_date ? book.publication_date.split('T')[0] : '',
          cover_image: book.cover_image || '',
          pdf_url: book.pdf_url || '',
          total_copies: book.total_copies || 1,
          available_copies: book.available_copies || 1,
          author_id: book.author_id || ''
        });
      } else {
        setFormData({
          title: '',
          genre: '',
          description: '',
          isbn: '',
          publication_date: '',
          cover_image: '',
          pdf_url: '',
          total_copies: 1,
          available_copies: 1,
          author_id: ''
        });
      }
      setError('');
    }
  }, [isOpen, book]);

  const fetchGenres = async () => {
    try {
      const response = await bookAPI.getGenres();
      setGenres(response.data.data || []);
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  const fetchAuthors = async () => {
    try {
      setAuthorsLoading(true);
      const response = await authorAPI.getAll({ limit: 100, approved: true });
      setAuthors(response.data.data?.authors || []);
    } catch (err) {
      console.error('Error fetching authors:', err);
      setAuthors([]);
    } finally {
      setAuthorsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_copies' || name === 'available_copies' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare data for API
      const bookData = {
        ...formData,
        total_copies: parseInt(formData.total_copies),
        available_copies: parseInt(formData.available_copies)
      };

      let response;
      if (book) {
        // Update existing book
        response = await bookAPI.update(book.id, bookData);
      } else {
        // Create new book
        response = await bookAPI.create(bookData);
      }

      if (response.data.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.data.message || 'Operation failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      console.error('Error saving book:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{book ? 'Edit Book' : 'Add New Book'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter book title"
                />
              </div>

        

              <div className="form-group">
                <label htmlFor="author_id">Author *</label>
                <select
                  id="author_id"
                  name="author_id"
                  value={formData.author_id}
                  onChange={handleChange}
                  required
                  disabled={authorsLoading}
                >
                  <option value="">Select author</option>
                  {authorsLoading ? (
                    <option value="" disabled>Loading authors...</option>
                  ) : (
                    authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.user?.first_name} {author.user?.last_name}
                        {author.user?.email ? ` (${author.user.email})` : ''}
                      </option>
                    ))
                  )}
                </select>
                {authorsLoading && <small className="loading-text">Loading authors...</small>}
              </div>

              <div className="form-group">
                <label htmlFor="isbn">ISBN</label>
                <input
                  type="text"
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  placeholder="Enter ISBN (optional)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="publication_date">Publication Date</label>
                <input
                  type="date"
                  id="publication_date"
                  name="publication_date"
                  value={formData.publication_date}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="total_copies">Total Copies *</label>
                <input
                  type="number"
                  id="total_copies"
                  name="total_copies"
                  value={formData.total_copies}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="available_copies">Available Copies *</label>
                <input
                  type="number"
                  id="available_copies"
                  name="available_copies"
                  value={formData.available_copies}
                  onChange={handleChange}
                  min="0"
                  max={formData.total_copies}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter book description"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="cover_image">Cover Image URL</label>
                <input
                  type="url"
                  id="cover_image"
                  name="cover_image"
                  value={formData.cover_image}
                  onChange={handleChange}
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="pdf_url">PDF URL</label>
                <input
                  type="url"
                  id="pdf_url"
                  name="pdf_url"
                  value={formData.pdf_url}
                  onChange={handleChange}
                  placeholder="https://example.com/book.pdf"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (book ? 'Update Book' : 'Add Book')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookModal;