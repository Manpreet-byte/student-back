require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studentFeedbackDB';

const feedbackSchema = new mongoose.Schema({
  studentName: String,
  rating: Number,
  comment: String,
  timestamp: { type: Date, default: Date.now }
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

async function run(){
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for seeding');
  const data = JSON.parse(fs.readFileSync(__dirname + '/seed.json', 'utf8'));
  const inserted = await Feedback.insertMany(data);
  console.log('Inserted', inserted.length, 'documents');
  await mongoose.disconnect();
}

run().catch(err=>{console.error(err); process.exit(1)});
