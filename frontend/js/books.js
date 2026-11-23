let allBooks = [];
let searchTimer = null;

async function loadBooks() {
    document.getElementById('booksGrid').innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
    try {
        allBooks = await api.getBooks();
        populateGenres(allBooks);
        renderBooks(allBooks);
    } catch (err) {
        showToast(err.message || 'Failed to load books', 'error');
        document.getElementById('booksGrid').innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Failed to load books</h3>
                <p>${err.message}</p>
                <button class="btn-primary" onclick="loadBooks()" style="margin-top:16px">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>`;
    }
}

function populateGenres(books) {
    const genres = [...new Set(books.map(b => b.genre).filter(Boolean))].sort();
    const select = document.getElementById('genreFilter');
    // Keep first "All Genres" option, replace rest
    select.innerHTML = '<option value="">All Genres</option>' +
        genres.map(g => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join('');
}

function renderBooks(books) {
    const grid = document.getElementById('booksGrid');
    if (!books.length) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <i class="fas fa-search"></i>
                <h3>No books found</h3>
                <p>Try a different search term or filter</p>
            </div>`;
        return;
    }
    grid.innerHTML = books.map(b => renderBookCard(b)).join('');
}

function debounceSearch(value) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => performSearch(value), 400);
}

async function performSearch(query) {
    // Reset other filters visually
    document.getElementById('genreFilter').value = '';
    document.getElementById('availFilter').value = 'all';

    if (!query.trim()) {
        renderBooks(allBooks);
        return;
    }
    try {
        const results = await api.searchBooks(query);
        renderBooks(results);
    } catch {
        // Fallback to client-side search
        const q = query.toLowerCase();
        renderBooks(allBooks.filter(b =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            (b.genre && b.genre.toLowerCase().includes(q))
        ));
    }
}

async function filterByGenre(genre) {
    document.getElementById('searchInput').value = '';
    document.getElementById('availFilter').value = 'all';
    if (!genre) { renderBooks(allBooks); return; }
    try {
        const results = await api.getBooksByGenre(genre);
        renderBooks(results);
    } catch {
        renderBooks(allBooks.filter(b => b.genre?.toLowerCase() === genre.toLowerCase()));
    }
}

function filterAvailability(value) {
    document.getElementById('searchInput').value = '';
    document.getElementById('genreFilter').value = '';
    renderBooks(value === 'available' ? allBooks.filter(b => b.available && b.availableCopies > 0) : allBooks);
}

document.addEventListener('DOMContentLoaded', loadBooks);
