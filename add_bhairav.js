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

const bhairavStudents = [
  'Aliya Parveen',
  'Amrita',
  'Archana Thakur',
  'Bhawni Jha',
  'Gurpreet Kaur',
  'Harmanjot Sharma',
  'Iknoor Vran',
  'Jannatveer Kaur',
  'Kritika Thakur',
  'Laxmi Prajapati',
  'Lucky',
  'Manika Kutiyal',
  'Manpreet Tiwana',
  'Parika Sandhu',
  'Payal Sharma',
  'Priya Heer',
  'Rani',
  'Ravinder Kaur',
  'Ritika Bhatia',
  'Sakshi Singh',
  'Sneha Thakur',
  'Suhana',
  'Nagma Siddiqui'
];

async function addStudents() {
  try {
    for (const studentName of bhairavStudents) {
      const newFeedback = new Feedback({
        studentName: studentName,
        house: 'Bhairav',
        rating: 5,
        comment: 'Student entry - Bhairav House'
      });
      await newFeedback.save();
      console.log(`Added: ${studentName}`);
    }
    console.log('\nAll Bhairav students added successfully!');
    console.log(`Total students added: ${bhairavStudents.length}`);
    process.exit(0);
  } catch (err) {
    console.error('Error adding students:', err);
    process.exit(1);
  }
}

addStudents();
