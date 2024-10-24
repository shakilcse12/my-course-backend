const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./Data/Models/User');  // Assuming User.js is in the same directory

// Connect to MongoDB
mongoose.connect('mongodb+srv://course-db-user:C0ty9cBpGwvB1Gb8@my-course.s6sig.mongodb.net/productShop');

const createAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });

    // Check if an admin user already exists
    if (existingAdmin) {
      //console.log('Admin user already exists.');
      //return;
    }

    const password = 'shakil'; // Replace with your desired admin password
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = new User({
      name: 'Tahmidul Shakil',
      email: 'lorenssss@gmail.com', // Replace with your desired admin email
      password: hashedPassword,
      role: 'user',
      phoneNumber: '01969462701',
      address: 'Admin Address',
    });

    await adminUser.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();  // Close the connection when done
  }
};

createAdminUser();
