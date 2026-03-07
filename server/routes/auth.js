const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// In-memory user store (use database in production)
const users = new Map(); // Key: username, Value: user object
const usernames = new Set(); // Track all usernames for uniqueness
const userActivities = new Map(); // Key: userId, Value: activity data

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      });
    }

    if (username.length < 3) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username must be at least 3 characters' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Check if username already exists
    if (usernames.has(username.toLowerCase())) {
      return res.status(409).json({ 
        success: false, 
        error: 'Username already taken' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    // Store user
    users.set(username.toLowerCase(), user);
    usernames.add(username.toLowerCase());

    console.log(`✅ User registered: ${username}`);

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to register user' 
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      });
    }

    // Find user
    const user = users.get(username.toLowerCase());
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log(`✅ User logged in: ${username}`);

    res.json({ 
      success: true, 
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to login' 
    });
  }
});

// POST /api/auth/check-username
router.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username is required' 
      });
    }

    const exists = usernames.has(username.toLowerCase());

    res.json({ 
      success: true, 
      available: !exists
    });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check username' 
    });
  }
});

// PUT /api/user/activity - Save user activity data
router.put('/activity', verifyToken, async (req, res) => {
  try {
    const { activity } = req.body;
    const userId = req.userId;

    if (!activity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Activity data is required' 
      });
    }

    // Save activity data
    userActivities.set(userId, {
      ...activity,
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Activity saved for user: ${userId}`);

    res.json({ 
      success: true, 
      message: 'Activity saved successfully'
    });
  } catch (error) {
    console.error('Error saving activity:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save activity' 
    });
  }
});

// GET /api/user/activity - Retrieve user activity data
router.get('/activity', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const activity = userActivities.get(userId);

    if (!activity) {
      return res.json({ 
        success: true, 
        activity: null,
        message: 'No activity data found'
      });
    }

    res.json({ 
      success: true, 
      activity
    });
  } catch (error) {
    console.error('Error retrieving activity:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve activity' 
    });
  }
});

module.exports = router;
