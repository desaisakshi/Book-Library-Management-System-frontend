import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authorAPI, bookAPI } from '../services/api';
import './Dashboard.css';

const AuthorDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [manuscripts, setManuscripts] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showManuscriptForm, setShowManuscriptForm] = useState(false);
  const [manuscriptData, setManuscriptData] = useState({ title: '', genre: '', description: '', file_url: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAuthorData();
  }, []);

  const fetchAuthorData = async () => {
    try {
      setLoading(true);
      // Get profile to get author ID
      const profileRes = await authorAPI.getProfile(user.id).catch(() => null);
      if (profileRes) {
        const authorId = profileRes.data.data.id;
        const [metricsRes, manuscriptsRes, booksRes] = await Promise.all([
          authorAPI.getMetrics(authorId).catch(() => ({ data: { data: {} } })),
          authorAPI.getManuscripts(authorId).catch(() => ({ data: { data: { manuscripts: [] } } })),
          authorAPI.getBooks(authorId).catch(() => ({ data: { data: { books: [] } } })),
        ]);
        setMetrics(metricsRes.data.data);
        setManuscripts(manuscriptsRes.data.data.manuscripts || []);
        setBooks(booksRes.data.data.books || []);
      }
    } catch (err) {
      setError('Failed to load author data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitManuscript = async (e) => {
    e.preventDefault();
    try {
      await authorAPI.submitManuscript(manuscriptData);
      setSuccess('Manuscript submitted successfully!');
      setShowManuscriptForm(false);
      setManuscriptData({ title: '', genre: '', description: '', file_url: '' });
      fetchAuthorData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit manuscript');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Author Dashboard</h1>
        <p>Welcome back, {user?.first_name}!</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="dashboard-tabs">
        {['overview', 'books', 'manuscripts'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && metrics && (
        <div className="dashboard-stats">
          <div className="stat-card"><div className="stat-number">{metrics.totalBooks ?? 0}</div><div className="stat-label">Books Published</div></div>
          <div className="stat-card"><div className="stat-number">{metrics.totalReads ?? 0}</div><div className="stat-label">Total Reads</div></div>
          <div className="stat-card"><div className="stat-number">{metrics.totalRentals ?? 0}</div><div className="stat-label">Total Rentals</div></div>
          <div className="stat-card"><div className="stat-number">{parseFloat(metrics.averageRating ?? 0).toFixed(1)} ⭐</div><div className="stat-label">Avg Rating</div></div>
        </div>
      )}

      {activeTab === 'books' && (
        <div className="section">
          <h2>My Books</h2>
          {books.length === 0 ? (
            <p className="empty-state">No books published yet.</p>
          ) : (
            <div className="books-grid">
              {books.map(book => (
                <div key={book.id} className="book-card">
                  <div className="book-info">
                    <h3>{book.title}</h3>
                    <p className="book-genre">{book.genre}</p>
                    <div className="book-stats">
                      <span>📖 {book.read_count} reads</span>
                      <span>📚 {book.rental_count} rentals</span>
                      <span>⭐ {parseFloat(book.average_rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'manuscripts' && (
        <div className="section">
          <div className="section-header">
            <h2>My Manuscripts</h2>
            <button className="btn btn-primary" onClick={() => setShowManuscriptForm(!showManuscriptForm)}>
              {showManuscriptForm ? 'Cancel' : '+ Submit Manuscript'}
            </button>
          </div>

          {showManuscriptForm && (
            <form onSubmit={handleSubmitManuscript} className="form-card">
              <h3>Submit New Manuscript</h3>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={manuscriptData.title} onChange={e => setManuscriptData({...manuscriptData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Genre</label>
                <input className="form-input" value={manuscriptData.genre} onChange={e => setManuscriptData({...manuscriptData, genre: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="4" value={manuscriptData.description} onChange={e => setManuscriptData({...manuscriptData, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">File URL (optional)</label>
                <input className="form-input" value={manuscriptData.file_url} onChange={e => setManuscriptData({...manuscriptData, file_url: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary">Submit Manuscript</button>
            </form>
          )}

          {manuscripts.length === 0 ? (
            <p className="empty-state">No manuscripts submitted yet.</p>
          ) : (
            <div className="list-cards">
              {manuscripts.map(ms => (
                <div key={ms.id} className="list-card">
                  <div className="list-card-info">
                    <h3>{ms.title}</h3>
                    <p>{ms.genre}</p>
                  </div>
                  <span className={`status-badge status-${ms.status}`}>{ms.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthorDashboard;
