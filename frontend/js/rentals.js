let allRentals = [];

async function loadRentals() {
    document.getElementById('rentalsContainer').innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
    try {
        allRentals = await api.getMyRentals();
        updateTabCounts();
        renderRentals(allRentals);
    } catch (err) {
        showToast(err.message || 'Failed to load rentals', 'error');
        document.getElementById('rentalsContainer').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Failed to load rentals</h3>
                <p>${err.message}</p>
                <button class="btn-primary" onclick="loadRentals()" style="margin-top:16px">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>`;
    }
}

function updateTabCounts() {
    const counts = {
        all: allRentals.length,
        ACTIVE: allRentals.filter(r => r.status === 'ACTIVE').length,
        RETURNED: allRentals.filter(r => r.status === 'RETURNED').length,
        OVERDUE: allRentals.filter(r => r.status === 'OVERDUE').length,
    };
    const tabs = document.querySelectorAll('.rental-tab');
    const keys = ['all', 'ACTIVE', 'RETURNED', 'OVERDUE'];
    tabs.forEach((tab, i) => {
        const key = keys[i];
        const label = tab.textContent.replace(/\s*\(\d+\)/, '');
        tab.textContent = counts[key] > 0 ? `${label} (${counts[key]})` : label;
    });
}

function filterRentals(status, btn) {
    document.querySelectorAll('.rental-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const filtered = status === 'all' ? allRentals : allRentals.filter(r => r.status === status);
    renderRentals(filtered);
}

function renderRentals(rentals) {
    const container = document.getElementById('rentalsContainer');
    if (!rentals.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bookmark"></i>
                <h3>No rentals found</h3>
                <p>Start by <a href="books.html" style="color:var(--primary)">browsing our books</a></p>
            </div>`;
        return;
    }
    container.innerHTML = `<div class="rentals-grid">${rentals.map(r => renderRentalCard(r)).join('')}</div>`;
}

function renderRentalCard(r) {
    const isActive = r.status === 'ACTIVE';
    const isOverdue = r.status === 'OVERDUE';
    const today = new Date();
    const dueDate = new Date(r.dueDate + 'T00:00:00');
    const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    const coverHtml = r.bookCover
        ? `<img src="${r.bookCover}" alt="${escapeHtml(r.bookTitle)}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-book\\'></i>'">`
        : '<i class="fas fa-book"></i>';

    let dueDateStyle = '';
    let daysLeftHtml = '';
    if (isActive) {
        if (daysLeft < 0) {
            dueDateStyle = 'color:var(--danger)';
            daysLeftHtml = `<span style="color:var(--danger);font-size:11px;font-weight:600"> (${Math.abs(daysLeft)} days overdue)</span>`;
        } else if (daysLeft <= 2) {
            dueDateStyle = 'color:var(--warning)';
            daysLeftHtml = `<span style="color:var(--warning);font-size:11px;font-weight:600"> (${daysLeft} day${daysLeft !== 1 ? 's' : ''} left)</span>`;
        }
    }

    return `
        <div class="rental-card ${isOverdue ? 'rental-overdue' : ''}">
            <div class="rental-book-cover">${coverHtml}</div>
            <div class="rental-details">
                <div class="rental-book-title">${escapeHtml(r.bookTitle)}</div>
                <div class="rental-book-author">by ${escapeHtml(r.bookAuthor)}</div>
                <div class="rental-meta">
                    <div class="rental-meta-item">
                        <i class="fas fa-calendar-plus"></i>
                        <span>Rented: <strong>${formatDate(r.rentalDate)}</strong></span>
                    </div>
                    <div class="rental-meta-item">
                        <i class="fas fa-calendar-times"></i>
                        <span>Due: <strong style="${dueDateStyle}">${formatDate(r.dueDate)}</strong>${daysLeftHtml}</span>
                    </div>
                    ${r.returnDate ? `
                    <div class="rental-meta-item">
                        <i class="fas fa-check-circle" style="color:var(--success)"></i>
                        <span>Returned: <strong>${formatDate(r.returnDate)}</strong></span>
                    </div>` : ''}
                    <div class="rental-meta-item">
                        <i class="fas fa-dollar-sign"></i>
                        <span>Cost: <strong>$${r.totalCost ? parseFloat(r.totalCost).toFixed(2) : '0.00'}</strong>
                        ${r.lateFee && parseFloat(r.lateFee) > 0
                            ? `<span style="color:var(--danger)"> + $${parseFloat(r.lateFee).toFixed(2)} late fee</span>`
                            : ''}</span>
                    </div>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
                    ${statusBadge(r.status)}
                    ${isActive || isOverdue ? `
                    <button class="btn-primary btn-sm" onclick="returnBook(${r.id})" id="return-btn-${r.id}">
                        <i class="fas fa-undo"></i> Return
                    </button>` : ''}
                </div>
            </div>
        </div>
    `;
}

async function returnBook(rentalId) {
    if (!confirm('Confirm return of this book?')) return;
    const btn = document.getElementById(`return-btn-${rentalId}`);
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }
    try {
        const result = await api.returnBook(rentalId);
        let msg = 'Book returned successfully!';
        if (result.lateFee && parseFloat(result.lateFee) > 0) {
            msg += ` Late fee: $${parseFloat(result.lateFee).toFixed(2)}`;
        }
        showToast(msg, result.lateFee ? 'warning' : 'success');
        loadRentals();
    } catch (err) {
        showToast(err.message || 'Failed to return book', 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-undo"></i> Return'; }
    }
}

document.addEventListener('DOMContentLoaded', loadRentals);
