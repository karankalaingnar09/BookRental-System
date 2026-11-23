// Auth guard
const user = JSON.parse(localStorage.getItem('user') || 'null');
if (!user || !localStorage.getItem('token')) {
    window.location.href = 'index.html';
}

const isAdmin = Array.isArray(user?.roles)
    ? user.roles.includes('ADMIN')
    : (user?.roles instanceof Object && Object.values(user.roles).includes('ADMIN'));

// Setup sidebar and welcome message
document.addEventListener('DOMContentLoaded', () => {
    const sidebarUser = document.getElementById('sidebarUser');
    if (sidebarUser) {
        sidebarUser.innerHTML = `
            <div class="user-name">${user.fullName || user.username}</div>
            <div class="user-role">${isAdmin ? '👑 Administrator' : '📚 Member'}</div>
        `;
    }
    const welcomeMsg = document.getElementById('welcomeMsg');
    if (welcomeMsg) welcomeMsg.textContent = `Hello, ${user.fullName || user.username}!`;
    if (isAdmin) {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    }
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Toast notifications
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    const icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle', warning: 'exclamation-triangle' };
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Book registry — avoids passing JSON through onclick attributes
const _bookRegistry = {};

// Book card renderer
function renderBookCard(book, showRentBtn = true) {
    _bookRegistry[book.id] = book;
    const available = book.available && book.availableCopies > 0;
    const coverHtml = book.coverImage
        ? `<img src="${book.coverImage}" alt="${escapeHtml(book.title)}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-book\\'></i>'">`
        : '<i class="fas fa-book"></i>';

    return `
        <div class="book-card">
            <div class="book-cover">${coverHtml}</div>
            <div class="book-info">
                <div class="book-title">${escapeHtml(book.title)}</div>
                <div class="book-author">by ${escapeHtml(book.author)}</div>
                ${book.genre ? `<span class="book-genre">${escapeHtml(book.genre)}</span>` : ''}
                <div class="book-price">$${parseFloat(book.rentalPricePerDay).toFixed(2)}/day</div>
                <div class="book-availability ${available ? 'available' : 'unavailable'}">
                    <i class="fas fa-${available ? 'check-circle' : 'times-circle'}"></i>
                    ${available ? `${book.availableCopies} available` : 'Not available'}
                </div>
                ${showRentBtn ? `
                <div class="book-actions">
                    <button class="btn-rent" onclick="openRentModal(${book.id})" ${!available ? 'disabled' : ''}>
                        <i class="fas fa-bookmark"></i> ${available ? 'Rent Now' : 'Unavailable'}
                    </button>
                </div>` : ''}
            </div>
        </div>
    `;
}

// Rent modal
let selectedBook = null;

function openRentModal(bookId) {
    const book = _bookRegistry[bookId];
    if (!book) { showToast('Book data not found, please refresh the page', 'error'); return; }
    selectedBook = book;

    const coverHtml = book.coverImage
        ? `<img src="${book.coverImage}" alt="${escapeHtml(book.title)}" style="width:60px;height:80px;object-fit:cover;border-radius:6px" onerror="this.style.display='none'">`
        : `<div style="width:60px;height:80px;background:linear-gradient(135deg,#4f46e5,#06b6d4);border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-size:24px"><i class='fas fa-book'></i></div>`;

    document.getElementById('rentBookInfo').innerHTML = `
        <div class="rent-book-preview">
            ${coverHtml}
            <div class="preview-info">
                <h4>${escapeHtml(book.title)}</h4>
                <p>by ${escapeHtml(book.author)}</p>
                ${book.genre ? `<p style="color:var(--primary);font-size:12px;margin-top:2px">${escapeHtml(book.genre)}</p>` : ''}
                <div class="price">$${parseFloat(book.rentalPricePerDay).toFixed(2)}/day</div>
            </div>
        </div>
    `;

    const daysInput = document.getElementById('rentalDays');
    daysInput.value = 7;
    updateCostPreview();

    // Reset confirm button state
    const confirmBtn = document.getElementById('confirmRentBtn');
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = '<i class="fas fa-check"></i> Confirm Rental';

    document.getElementById('rentModal').classList.remove('hidden');
}

function updateCostPreview() {
    if (!selectedBook) return;
    const days = parseInt(document.getElementById('rentalDays').value) || 0;
    const cost = (parseFloat(selectedBook.rentalPricePerDay) * days).toFixed(2);
    document.getElementById('estimatedCost').textContent = `$${cost}`;
}

function closeModal() {
    document.getElementById('rentModal').classList.add('hidden');
    selectedBook = null;
}

async function confirmRent() {
    if (!selectedBook) return;
    const days = parseInt(document.getElementById('rentalDays').value);
    if (!days || days < 1 || days > 90) {
        showToast('Please enter rental days between 1 and 90', 'error');
        return;
    }

    const btn = document.getElementById('confirmRentBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    const bookTitle = selectedBook.title;
    const bookId = selectedBook.id;

    try {
        await api.rentBook(bookId, days);
        closeModal();
        showToast(`"${bookTitle}" rented for ${days} day(s)!`, 'success');
        if (typeof loadBooks === 'function') loadBooks();
        if (typeof loadDashboard === 'function') loadDashboard();
    } catch (err) {
        showToast(err.message || 'Failed to rent book', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Confirm Rental';
    }
}

// Utilities
function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function statusBadge(status) {
    const map = { ACTIVE: 'active', RETURNED: 'returned', OVERDUE: 'overdue' };
    const labels = { ACTIVE: 'Active', RETURNED: 'Returned', OVERDUE: 'Overdue' };
    return `<span class="badge badge-${map[status] || 'active'}">${labels[status] || status}</span>`;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Close modal ONLY when clicking the dark overlay background itself (not children)
document.addEventListener('click', (e) => {
    const modal = document.getElementById('rentModal');
    if (modal && e.target === modal) closeModal();
});

// Escape key closes modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        if (typeof closeBookModal === 'function') closeBookModal();
    }
});
