const Product = require('./../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('./../errors');
const path = require('path');
const { dirname } = require('path');

const createProduct = async (req, res, next) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);

  res.status(StatusCodes.CREATED).json({ product });
};
const getAllProducts = async (req, res, next) => {
  const products = await Product.find({});

  res.status(StatusCodes.OK).json({ count: products.length, products });
};

const getSingleProduct = async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id }).populate(
    'reviews'
  );
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${req.params.id}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res, next) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${req.params.id}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id });
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${req.params.id}`);
  }

  await product.remove();
  res
    .status(StatusCodes.OK)
    .json({ msg: 'Successful! Product has been deleted' });
};

const uploadImage = async (req, res, next) => {
  // console.log(req.files);
  if (!req.files) {
    throw new CustomError.BadRequestError('No file upload');
  }

  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please upload image');
  }

  const maxSize = 1024 * 1024;

  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError('Please upload image smaller 1MB');
  }

  const imagePath = path.resolve(
    `${__dirname}/../public/uploads/${productImage.name}`
  );

  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
