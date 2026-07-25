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
app.get('/health', (req, res) => res.json({ status: 'ok', version: 'v2-dual-write' }));

// Fetch Users Endpoint
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create User Endpoint (Dual-Write Logic)
app.post('/users', async (req, res) => {
  let { full_name, first_name, last_name, email } = req.body;

  // Normalize input data: compute split names if full_name is sent, or vice-versa
  if (full_name && (!first_name || !last_name)) {
    const parts = full_name.trim().split(' ');
    first_name = parts[0] || '';
    last_name = parts.slice(1).join(' ') || '';
  } else if (!full_name && first_name) {
    full_name = `${first_name} ${last_name}`.trim();
  }

  try {
    // DUAL-WRITE: Persist data into both old and new schema structures
    const result = await pool.query(
      `INSERT INTO users (full_name, first_name, last_name, email) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [full_name, first_name, last_name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App v2 (Dual-Write) running on http://localhost:${PORT}`);
});

