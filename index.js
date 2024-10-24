const express = require('express');
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();

// CORS Setup
const allowedOrigins = ['http://localhost:3000', 'https://your-frontend-domain.com'];
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

let userCollection;  // Define userCollection outside

// Connect to MongoDB and Start Server
async function connectToDatabase() {
  try {
    await client.connect(); // Ensure the client is connected
    console.log("Successfully connected to MongoDB!");

    // Initialize the collection after the client is connected
    userCollection = client.db("productShop").collection("users");
    console.log("User collection initialized!");

    // Start the Express server after MongoDB connection is ready
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

connectToDatabase(); // Call the function to connect to the database

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
