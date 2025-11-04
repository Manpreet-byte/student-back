const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

const feedbackSchema = new mongoose.Schema({
  studentName: { 
    type: String, 
    required: true,
    trim: true
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

const studentsToRemove = [
  'Nagma Siddiqui',
  'Jannatveer',
  'Ravinder'
];

async function removeStudents() {
  try {
    for (const studentName of studentsToRemove) {
      // Find and delete all feedback for this student in Bhairav house
      const result = await Feedback.deleteMany({ 
        studentName: { $regex: new RegExp('^' + studentName, 'i') },
        house: 'Bhairav'
      });
      console.log(`Removed ${result.deletedCount} feedback(s) for: ${studentName}`);
    }
    console.log('\nAll specified students removed from Bhairav house!');
    process.exit(0);
  } catch (err) {
    console.error('Error removing students:', err);
    process.exit(1);
  }
}

removeStudents();
