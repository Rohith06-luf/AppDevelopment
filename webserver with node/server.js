/* ==========================================================================
   NODE.JS + EXPRESS STATIC WEBSERVER
   Serves static HTML pages, processes contact form submissions via POST (303),
   and handles unknown routes with a custom 404 page.
   ========================================================================== */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middleware: Parse URL-encoded form data from HTML POST requests
app.use(express.urlencoded({ extended: false }));

// 2. Middleware: Serve static files (CSS, images, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================================================
// ROUTE HANDLERS
// ==========================================================================

// Route: GET / -> Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route: GET /about -> About Page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Route: GET /contact -> Contact Page
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Route: POST /contact -> Process & Validate Form Data
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    // Email format regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Server-side validation rules:
    // - Name: 1 to 100 characters
    const isNameValid = name && name.trim().length >= 1 && name.trim().length <= 100;

    // - Email: Valid email format & max 254 characters
    const isEmailValid = email && email.trim().length <= 254 && emailRegex.test(email.trim());

    // - Message: 1 to 2000 characters
    const isMessageValid = message && message.trim().length >= 1 && message.trim().length <= 2000;

    // Perform check and redirect using HTTP 303 (Post/Redirect/Get pattern)
    if (isNameValid && isEmailValid && isMessageValid) {
        // Valid: Redirect to /contact?sent=1
        return res.redirect(303, '/contact?sent=1');
    } else {
        // Invalid: Redirect to /contact?error=1
        return res.redirect(303, '/contact?error=1');
    }
});

// Wildcard Route: Unknown URLs -> Custom 404 Page with HTTP Status 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// ==========================================================================
// START SERVER
// ==========================================================================
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
