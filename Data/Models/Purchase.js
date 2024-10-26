// Schema for purchases collection
const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  purchaseDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', purchaseSchema);
