const express = require('express');
const {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require('./../controllers/productController');

const {
  getAllReviewsFromProduct,
} = require('./../controllers/reviewController');

const {
  authenticateUser,
  authorizePermissions,
} = require('./../middleware/authentication');

const router = express.Router();

router
  .route('/')
  .get(getAllProducts)
  .post([authenticateUser, authorizePermissions('admin')], createProduct);

router
  .route('/uploadImage')
  .post([authenticateUser, authorizePermissions('admin')], uploadImage);

router
  .route('/:id')
  .get(getSingleProduct)
  .patch([authenticateUser, authorizePermissions('admin')], updateProduct)
  .delete([authenticateUser, authorizePermissions('admin')], deleteProduct);

router.route('/:id/reviews').get(getAllReviewsFromProduct);

module.exports = router;
