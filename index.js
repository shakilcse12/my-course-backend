const express = require('express');
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require('mongodb');
const Purchase = require('./Data/Models/Purchase');

const app = express();

// CORS Setup
const allowedOrigins = ['http://localhost:3000', 'https://your-frontend-domain.com'];
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', , 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.options('*', cors(corsOptions));

// MongoDB Connection URI and Client Setup
const uri = "mongodb+srv://course-db-user:C0ty9cBpGwvB1Gb8@my-course.s6sig.mongodb.net/?retryWrites=true&w=majority&appName=My-course";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let userCollection;
let productCollection;
let categoryCollection;
let purchaseCollection;

// Connect to MongoDB and Start Server
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");

    // Initialize the collection after the client is connected
    userCollection = client.db("productShop").collection("users");
    productCollection = client.db("productShop").collection("products");
    categoryCollection = client.db("productShop").collection("categories");
    purchaseCollection = client.db("productShop").collection("purchase");
    console.log("collections initialized!");

    // Set collections for admin routes
    const { router: adminRoutes, setCollections } = require('./routes/admin');
    setCollections(userCollection, categoryCollection, productCollection);
    app.use('/admin', adminRoutes);

    // Start the Express server after MongoDB connection is ready
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

connectToDatabase();

// Get Users Endpoint
app.get("/users", async (req, res) => {
  try {
    if (!userCollection) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    const result = await userCollection.find().toArray();
    console.log('Get result:', result);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error getting users:', err);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Create User Endpoint
app.post("/users", async (req, res) => {
  const user = req.body;
  console.log('User:', user);

  try {
    if (!userCollection) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    const result = await userCollection.insertOne(user);
    console.log('Insert result:', result);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error inserting user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Route to fetch user details
app.post('/user/details', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userCollection.findOne({ email });
    if (user) {
      res.status(200).json(user); // Send back user details
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user details' });
  }
});

// Route to register a user
app.post('/user/register', async (req, res) => {
  const { email, name, phone, address } = req.body;
  try {
    const newUser = {
      email,
      name,
      phone,
      address,
      role: 'user', // Default role as 'user', can be 'admin' later
    };
    await userCollection.insertOne(newUser);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// get all products
app.get('/products', async (req, res) => {
  try {
    if (!userCollection) {
      return res.status(500).json({ error: 'Database not initialized' });
    }
    const products = await productCollection.find().toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get all categories of the products
app.get('/categories', async (req, res) => {
  try {
    const categories = await categoryCollection.find().toArray();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get details of a single product by ID
app.get('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("received product id = ", productId);

    // Check if the ID is a valid ObjectId
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Find product details by ID
    const product = await productCollection.findOne({ _id: new ObjectId(productId) });

    // Check if product exists
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product details:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/buy', async (req, res) => {
  const { userId, courseId, userName, email, phone, address, emergencyContact } = req.body;
   // Basic validation
   if (!userId || !userName) {
    return res.status(400).json({ message: "User ID and User Name are required." });
  }
  try {
    const newPurchase = new Purchase({
      userId,
      courseId,
      userName,
      email,
      phone,
      address,
      emergencyContact
    });

    console.log("purchase = ", newPurchase);

    const response = await newPurchase.save();
    console.log("server response =", response);
    res.status(201).json({ message: 'Purchase successful!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to complete purchase' });
  }
});

app.post("/purchase", async (req, res) => {
  const { userId, courseId, userName, email, phone, address, emergencyContact } = req.body;

  const purchase = req.body;
  console.log('Purchase:', purchase);

  try {
    if (!purchaseCollection) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    const newPurchase = {
      userName: userName,
      email: email,
      phone: phone,
      address: address,
      emergencyContact: emergencyContact,
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId)
  }

    const result = await purchaseCollection.insertOne(newPurchase);
    console.log('Insert result:', result);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error inserting purchase:', err);
    res.status(500).json({ error: 'Failed to create purchase' });
  }
});

// Endpoint to get all purchases for a specific user
app.get('/purchases/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    //console.log("userID = ", userId);
    const purchases = await purchaseCollection.find({ userId: new ObjectId(userId)}).toArray();
    //console.log("purchases = ", purchases);
    res.status(200).json(purchases);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ message: 'Failed to fetch purchases' });
  }
});

