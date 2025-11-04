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

const meghStudents = [
  'Jasleen',
  'Simran',
  'Navjot',
  'Nimrit',
  'Deepasha',
  'Shruti',
  'Sneha',
  'Noor Setia',
  'Sunaina',
  'Riya',
  'Jashanpreet',
  'Ritika',
  'Aashika',
  'Payal Dhiman',
  'Priya Jha',
  'Babli',
  'Kareena',
  'Manisha',
  'Arshdeep'
];

async function addStudents() {
  try {
    for (const studentName of meghStudents) {
      const newFeedback = new Feedback({
        studentName: studentName,
        house: 'Megh',
        rating: 5,
        comment: 'Student entry - Megh House'
      });
      await newFeedback.save();
      console.log(`Added: ${studentName}`);
    }
    console.log('\nAll students added successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error adding students:', err);
    process.exit(1);
  }
}

addStudents();
