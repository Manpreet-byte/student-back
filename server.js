// server.js

// 1. Import Dependencies
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config(); 

const app = express();

// 2. Middleware
// Enable CORS to allow your React frontend to connect
app.use(cors()); 
// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

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


// 5. API Routes

// API URL: http://localhost:3000/api/feedback

// A. POST /api/feedback (Submitting Feedback)
// POST feedback
app.post('/api/feedback', async (req, res) => {
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
app.put('/api/feedback/:id', async (req, res) => {
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
app.delete('/api/feedback/:id', async (req, res) => {
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
app.post('/api/improvements', async (req, res) => {
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
app.put('/api/improvements/:id', async (req, res) => {
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
app.delete('/api/improvements/:id', async (req, res) => {
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