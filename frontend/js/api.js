const API_BASE = 'http://localhost:8080/api';

const api = {
    getToken: () => localStorage.getItem('token'),

    headers(auth = true) {
        const h = { 'Content-Type': 'application/json' };
        if (auth && this.getToken()) h['Authorization'] = `Bearer ${this.getToken()}`;
        return h;
    },

    async request(method, path, body = null, auth = true) {
        try {
            const opts = { method, headers: this.headers(auth) };
            if (body) opts.body = JSON.stringify(body);
            const res = await fetch(`${API_BASE}${path}`, opts);
            const text = await res.text();
            let data = {};
            try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
            if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
            return data;
        } catch (err) {
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                throw new Error('Cannot connect to server. Make sure the backend is running on port 8080.');
            }
            throw err;
        }
    },

    get: (path, auth = true) => api.request('GET', path, null, auth),
    post: (path, body, auth = true) => api.request('POST', path, body, auth),
    put: (path, body) => api.request('PUT', path, body),
    delete: (path) => api.request('DELETE', path),

    // Auth
    login: (data) => api.post('/auth/login', data, false),
    register: (data) => api.post('/auth/register', data, false),

    // Books
    getBooks: () => api.get('/books', false),
    getAvailableBooks: () => api.get('/books/available', false),
    searchBooks: (q) => api.get(`/books/search?q=${encodeURIComponent(q)}`, false),
    getBooksByGenre: (genre) => api.get(`/books/genre/${encodeURIComponent(genre)}`, false),
    getBook: (id) => api.get(`/books/${id}`, false),
    addBook: (data) => api.post('/books', data),
    updateBook: (id, data) => api.put(`/books/${id}`, data),
    deleteBook: (id) => api.delete(`/books/${id}`),

    // Rentals
    rentBook: (bookId, rentalDays) => api.post('/rentals/rent', { bookId, rentalDays }),
    returnBook: (id) => api.post(`/rentals/${id}/return`, {}),
    getMyRentals: () => api.get('/rentals/my'),
    getAllRentals: () => api.get('/rentals/all'),

    // Admin
    getAdminStats: () => api.get('/admin/stats'),
};
