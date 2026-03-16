import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://book-library-management-system-backend.onrender.com/api';

const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register:       (d) => api.post('/auth/register', d),
  verifyOTP:      (d) => api.post('/auth/verify-otp', d),
  login:          (d) => api.post('/auth/login', d),
  logout:         ()  => api.post('/auth/logout'),
  refreshToken:   (t) => api.post('/auth/refresh', { refreshToken: t }),
  forgotPassword: (d) => api.post('/auth/forgot-password', d),
  resetPassword:  (d) => api.post('/auth/reset-password', d),
  resendOTP:      (d) => api.post('/auth/resend-otp', d),
};

export const userAPI = {
  getProfile:           () => api.get('/users/profile'),
  updateProfile:        (d) => api.put('/users/profile', d),
  getDashboard:         () => api.get('/users/dashboard'),
  requestAuthorUpgrade: (d) => api.post('/users/author-request', d),
  getAllUsers:           (p) => api.get('/users', { params: p }),
  deleteUser:           (id) => api.delete(`/users/${id}`),
};

export const bookAPI = {
  getAll:        (p)  => api.get('/books', { params: p }),
  getById:       (id) => api.get(`/books/${id}`),
  getGenres:     ()   => api.get('/books/genres/list'),
  getPopular:    (t)  => api.get(`/books/popular/${t}`),
  getReviews:    (id) => api.get(`/books/${id}/reviews`),
  create:        (d)  => api.post('/books', d),
  update:        (id, d) => api.put(`/books/${id}`, d),
  delete:        (id) => api.delete(`/books/${id}`),
  readBook:      (id) => api.get(`/books/${id}/read`),
};

export const rentalAPI = {
  request:       (bookId) => api.post('/rentals', { book_id: bookId }),
  getUserRentals: ()      => api.get('/rentals'),
  getById:       (id)     => api.get(`/rentals/${id}`),
  initiateReturn: (id)    => api.post(`/rentals/${id}/return`),
  cancel:        (id)     => api.delete(`/rentals/${id}`),
  getAll:        (p)      => api.get('/rentals/admin/all', { params: p }),
  getOverdue:    ()       => api.get('/rentals/admin/overdue'),
  getStats:      ()       => api.get('/rentals/admin/stats'),
  dispatch:      (id)     => api.post(`/rentals/${id}/dispatch`),
  confirmReturn: (id)     => api.post(`/rentals/${id}/confirm-return`),
};

export const wishlistAPI = {
  getAll:  ()      => api.get('/wishlist'),
  add:     (bookId) => api.post('/wishlist', { book_id: bookId }),
  remove:  (bookId) => api.delete(`/wishlist/${bookId}`),
  check:   (bookId) => api.get(`/wishlist/${bookId}/check`),
};

export const reviewAPI = {
  create:       (d)  => api.post('/reviews', d),
  getMyReviews: ()   => api.get('/reviews/my-reviews'),
  getById:      (id) => api.get(`/reviews/${id}`),
  delete:       (id) => api.delete(`/reviews/${id}`),
  getAll:       ()   => api.get('/reviews/admin/all'),
  moderate:     (id, d) => api.post(`/reviews/admin/${id}/moderate`, d),
};

export const authorAPI = {
  getProfile:       (id) => api.get(`/authors/${id}`),
  getBooks:         (id) => api.get(`/authors/${id}/books`),
  getManuscripts:   (id) => api.get(`/authors/${id}/manuscripts`),
  getMetrics:       (id) => api.get(`/authors/${id}/metrics`),
  submitManuscript: (d)  => api.post('/authors/manuscripts', d),
  getPending:       ()   => api.get('/authors/admin/pending'),
  approve:          (id, d) => api.post(`/authors/admin/${id}/approve`, d),
};

export const analyticsAPI = {
  getOverview:          () => api.get('/admin/analytics/overview'),
  getBookAnalytics:     (t) => api.get('/admin/analytics/books', { params: { type: t } }),
  getAuthorInsights:    () => api.get('/admin/analytics/authors'),
  getRentalAnalytics:   () => api.get('/admin/analytics/rentals'),
  getGenreDistribution: () => api.get('/admin/analytics/genres'),
  getRecentActivity:    () => api.get('/admin/analytics/activity'),
  getManuscriptAnalytics: () => api.get('/admin/analytics/manuscripts'),
};

export default api;
