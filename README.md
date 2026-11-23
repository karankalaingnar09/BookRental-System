# Book Rental System

A full-stack book rental application with a Spring Boot backend and vanilla JS frontend.

## Tech Stack
- **Backend**: Spring Boot 3.2, Spring Security (JWT), Spring Data JPA, H2 (in-memory DB)
- **Frontend**: HTML, CSS, Vanilla JavaScript

---

## Running the Backend

### Prerequisites
- Java 17+
- Maven 3.6+

### Steps
```bash
cd backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

H2 Console: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:bookrentaldb`
- Username: `sa` | Password: *(empty)*

---

## Running the Frontend

### Option 1 — Open directly
Open `frontend/index.html` in your browser.

> **Note**: Some browsers block `fetch` on `file://` URLs. Use Option 2 if you see CORS errors.

### Option 2 — Serve with Node
```bash
cd frontend
npm install
npm start
```
Then open `http://localhost:3000`

---

## Default Credentials

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | admin    | admin123  |

Register new users via the Sign Up page.

---

## Features

### User
- Register / Login with JWT auth
- Browse and search books by title, author, genre
- Filter by genre and availability
- Rent books with custom duration and cost preview
- View and return active rentals
- Late fee calculation for overdue returns

### Admin
- Add, edit, delete books
- View all rentals across all users
- Dashboard with system-wide stats (total books, active rentals, overdue, revenue)

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/books` | Public | List all books |
| GET | `/api/books/available` | Public | Available books |
| GET | `/api/books/search?q=` | Public | Search books |
| GET | `/api/books/genre/{genre}` | Public | Filter by genre |
| POST | `/api/books` | Admin | Add book |
| PUT | `/api/books/{id}` | Admin | Update book |
| DELETE | `/api/books/{id}` | Admin | Delete book |
| POST | `/api/rentals/rent` | User | Rent a book |
| POST | `/api/rentals/{id}/return` | User | Return a book |
| GET | `/api/rentals/my` | User | My rentals |
| GET | `/api/rentals/all` | Admin | All rentals |
| GET | `/api/admin/stats` | Admin | System stats |
