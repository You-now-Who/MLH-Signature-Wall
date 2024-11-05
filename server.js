const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

// Create and connect to the SQLite database
const db = new sqlite3.Database('./messages.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            message TEXT NOT NULL,
            font TEXT NOT NULL
        )`);
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/message', (req, res) => {
    res.sendFile(path.join(__dirname, 'leave_note.html'));
});

app.get('/submit.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'submit.html'));
});

app.post('/submit_note', (req, res) => {
    const { name, message, font } = req.body;
    const sql = `INSERT INTO notes (name, message, font) VALUES (?, ?, ?)`;
    db.run(sql, [name, message, font], function (err) {
        if (err) {
            console.error('Error inserting data', err.message);
            res.status(500).send('An error occurred while saving your message.');
        } else {
            console.log('Message saved to database');
            res.redirect('/');
        }
    });
});

app.get('/get_messages', (req, res) => {
    const sql = `SELECT name, message, font FROM notes`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching data', err.message);
            res.status(500).send('An error occurred while fetching messages.');
        } else {
            res.json(rows);
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
