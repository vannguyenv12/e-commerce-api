const mongoose = require('mongoose');

const singleOrderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    default: 1,
  },
  product: {
    type: mongoose.Types.ObjectId,
    ref: 'Product',
  },
});

const orderSchema = new mongoose.Schema({
  tax: {
    type: Number,
    required: true,
  },
  shippingFee: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  items: [singleOrderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'failed', 'paid', 'deliverd', 'canceled'],
    default: 'pending',
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  clientSecret: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
  },
});

module.exports = mongoose.model('Order', orderSchema);
