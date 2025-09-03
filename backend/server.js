
// Express server setup for store builder
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Store } = require('./models');

const app = express();
app.use(express.json());
app.use(cors());
// Health check route
app.get('/api/test', (req, res) => {
  res.send('Jed Store Builder API is working!');
});

// Debug route: List all stores
app.get('/api/stores', async (req, res) => {
  try {
    const stores = await Store.find({});
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect to MongoDB
// MongoDB connection using Mongoose
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/online_store', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Create uploads folder if not exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Basic route
app.get('/', (req, res) => {
  res.send('Store Builder API is running');
});

// API to create a store
app.post('/api/stores', upload.array('productImages'), async (req, res) => {
  try {
    const { storeName, currency, contact, deliveryZones, mobileMoney, bankAccount, cashOnDelivery } = req.body;
    // Parse delivery zones
    const zones = deliveryZones ? deliveryZones.split(',').map(z => z.trim()) : [];
    // Parse products
    const products = [];
    if (req.body.productName && Array.isArray(req.body.productName)) {
      req.body.productName.forEach((name, i) => {
        products.push({
          name,
          caption: req.body.productCaption[i],
          price: req.body.productPrice[i],
          image: req.files[i] ? '/uploads/' + req.files[i].filename : '',
        });
      });
    } else if (req.body.productName) {
      products.push({
        name: req.body.productName,
        caption: req.body.productCaption,
        price: req.body.productPrice,
        image: req.files[0] ? '/uploads/' + req.files[0].filename : '',
      });
    }
    // Generate a simple unique URL
    const storeId = Date.now().toString();
    const url = `https://jed-store-backend.onrender.com/store/${storeId}`;
    const store = new Store({
      storeName,
      currency,
      contact,
      deliveryZones: zones,
      payment: { mobileMoney, bankAccount, cashOnDelivery: cashOnDelivery === 'on' },
      products,
      url,
      storeId,
    });
    await store.save();
    console.log('Store created:', storeId);
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve store page by ID
app.get('/store/:id', async (req, res) => {
  try {
    console.log('Store GET request for:', req.params.id);
    const store = await Store.findOne({ storeId: req.params.id });
    if (!store) {
      console.log('Store not found:', req.params.id);
      return res.status(404).send('Store not found');
    }
    // Redirect to the new user-friendly storefront page
    return res.redirect(`/frontend/store-responsive.html?id=${store.storeId}`);
  } catch (err) {
    console.log('Error loading store:', err);
    res.status(500).send('Error loading store');
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
