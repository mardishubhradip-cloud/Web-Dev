const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection Pool (XAMPP Default)
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'library_db',
    waitForConnections: true,
    connectionLimit: 10
});

// ==========================================
// PAGE ROUTING
// ==========================================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/student-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'student-dashboard.html')));
app.get('/admin-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html')));

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Student Register
app.post('/api/auth/student/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

    const sql = 'INSERT INTO students (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, password], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already registered' });
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Registration successful! You can now log in.', student_id: result.insertId });
    });
});

// Student Login
app.post('/api/auth/student/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT student_id, name, email FROM students WHERE email = ? AND password = ?';
    
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
        
        res.json({ message: 'Login successful', user: results[0], role: 'student' });
    });
});

// Admin Login
app.post('/api/auth/admin/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT admin_id, username, name FROM admins WHERE username = ? AND password = ?';

    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid admin credentials' });

        res.json({ message: 'Admin login successful', user: results[0], role: 'admin' });
    });
});

// ==========================================
// STUDENT & BOOK API ROUTES
// ==========================================

// Search Books with Pagination
app.get('/api/books/search', (req, res) => {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit) || 5;
    const offset = parseInt(req.query.offset) || 0;
    const searchParam = `%${query}%`;

    const sqlCount = `SELECT COUNT(*) AS total FROM books b LEFT JOIN categories c ON b.category_id = c.category_id WHERE b.title LIKE ? OR b.author LIKE ? OR c.category_name LIKE ?`;
    const sqlData = `SELECT b.book_id, b.title, b.author, c.category_name, b.category_id, b.quantity FROM books b LEFT JOIN categories c ON b.category_id = c.category_id WHERE b.title LIKE ? OR b.author LIKE ? OR c.category_name LIKE ? ORDER BY b.book_id DESC LIMIT ? OFFSET ?`;

    db.query(sqlCount, [searchParam, searchParam, searchParam], (err, countResult) => {
        if (err) return res.status(500).json({ error: err.message });
        const total = countResult[0].total;

        db.query(sqlData, [searchParam, searchParam, searchParam, limit, offset], (err, books) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ books, total, hasMore: offset + books.length < total });
        });
    });
});

// Student Issued Books
app.get('/api/students/:id/issues', (req, res) => {
    const sql = `
        SELECT i.issue_id, b.title, b.author, i.issue_date, i.due_date, i.return_date,
            DATEDIFF(i.due_date, CURDATE()) AS days_remaining
        FROM book_issues i
        JOIN books b ON i.book_id = b.book_id
        WHERE i.student_id = ?
        ORDER BY i.issue_id DESC
    `;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Categories Dropdown
app.get('/api/categories', (req, res) => {
    db.query('SELECT * FROM categories ORDER BY category_name ASC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add Book
app.post('/api/books', (req, res) => {
    const { title, author, category_id, quantity } = req.body;
    db.query('INSERT INTO books (title, author, category_id, quantity) VALUES (?, ?, ?, ?)', [title, author, category_id || null, quantity || 1], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Book added successfully', book_id: result.insertId });
    });
});

// Edit Book
app.put('/api/books/:id', (req, res) => {
    const { title, author, category_id, quantity } = req.body;
    db.query('UPDATE books SET title = ?, author = ?, category_id = ?, quantity = ? WHERE book_id = ?', [title, author, category_id || null, quantity, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Book updated successfully' });
    });
});

// Delete Book
app.delete('/api/books/:id', (req, res) => {
    db.query('DELETE FROM books WHERE book_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Book deleted successfully' });
    });
});

// Issue Book
app.post('/api/issues', (req, res) => {
    const { book_id, student_id, days_valid } = req.body;
    db.query('SELECT quantity FROM books WHERE book_id = ?', [book_id], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'Book not found' });
        if (results[0].quantity <= 0) return res.status(400).json({ error: 'Book is out of stock' });

        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (parseInt(days_valid) || 14));

        db.query('INSERT INTO book_issues (book_id, student_id, issue_date, due_date) VALUES (?, ?, ?, ?)', [book_id, student_id, issueDate, dueDate], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            db.query('UPDATE books SET quantity = quantity - 1 WHERE book_id = ?', [book_id]);
            res.json({ message: 'Book issued successfully' });
        });
    });
});

// Return Book
app.put('/api/issues/:id/return', (req, res) => {
    db.query('SELECT book_id, return_date FROM book_issues WHERE issue_id = ?', [req.params.id], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'Issue record not found' });
        if (results[0].return_date !== null) return res.status(400).json({ error: 'Book already returned' });

        const bookId = results[0].book_id;
        db.query('UPDATE book_issues SET return_date = ? WHERE issue_id = ?', [new Date(), req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            db.query('UPDATE books SET quantity = quantity + 1 WHERE book_id = ?', [bookId]);
            res.json({ message: 'Book returned successfully' });
        });
    });
});

// Overdue Report
app.get('/api/issues/overdue', (req, res) => {
    const sql = `
        SELECT i.issue_id, b.title, s.name AS student_name, s.email, i.issue_date, i.due_date,
            DATEDIFF(CURDATE(), i.due_date) AS days_overdue
        FROM book_issues i
        JOIN books b ON i.book_id = b.book_id
        JOIN students s ON i.student_id = s.student_id
        WHERE i.return_date IS NULL AND i.due_date < CURDATE()
        ORDER BY days_overdue DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));