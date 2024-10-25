// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, // URL for category image
});

module.exports = mongoose.model('Category', categorySchema);
