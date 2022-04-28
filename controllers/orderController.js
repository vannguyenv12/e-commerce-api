const Order = require('./../models/Order');
const Product = require('./../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('./../errors');
const { checkPermissions } = require('./../utils');

const fakeStripeApi = async ({ amount, currency }) => {
  const client_secret = 'vannguyen-deptrai';
  return { client_secret, amount };
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};
const getSingleOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id: ${req.params.id}`);
  }

  checkPermissions(req.user, order.user);

  res.status(StatusCodes.OK).json({ order });
};
const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.findOne({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};

const createOrder = async (req, res) => {
  const { items, tax, shippingFee } = req.body;

  if (!items || items.length < 1) {
    throw new CustomError.BadRequestError('no cart items');
  }

  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      'please provide tax and shipping fee'
    );
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(`No product with id ${item.product}`);
    }

    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    orderItems = [...orderItems, singleOrderItem];
    subtotal = subtotal + item.amount * price;
  }
  let total = tax + shippingFee + subtotal;
  const paymentIntent = await fakeStripeApi({
    amount: total,
    currency: 'usd',
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user._id,
  });

  res.status(StatusCodes.OK).json({ order });
};
const updateOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });
  const { paymentIntent } = req.body;
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id: ${req.params.id}`);
  }

  order.paymentIntent = paymentIntent;
  order.status = 'paid';
  await order.save();

  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
