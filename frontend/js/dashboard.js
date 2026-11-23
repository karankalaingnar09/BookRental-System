async function loadDashboard() {
    try {
        const requests = [api.getBooks(), api.getMyRentals()];
        if (isAdmin) requests.push(api.getAdminStats());
        const results = await Promise.all(requests);
        const books = results[0];
        const rentals = results[1];
        const adminStats = results[2] || null;

        const available = books.filter(b => b.available);
        const active = rentals.filter(r => r.status === 'ACTIVE');
        const overdue = rentals.filter(r => r.status === 'OVERDUE');

        document.getElementById('totalBooks').textContent = books.length;
        document.getElementById('availableBooks').textContent = available.length;

        if (isAdmin && adminStats) {
            document.getElementById('myActiveRentals').textContent = adminStats.activeRentals;
            document.getElementById('overdueRentals').textContent = adminStats.overdueRentals;
            document.querySelector('.stat-orange p').textContent = 'Active Rentals';
            document.querySelector('.stat-red p').textContent = 'Overdue Rentals';
        } else {
            document.getElementById('myActiveRentals').textContent = active.length;
            document.getElementById('overdueRentals').textContent = overdue.length;
        }

        // Featured books — first 6
        const featured = books.slice(0, 6);
        document.getElementById('featuredBooks').innerHTML = featured.length
            ? featured.map(b => renderBookCard(b)).join('')
            : '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-book-open"></i><h3>No books yet</h3><p>Check back soon</p></div>';

        // Recent rentals — last 5
        const recent = rentals.slice(0, 5);
        document.getElementById('recentRentalsTable').innerHTML = recent.length
            ? recent.map(r => `
                <tr>
                    <td>
                        <strong>${escapeHtml(r.bookTitle)}</strong>
                        <br><small style="color:var(--gray)">${escapeHtml(r.bookAuthor)}</small>
                    </td>
                    <td>${formatDate(r.rentalDate)}</td>
                    <td>${formatDate(r.dueDate)}</td>
                    <td>${statusBadge(r.status)}</td>
                    <td>$${r.totalCost ? parseFloat(r.totalCost).toFixed(2) : '0.00'}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="5" class="text-center">No rentals yet. <a href="books.html" style="color:var(--primary)">Browse books</a></td></tr>';

    } catch (err) {
        showToast(err.message || 'Failed to load dashboard', 'error');
    }
}

document.addEventListener('DOMContentLoaded', loadDashboard);
