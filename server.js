const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const config = require('./config'); // Store sensitive info in a separate config file

const app = express();

// Middleware
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection(config.database);

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// User Registration
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  // const username = req.body.username
  // const password = req.body.password
  // const email = req.body.email
  
  console.log(username);
  // Validation and error handling should be more robust in production
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Username, password, and email are required' });
  }

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert the user into the database
  db.query(
    'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
    [username, hashedPassword, email],
    (err) => {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    }
  );
});

// User Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validation and error handling should be more robust in production
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Check if the user exists in the database
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const token = jwt.sign({ username }, config.jwtSecret, { expiresIn: '1h' });
      return res.json({ token });
    } else {
      return res.status(401).json({ message: 'Authentication failed' });
    }
  });
});

// Create Match (Admin only, requires JWT)
app.post('/matches', authenticateToken, (req, res) => {
  const { teams, date, location } = req.body;

  // Validation and error handling should be more robust in production
  if (!teams || !date || !location) {
    return res.status(400).json({ message: 'Teams, date, and location are required' });
  }

  // Insert the match into the database
  db.query(
    'INSERT INTO matches (teams, date, location) VALUES (?, ?, ?)',
    [teams, date, location],
    (err) => {
      if (err) {
        console.error('Error creating match:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.status(201).json({ message: 'Match created successfully' });
    }
  );
});

// Get Match Schedules (Guests)
app.get('/matches', (req, res) => {
  db.query('SELECT * FROM matches', (err, results) => {
    if (err) {
      console.error('Error fetching matches:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.json({ matches: results });
  });
});

// Get Match Details (Guests)
app.get('/matches/:matchId', (req, res) => {
  const matchId = req.params.matchId;
  db.query('SELECT * FROM matches WHERE id = ?', [matchId], (err, results) => {
    if (err) {
      console.error('Error fetching match:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.json({ match: results[0] });
  });
});

// Add Player to Team (Admin only, requires JWT)
app.post('/teams/:teamId/players', authenticateToken, (req, res) => {
  const teamId = req.params.teamId;
  const { name, position } = req.body;

  // Validation and error handling should be more robust in production
  if (!name || !position) {
    return res.status(400).json({ message: 'Name and position are required' });
  }

  // Check if the team exists
  db.query('SELECT * FROM teams WHERE id = ?', [teamId], (err, results) => {
    if (err) {
      console.error('Error fetching team:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Insert the player into the database and associate with the team
    db.query(
      'INSERT INTO players (name, position, team_id) VALUES (?, ?, ?)',
      [name, position, teamId],
      (err) => {
        if (err) {
          console.error('Error adding player to team:', err);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.status(201).json({ message: 'Player added to team successfully' });
      }
    );
  });
});

// Get Player Statistics (Admins can add, Guests can view)
app.get('/players/:playerId/stats', (req, res) => {
  const playerId = req.params.playerId;
  db.query('SELECT * FROM player_stats WHERE player_id = ?', [playerId], (err, results) => {
    if (err) {
      console.error('Error fetching player statistics:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Player statistics not found' });
    }
    res.json({ playerStats: results });
  });
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Authorization token is missing' });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user;
    next();
  });
}

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});