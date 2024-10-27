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

// user update profile info from user dashboard
app.put('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const { userName, phone, address, profilePicture } = req.body;

  try {
    const result = await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { userName, phone, address, profilePicture } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Profile updated successfully' });
    } else {
      res.status(400).json({ message: 'No changes made' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});


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

app.post('/products/details', async (req, res) => {
  try {
    const { productId, userId } = req.body;
    console.log("Received request with Product ID:", productId, "and User ID:", userId);

    // Validate Product and User IDs
    if (!ObjectId.isValid(productId) || !ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid product or user ID' });
    }

    // Fetch Product Details
    const product = await productCollection.findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check Purchase Status
    const purchase = await purchaseCollection.findOne({ courseId: new ObjectId(productId), userId: new ObjectId(userId) });
    const isBought = !!purchase; // true if purchase exists, false otherwise

    res.status(200).json({ product, isBought });
  } catch (error) {
    console.error('Error in /products/details API:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
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

    const purchases = await purchaseCollection.aggregate([
      {
        $match: { userId: new ObjectId(userId) },
      },
      {
        $lookup: {
          from: 'products', // The name of the product collection
          localField: 'courseId', // Field in purchaseCollection to match with product _id
          foreignField: '_id', // Field in productCollection
          as: 'productDetails', // Alias for the joined data
        },
      },
      {
        $unwind: '$productDetails', // Deconstructs the array from $lookup
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          purchaseDate: 1,
          userName: 1,
          email: 1,
          productId: '$productDetails._id',
          productName: '$productDetails.name',
          productPrice: '$productDetails.price',
          productImage: '$productDetails.image',
          productRating: '$productDetails.rating',
          productCategory: '$productDetails.category',
        },
      },
    ]).toArray();

    res.status(200).json(purchases);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ message: 'Failed to fetch purchases' });
  }
});


