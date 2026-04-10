import React, { useState, useEffect } from 'react';
import { authorAPI, userAPI } from '../services/api';
import './AdminAuthors.css';

const AdminAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentAuthor, setCurrentAuthor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApproved, setFilterApproved] = useState('all');
  const [formData, setFormData] = useState({
    user_id: '',
    biography: '',
    qualifications: '',
    experience: '',
    photo: '',
    is_approved: true,
  });

  useEffect(() => {
    fetchAuthors();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers({ limit: 100 });
      if (response.data.success) {
        setUsers(response.data.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const response = await authorAPI.getAll({});
      if (response.data.success) {
        setAuthors(response.data.data.authors || []);
      } else {
        setError('Failed to load authors');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading authors');
      console.error('Error fetching authors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAuthor = () => {
    setCurrentAuthor(null);
    setFormData({
      user_id: '',
      biography: '',
      qualifications: '',
      experience: '',
      photo: '',
      is_approved: true,
    });
    setShowModal(true);
  };

  const handleEditAuthor = (author) => {
    setCurrentAuthor(author);
    setFormData({
      user_id: author.user_id,
      biography: author.biography || '',
      qualifications: author.qualifications || '',
      experience: author.experience || '',
      photo: author.photo || '',
      is_approved: author.is_approved,
    });
    setShowModal(true);
  };

  const handleDeleteAuthor = async (authorId) => {
    if (!window.confirm('Are you sure you want to delete this author? This action cannot be undone.')) return;
    
    try {
      const response = await authorAPI.delete(authorId);
      if (response.data.success) {
        setAuthors(authors.filter(author => author.id !== authorId));
      } else {
        alert('Failed to delete author: ' + response.data.message);
      }
    } catch (err) {
      alert('Error deleting author: ' + (err.response?.data?.message || err.message));
      console.error('Error deleting author:', err);
    }
  };

  const handleApproveToggle = async (authorId, approved) => {
    try {
      const response = await authorAPI.approve(authorId, { approved });
      if (response.data.success) {
        // Update local state
        setAuthors(authors.map(author => 
          author.id === authorId ? { ...author, is_approved: approved } : author
        ));
      } else {
        alert('Failed to update approval: ' + response.data.message);
      }
    } catch (err) {
      alert('Error updating approval: ' + (err.response?.data?.message || err.message));
      console.error('Error updating approval:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (currentAuthor) {
        response = await authorAPI.update(currentAuthor.id, formData);
      } else {
        response = await authorAPI.create(formData);
      }
      if (response.data.success) {
        setShowModal(false);
        fetchAuthors(); // Refresh list
      } else {
        alert('Failed to save author: ' + response.data.message);
      }
    } catch (err) {
      alert('Error saving author: ' + (err.response?.data?.message || err.message));
      console.error('Error saving author:', err);
    }
  };

  const filteredAuthors = authors.filter(author => {
    const matchesSearch = searchTerm === '' || 
      (author.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (author.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (author.biography?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterApproved === 'approved') return matchesSearch && author.is_approved;
    if (filterApproved === 'pending') return matchesSearch && !author.is_approved;
    return matchesSearch;
  });

  const getApprovalBadge = (author) => {
    if (author.is_approved) {
      return <span className="badge badge-success">Approved</span>;
    } else {
      return <span className="badge badge-warning">Pending</span>;
    }
  };

  return (
    <div className="admin-authors-page">
      <div className="container">
        <div className="page-header">
          <h1>Author Management</h1>
          <p>Manage all authors in the library</p>
        </div>

        {/* Controls */}
        <div className="controls-section">
          <div className="search-filter">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search authors by name or biography..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="filter-group">
              <select 
                value={filterApproved} 
                onChange={(e) => setFilterApproved(e.target.value)}
              >
                <option value="all">All Authors</option>
                <option value="approved">Approved Only</option>
                <option value="pending">Pending Only</option>
              </select>
            </div>
            
            <button className="btn btn-primary" onClick={handleAddAuthor}>
              <span className="btn-icon">➕</span> Add New Author
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">✍️</div>
            <div className="stat-info">
              <span className="stat-number">{authors.length}</span>
              <span className="stat-label">Total Authors</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-number">
                {authors.filter(a => a.is_approved).length}
              </span>
              <span className="stat-label">Approved</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <span className="stat-number">
                {authors.filter(a => !a.is_approved).length}
              </span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <span className="stat-number">
                {authors.reduce((sum, author) => sum + (author.books?.length || 0), 0)}
              </span>
              <span className="stat-label">Total Books</span>
            </div>
          </div>
        </div>

        {/* Authors Table */}
        <div className="authors-table-section">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading authors...</p>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <p>{error}</p>
              <button onClick={fetchAuthors} className="btn btn-secondary">Retry</button>
            </div>
          ) : filteredAuthors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✍️</div>
              <h3>No authors found</h3>
              <p>{searchTerm || filterApproved !== 'all' ? 'Try changing your search criteria' : 'Add your first author to get started'}</p>
              <button onClick={handleAddAuthor} className="btn btn-primary">
                Add New Author
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="authors-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Biography</th>
                    <th>Approval</th>
                    <th>Books</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuthors.map((author) => (
                    <tr key={author.id}>
                      <td>
                        <div className="author-photo">
                          {author.photo ? (
                            <img src={author.photo} alt={author.user?.first_name} />
                          ) : (
                            <div className="photo-placeholder">👤</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="author-name">
                          <strong>{author.user?.first_name} {author.user?.last_name}</strong>
                          <small>Joined {new Date(author.created_at).toLocaleDateString()}</small>
                        </div>
                      </td>
                      <td>
                        <div className="author-email">
                          {author.user?.email || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="author-bio">
                          {author.biography ? (
                            <p className="truncate">{author.biography.substring(0, 80)}...</p>
                          ) : (
                            <span className="text-muted">No biography</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {getApprovalBadge(author)}
                        <div className="approval-actions">
                          {author.is_approved ? (
                            <button 
                              className="btn-action btn-warning"
                              onClick={() => handleApproveToggle(author.id, false)}
                              title="Revoke Approval"
                            >
                              Revoke
                            </button>
                          ) : (
                            <button 
                              className="btn-action btn-success"
                              onClick={() => handleApproveToggle(author.id, true)}
                              title="Approve Author"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="books-count">
                          <span className="count">{author.books?.length || 0}</span> books
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-action btn-edit"
                            onClick={() => handleEditAuthor(author)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteAuthor(author.id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                          <button 
                            className="btn-action btn-view"
                            onClick={() => window.open(`/authors/${author.id}`, '_blank')}
                            title="View Profile"
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

      {/* Author Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentAuthor ? 'Edit Author' : 'Add New Author'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>User *</label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                    required
                    disabled={currentAuthor}
                  >
                    <option value="">Select a user</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email}) - {user.role}
                      </option>
                    ))}
                  </select>
                  <small className="form-help">Select the user to associate with this author</small>
                </div>
                <div className="form-group">
                  <label>Biography</label>
                  <textarea
                    value={formData.biography}
                    onChange={(e) => setFormData({...formData, biography: e.target.value})}
                    placeholder="Author biography..."
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Qualifications</label>
                  <input
                    type="text"
                    value={formData.qualifications}
                    onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                    placeholder="e.g., PhD in Literature"
                  />
                </div>
                <div className="form-group">
                  <label>Experience</label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    placeholder="e.g., 10 years of writing"
                  />
                </div>
                <div className="form-group">
                  <label>Photo URL</label>
                  <input
                    type="text"
                    value={formData.photo}
                    onChange={(e) => setFormData({...formData, photo: e.target.value})}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_approved}
                      onChange={(e) => setFormData({...formData, is_approved: e.target.checked})}
                    />
                    <span>Approved</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {currentAuthor ? 'Update Author' : 'Create Author'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuthors;