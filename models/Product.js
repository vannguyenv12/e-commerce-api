const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'please provide name for product'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'please provide price for product'],
    },
    description: {
      type: String,
      required: [true, 'please provide description for product'],
      maxlength: [1000, 'description less than 1000 character'],
    },
    image: {
      type: String,
      required: [true, 'please provide image for product'],
      default: '/uploads/default.jpg',
    },
    category: {
      type: String,
      required: [true, 'please provide category for product'],
      enum: ['office', 'kitchen', 'bedroom'],
    },
    company: {
      type: String,
      required: [true, 'please provide company for product'],
      enum: {
        values: ['ikea', 'liddy', 'marcos'],
        message: '{VALUE} is not supported',
      },
    },
    colors: {
      type: [String],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      default: 15,
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

productSchema.pre('remove', async function (next) {
  await this.model('Review').deleteMany({ product: this._id });
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
