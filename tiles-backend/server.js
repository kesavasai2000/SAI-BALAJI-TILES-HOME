// Load environment variables FIRST
// WHY? All secret values (DB password, JWT secret) live in .env file.
// dotenv reads that file and makes them available as process.env.VARIABLE_NAME
// NEVER hardcode secrets directly in code — anyone who sees your code sees your passwords.
require('dotenv').config();

const jwt     = require('jsonwebtoken');
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcrypt');
const { Pool } = require('pg');

const app = express();

// WHY cors()? Your HTML file runs on one origin (e.g. file:// or localhost:3000)
// and your server runs on localhost:5000. Browsers BLOCK requests between
// different origins by default (CORS policy). This middleware allows it.
app.use(cors());

// WHY express.json()? When the frontend sends fetch() with JSON body,
// Express can't read it without this. This parses the raw request body
// into req.body so you can do: const { email, password } = req.body;
app.use(express.json());

// SECRET KEY from .env
// WHY keep it in .env? If you push code to GitHub with a hardcoded secret,
// anyone can forge JWT tokens and log in as any user.
const SECRET_KEY = process.env.SECRET_KEY;

// PostgreSQL connection pool
// WHY a pool and not a single connection?
// A pool keeps multiple DB connections ready. If 100 users log in at once,
// each gets their own connection instead of waiting in a queue.
const pool = new Pool({
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port:     process.env.DB_PORT,
});


// ============================================================
// 🔐 AUTH MIDDLEWARE — The "Security Guard"
//
// WHY do we need this?
// Some routes should only be accessible to logged-in users.
// This function checks every incoming request for a valid JWT token.
// If valid → let them through (next())
// If missing or expired → block with 401/403 error
//
// You "attach" this guard to any route like:
//   app.get('/profile', authenticateToken, handler)
//                       ^^^^^^^^^^^^^^^^^ guard goes here
// ============================================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  // Token format from frontend: "Bearer eyJhbGci..."
  // We split by space and take the second part (the actual token)
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided ❌' });
  }

  try {
    // jwt.verify() checks:
    // 1. Was this token signed with OUR SECRET_KEY? (not a fake)
    // 2. Has it expired? (we set 1h expiry)
    // If both pass → decoded contains { userId, email, role, iat, exp }
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Attach user info to request for downstream use
    next();             // Pass control to the actual route handler
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token ❌' });
  }
}


// ============================================================
// 🟢 BASIC TEST ROUTES
// ============================================================

// Simple health check — visit http://localhost:5000/ in browser
app.get('/', (req, res) => {
  res.send('Server Running ✅');
});

// Database test — visit http://localhost:5000/test-db
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database connected ✅', time: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database connection failed ❌' });
  }
});


// ============================================================
// 🔒 PROTECTED PROFILE ROUTE
//
// WHY? This is the route our frontend calls to check if the
// saved JWT token is still valid (auto-redirect if already logged in).
// The authenticateToken middleware does all the verification.
// If it passes, req.user contains the decoded token payload.
// ============================================================
app.get('/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Profile accessed successfully ✅',
    user: req.user
    // req.user = { userId, email, role } — whatever we put in the token at login
  });
});


// ============================================================
// 📝 SIGNUP ROUTE
//
// FLOW:
// 1. Receive: name, email, password, phone, address from frontend
// 2. Validate that email isn't already taken
// 3. Hash the password with bcrypt (NEVER store plain passwords)
// 4. Insert new user into PostgreSQL
// 5. Return success (we don't return a token — user must login after)
//
// WHY bcrypt?
// bcrypt is a one-way hashing algorithm. Even if your database is hacked,
// the attacker only gets hashes like "$2b$10$xyz..." — not real passwords.
// bcrypt.hash(password, 10) → the "10" is the "salt rounds" (higher = safer but slower)
// ============================================================
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Basic server-side validation
    // WHY even though frontend validates? Because API can be called directly
    // (e.g. via Postman or curl) — always validate on the server too.
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required ❌' });
    }

    // Hash the password before saving
    // NEVER save plain text passwords — this is a security law
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into database
    // $1, $2... are placeholders — this prevents SQL injection attacks
    // (SQL injection = hacker puts SQL code in the email field to break your DB)
    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, address, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, phone, address, role`,
      [name, email, hashedPassword, phone || null, address || null, 'user']
      // WHY default role 'user'? Everyone who self-registers is a regular user.
      // Admin/worker roles are assigned manually in the database by you.
    );

    res.json({
      message: 'User created successfully ✅',
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    // PostgreSQL error code 23505 = unique constraint violation (duplicate email)
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Email already registered ❌' });
    }
    res.status(500).json({ message: 'Signup failed ❌' });
  }
});


// ============================================================
// 🔑 LOGIN ROUTE
//
// FLOW:
// 1. Receive: email, password from frontend
// 2. Find user in PostgreSQL by email
// 3. Compare submitted password with stored bcrypt hash
// 4. If match → generate JWT token with user info baked in
// 5. Return token + user info to frontend
//
// WHY JWT instead of sessions?
// Sessions store login state ON THE SERVER (memory or DB).
// JWT stores it ON THE CLIENT (in the token itself).
// JWT is stateless — your server doesn't need to remember anything.
// Any request with a valid token is trusted. Great for APIs and scaling.
// ============================================================
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required ❌' });
    }

    // Look up user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // WHY not say "email not found"? Security — don't reveal which field is wrong.
      // Telling a hacker "email not found" helps them brute-force valid emails.
      return res.status(400).json({ message: 'Invalid email or password ❌' });
    }

    const user = result.rows[0];

    // Compare the submitted password with the stored hash
    // bcrypt.compare() hashes the input the same way and checks if they match
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password ❌' });
    }

    // ✅ Password matches — generate JWT token
    // We put userId, email, and role INTO the token.
    // WHY role? So protected routes can check role without hitting the DB every time.
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || 'user' },
      SECRET_KEY,
      { expiresIn: '1h' }
      // WHY expire? If a token is stolen, it becomes useless after 1 hour.
      // Without expiry, a stolen token works forever — very dangerous.
    );

    res.json({
      message: 'Login successful ✅',
      token: token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role || 'user'
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed ❌' });
  }
});


// ============================================================
// 🚀 START SERVER
// ============================================================
app.listen(5000, () => {
  console.log('✅ Server started on port 5000');
  console.log('📡 Visit: http://localhost:5000');
});