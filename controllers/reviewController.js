const Review = require('./../models/Review');
const Product = require('./../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('./../errors');
const { checkPermissions } = require('../utils');

const createReview = async (req, res) => {
  const isValidProduct = await Product.findOne({ _id: req.body.product });
  if (!isValidProduct) {
    throw new CustomError.NotFoundError(
      `No product with id: ${req.body.product}`
    );
  }

  const isAlreadySubmitted = await Review.findOne({
    product: req.body.product,
    user: req.user.userId,
  });

  if (isAlreadySubmitted) {
    throw new CustomError.BadRequestError('Review is already submitted');
  }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);

  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({});

  res.status(StatusCodes.OK).json({ reviews });
};

const getSingleReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id }).populate({
    path: 'product',
    select: 'name price description',
  });
  if (!review) {
    throw new CustomError.NotFoundError(
      `No review with id: ${req.body.product}`
    );
  }

  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id });
  const { rating, title, comment } = req.body;
  if (!review) {
    throw new CustomError.NotFoundError(
      `No review with id: ${req.body.product}`
    );
  }

  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id });
  if (!review) {
    throw new CustomError.NotFoundError(
      `No review with id: ${req.body.product}`
    );
  }

  checkPermissions(req.user, review.user);
  await review.remove();
  res.status(StatusCodes.OK).json({ msg: 'Success! review has been deleted' });
};

const getAllReviewsFromProduct = async (req, res) => {
  const reviews = await Review.find({ product: req.params.id });
  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getAllReviewsFromProduct,
};
