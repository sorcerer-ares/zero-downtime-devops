const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'devuser',
  password: process.env.DB_PASSWORD || 'devpassword',
  database: process.env.DB_NAME || 'userdb',
});

// Health Check Endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', version: 'v3-final' }));

// Fetch Users Endpoint
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, first_name, last_name, email, created_at FROM users ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create User Endpoint (App v3 - strictly first_name / last_name)
app.post('/users', async (req, res) => {
  const { first_name, last_name, email } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email) 
       VALUES ($1, $2, $3) RETURNING *`,
      [first_name, last_name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App v3 running on http://localhost:${PORT}`);
});
