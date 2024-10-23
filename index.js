const express = require('express');
const cors = require("cors");
const app = express();
//const products = require('./products.json');


const allowedOrigins = ['http://localhost:3000', 'https://react-product-frontend.web.app'];

const corsOptions = {
  origin: 'https://react-product-frontend.web.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// course-db-user
//db user pass C0ty9cBpGwvB1Gb8


app.use(cors(corsOptions));
app.use(express.json());


app.options('*', cors(corsOptions));


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://course-db-user:C0ty9cBpGwvB1Gb8@my-course.s6sig.mongodb.net/?retryWrites=true&w=majority&appName=My-course";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


app.get('/products', (req, res) => {
  return res.status(404).send("this are the products");
});

app.get('/products/:id', (req, res) => {
  //const product = products.find(p => p._id === req.params.id);
  return res.status(404).send('Product not found');
  //res.json(product);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
