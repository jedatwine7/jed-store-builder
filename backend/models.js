// MongoDB models for Store and Product
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  caption: String,
  price: Number,
  image: String,
});

const StoreSchema = new mongoose.Schema({
  storeName: String,
  currency: String,
  contact: String,
  deliveryZones: [String],
  payment: {
    mobileMoney: String,
    bankAccount: String,
    cashOnDelivery: Boolean,
  },
  products: [ProductSchema],
  url: String,
  storeId: String,
});

module.exports = {
  Store: mongoose.model('Store', StoreSchema),
  Product: mongoose.model('Product', ProductSchema),
};
