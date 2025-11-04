// server.js

// 1. Import Dependencies
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./passport-config');
const { isAuthenticated } = require('./middleware/auth');

// Load environment variables from .env file
dotenv.config(); 

const app = express();

// 2. Middleware
// Enable CORS to allow your React frontend to connect with credentials
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
})); 
// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// 3. Database Connection
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000; // Use 3000 as per your .env

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));


// 4. Mongoose Schema and Model
// This defines the structure of documents in your 'feedbackDB' database
const feedbackSchema = new mongoose.Schema({
  studentName: { 
    type: String, 
    required: true,
    trim: true,
    default: 'Anonymous'
  },
  house: {
    type: String,
    required: true,
    enum: ['Bhairav', 'Bhageshree', 'Megh']
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    default: '' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Improvements Schema and Model
const improvementSchema = new mongoose.Schema({
  problem: { 
    type: String, 
    required: true,
    trim: true
  },
  solution: {
    type: String,
    required: true,
    trim: true
  },
  submittedBy: { 
    type: String, 
    required: true,
    trim: true
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const Improvement = mongoose.model('Improvement', improvementSchema);


// 5. Authentication Routes

// Google OAuth login
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:5173/login',
    successRedirect: 'http://localhost:5173'
  })
);

// Check authentication status
app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        picture: req.user.picture
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});


// 6. API Routes (Protected)

// API URL: http://localhost:3000/api/feedback

// A. POST /api/feedback (Submitting Feedback)
// POST feedback
app.post('/api/feedback', isAuthenticated, async (req, res) => {
	const { studentName, house, rating, comment } = req.body;
	const newFeedback = new Feedback({ studentName, house, rating, comment });
	try {
		await newFeedback.save();
		res.status(201).json(newFeedback);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// PUT (update) feedback
app.put('/api/feedback/:id', isAuthenticated, async (req, res) => {
	const { id } = req.params;
	const { studentName, house, rating, comment } = req.body;
	try {
		const updated = await Feedback.findByIdAndUpdate(
			id,
			{ studentName, house, rating, comment },
			{ new: true, runValidators: true }
		);
		if (!updated) {
			return res.status(404).json({ error: 'Feedback not found' });
		}
		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// DELETE feedback
app.delete('/api/feedback/:id', isAuthenticated, async (req, res) => {
	const { id } = req.params;
	try {
		const deleted = await Feedback.findByIdAndDelete(id);
		if (!deleted) {
			return res.status(404).json({ error: 'Feedback not found' });
		}
		res.json({ message: 'Feedback deleted successfully', deleted });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});


// B. GET /api/feedback (Displaying Feedback)
app.get('/api/feedback', async (req, res) => {
  try {
    // Fetch all feedback, sorted by newest first (-1 means descending)
    const allFeedback = await Feedback.find().sort({ timestamp: -1 });
    
    // Send the array of feedback objects back to the frontend
    res.status(200).json(allFeedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to retrieve feedback from the database.' });
  }
});


// ============================================
// IMPROVEMENTS API ROUTES
// ============================================

// GET all improvements
app.get('/api/improvements', async (req, res) => {
  try {
    const allImprovements = await Improvement.find().sort({ timestamp: -1 });
    res.status(200).json(allImprovements);
  } catch (error) {
    console.error('Error fetching improvements:', error);
    res.status(500).json({ error: 'Failed to retrieve improvements from the database.' });
  }
});

// POST new improvement
app.post('/api/improvements', isAuthenticated, async (req, res) => {
  const { problem, solution, submittedBy } = req.body;
  const newImprovement = new Improvement({ problem, solution, submittedBy });
  try {
    await newImprovement.save();
    res.status(201).json(newImprovement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT (update) improvement
app.put('/api/improvements/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { problem, solution, submittedBy } = req.body;
  try {
    const updated = await Improvement.findByIdAndUpdate(
      id,
      { problem, solution, submittedBy },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Improvement not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE improvement
app.delete('/api/improvements/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Improvement.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Improvement not found' });
    }
    res.json({ message: 'Improvement deleted successfully', deleted });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// 6. Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}/api/feedback`);
});