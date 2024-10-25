// routes/admin.js
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

// Access the collections initialized in index.js
let userCollection; 
let categoryCollection; 
let productCollection; 

// Set collections through a function, to be called in index.js
const setCollections = (users, categories, products) => {
  userCollection = users;
  categoryCollection = categories;
  productCollection = products;
};

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await userCollection.find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user details
router.patch('/user/:id', async (req, res) => {
  try {
    const { name, phoneNumber, address, profilePicture, role } = req.body;
    const user = await userCollection.findOne({ _id: new ObjectId(req.params.id) });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const updatedUser = {
      name: name ?? user.name,
      phoneNumber: phoneNumber ?? user.phoneNumber,
      address: address ?? user.address,
      profilePicture: profilePicture ?? user.profilePicture,
      role: role ?? user.role,
    };

    await userCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updatedUser });
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle user role
router.patch('/users/:id/role', async (req, res) => {
    try {
      const userId = new ObjectId(req.params.id);
      const user = await userCollection.findOne({ _id: userId });
  
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      const newRole = user.role === 'user' ? 'admin' : 'user';
  
      // Update the user's role
      await userCollection.updateOne({ _id: userId }, { $set: { role: newRole } });
  
      // Retrieve and return the updated user
      const updatedUser = await userCollection.findOne({ _id: userId });
      res.json(updatedUser);
      
    } catch (error) {
      console.error('Error toggling user role:', error);
      res.status(500).json({ message: 'Failed to toggle user role' });
    }
  });

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await categoryCollection.find().toArray();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new category
router.post('/categories', async (req, res) => {
  try {
    const category = await categoryCollection.insertOne(req.body);
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await productCollection.find().toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a product
router.post('/products', async (req, res) => {
  try {
    const product = await productCollection.insertOne(req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit a product
router.put('/products/:id', async (req, res) => {
  try {
    const product = await productCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await productCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a product
router.delete('/products/:id', async (req, res) => {
  try {
    const result = await productCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {router, setCollections};
