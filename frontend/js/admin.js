// Admin guard
if (!isAdmin) window.location.href = 'dashboard.html';

let editingBookId = null;
let adminAllBooks = [];
let adminAllRentals = [];

// ===== Stats =====
async function loadAdminStats() {
    try {
        const stats = await api.getAdminStats();
        document.getElementById('statTotalBooks').textContent = stats.totalBooks;
        document.getElementById('statTotalUsers').textContent = stats.totalUsers;
        document.getElementById('statActiveRentals').textContent = stats.activeRentals;
        document.getElementById('statOverdue').textContent = stats.overdueRentals;
        document.getElementById('statRevenue').textContent = `$${parseFloat(stats.totalRevenue || 0).toFixed(2)}`;
    } catch (err) {
        showToast('Failed to load stats', 'error');
    }
}

// Book registry for admin edit buttons
const _adminBookRegistry = {};

// ===== Books =====
async function loadAdminBooks() {
    document.getElementById('adminBooksTable').innerHTML = '<tr><td colspan="8" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
    try {
        adminAllBooks = await api.getBooks();
        renderAdminBooks(adminAllBooks);
    } catch (err) {
        showToast(err.message || 'Failed to load books', 'error');
    }
}

function renderAdminBooks(books) {
    const tbody = document.getElementById('adminBooksTable');
    if (!books.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No books found</td></tr>';
        return;
    }
    tbody.innerHTML = books.map(b => `
        <tr>
            <td>
                ${b.coverImage
                    ? `<img src="${b.coverImage}" style="width:40px;height:52px;object-fit:cover;border-radius:4px" onerror="this.style.display='none'">`
                    : '<i class="fas fa-book" style="font-size:22px;color:var(--primary)"></i>'}
            </td>
            <td><strong>${escapeHtml(b.title)}</strong></td>
            <td>${escapeHtml(b.author)}</td>
            <td>${b.genre ? `<span class="book-genre">${escapeHtml(b.genre)}</span>` : '—'}</td>
            <td>$${parseFloat(b.rentalPricePerDay).toFixed(2)}</td>
            <td>${b.totalCopies}</td>
            <td>
                <span class="badge ${b.availableCopies > 0 ? 'badge-active' : 'badge-overdue'}">
                    ${b.availableCopies}/${b.totalCopies}
                </span>
            </td>
            <td>
                <div style="display:flex;gap:6px">
                    <button class="btn-primary btn-sm" onclick='openEditBookModal(${JSON.stringify(b)})' title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger btn-sm" onclick="deleteBook(${b.id}, '${escapeHtml(b.title).replace(/'/g, "\\'")}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function searchAdminBooks(query) {
    if (!query.trim()) { renderAdminBooks(adminAllBooks); return; }
    const q = query.toLowerCase();
    renderAdminBooks(adminAllBooks.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.genre && b.genre.toLowerCase().includes(q))
    ));
}

// ===== Rentals =====
async function loadAdminRentals() {
    document.getElementById('adminRentalsTable').innerHTML = '<tr><td colspan="8" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
    try {
        adminAllRentals = await api.getAllRentals();
        renderAdminRentals(adminAllRentals);
    } catch (err) {
        showToast(err.message || 'Failed to load rentals', 'error');
    }
}

function renderAdminRentals(rentals) {
    const tbody = document.getElementById('adminRentalsTable');
    if (!rentals.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No rentals found</td></tr>';
        return;
    }
    tbody.innerHTML = rentals.map(r => `
        <tr>
            <td><strong>${escapeHtml(r.username)}</strong></td>
            <td>${escapeHtml(r.bookTitle)}</td>
            <td>${formatDate(r.rentalDate)}</td>
            <td>${formatDate(r.dueDate)}</td>
            <td>${formatDate(r.returnDate)}</td>
            <td>${statusBadge(r.status)}</td>
            <td>$${r.totalCost ? parseFloat(r.totalCost).toFixed(2) : '0.00'}</td>
            <td>${r.lateFee && parseFloat(r.lateFee) > 0
                ? `<span style="color:var(--danger);font-weight:600">$${parseFloat(r.lateFee).toFixed(2)}</span>`
                : '—'}</td>
        </tr>
    `).join('');
}

function searchAdminRentals(query) {
    if (!query.trim()) { renderAdminRentals(adminAllRentals); return; }
    const q = query.toLowerCase();
    renderAdminRentals(adminAllRentals.filter(r =>
        r.username.toLowerCase().includes(q) ||
        r.bookTitle.toLowerCase().includes(q)
    ));
}

function filterAdminRentals(status) {
    const filtered = status === 'all' ? adminAllRentals : adminAllRentals.filter(r => r.status === status);
    renderAdminRentals(filtered);
}

// ===== Tab switching =====
function showAdminTab(tab, btn) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('admin-books').classList.toggle('hidden', tab !== 'books');
    document.getElementById('admin-rentals').classList.toggle('hidden', tab !== 'rentals');
    if (tab === 'rentals' && adminAllRentals.length === 0) loadAdminRentals();
}

// ===== Add / Edit Book Modal =====
function openAddBookModal() {
    editingBookId = null;
    document.getElementById('bookModalTitle').textContent = 'Add New Book';
    document.getElementById('bookForm').reset();
    document.getElementById('bookCopies').value = 1;
    document.getElementById('bookModalAlert').classList.add('hidden');
    document.getElementById('coverPreview').style.display = 'none';
    document.getElementById('bookModal').classList.remove('hidden');
}

function openEditBookModal(book) {
    editingBookId = book.id;
    document.getElementById('bookModalTitle').textContent = 'Edit Book';
    document.getElementById('bookTitle').value = book.title || '';
    document.getElementById('bookAuthor').value = book.author || '';
    document.getElementById('bookIsbn').value = book.isbn || '';
    document.getElementById('bookGenre').value = book.genre || '';
    document.getElementById('bookDescription').value = book.description || '';
    document.getElementById('bookCover').value = book.coverImage || '';
    document.getElementById('bookPrice').value = book.rentalPricePerDay;
    document.getElementById('bookCopies').value = book.totalCopies;
    document.getElementById('bookModalAlert').classList.add('hidden');
    previewCover(book.coverImage);
    document.getElementById('bookModal').classList.remove('hidden');
}

function closeBookModal() {
    document.getElementById('bookModal').classList.add('hidden');
    editingBookId = null;
}

function previewCover(url) {
    const preview = document.getElementById('coverPreview');
    if (url && url.trim()) {
        preview.src = url;
        preview.style.display = 'block';
        preview.onerror = () => { preview.style.display = 'none'; };
    } else {
        preview.style.display = 'none';
    }
}

async function saveBook() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const price = parseFloat(document.getElementById('bookPrice').value);
    const copies = parseInt(document.getElementById('bookCopies').value);

    const alertEl = document.getElementById('bookModalAlert');
    const showModalAlert = (msg) => {
        alertEl.className = 'alert alert-error';
        alertEl.textContent = msg;
        alertEl.classList.remove('hidden');
    };

    if (!title) { showModalAlert('Title is required'); return; }
    if (!author) { showModalAlert('Author is required'); return; }
    if (!price || price <= 0) { showModalAlert('Valid rental price is required'); return; }
    if (!copies || copies < 1) { showModalAlert('At least 1 copy is required'); return; }

    const data = {
        title,
        author,
        isbn: document.getElementById('bookIsbn').value.trim(),
        genre: document.getElementById('bookGenre').value.trim(),
        description: document.getElementById('bookDescription').value.trim(),
        coverImage: document.getElementById('bookCover').value.trim(),
        rentalPricePerDay: price,
        totalCopies: copies
    };

    const saveBtn = document.getElementById('saveBookBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        if (editingBookId) {
            await api.updateBook(editingBookId, data);
            showToast('Book updated successfully!', 'success');
        } else {
            await api.addBook(data);
            showToast('Book added successfully!', 'success');
        }
        closeBookModal();
        loadAdminBooks();
        loadAdminStats();
    } catch (err) {
        showModalAlert(err.message || 'Failed to save book');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Book';
    }
}

async function deleteBook(id, title) {
    if (!confirm(`Delete "${title}"?\n\nThis cannot be undone.`)) return;
    try {
        await api.deleteBook(id);
        showToast(`"${title}" deleted`, 'success');
        loadAdminBooks();
        loadAdminStats();
    } catch (err) {
        showToast(err.message || 'Failed to delete book', 'error');
    }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.id === 'bookModal') closeBookModal();
});

document.addEventListener('DOMContentLoaded', () => {
    loadAdminStats();
    loadAdminBooks();
});
