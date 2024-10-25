const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./Data/Models/User');  // Assuming User.js is in the same directory
const Product = require('./Data/Models/Product');
const Category = require('./Data/Models/Category');

// Connect to MongoDB
mongoose.connect('mongodb+srv://course-db-user:C0ty9cBpGwvB1Gb8@my-course.s6sig.mongodb.net/productShop');

// Seed your database with some categories and products

async function initializeDatabase() {
  const sampleCategory = new Category({ name: 'Programming', image: 'https://live.staticflickr.com/65535/52413593240_e00326e727_o.png' });
  await sampleCategory.save();

  const sampleProduct = new Product({
    name: 'JavaScript Basics',
    image: 'https://live.staticflickr.com/65535/52413593240_e00326e727_o.png',
    rating: 4.5,
    price: 50,
    category: sampleCategory._id,
  });
  await sampleProduct.save();
}

initializeDatabase()
  .then(() => {console.log("Database initialized");
    mongoose.connection.close();
  })
  .catch((error) => console.error("Error initializing database:", error));
