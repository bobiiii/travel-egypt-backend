const mongoose = require('mongoose');

const { Schema } = mongoose;

// const importantInformationSchema = new mongoose.Schema({
//   heading: { type: String },
//   point: { type: String},
// }, { _id: false });

const includesSchema = new mongoose.Schema({
  _id: { type: Schema.ObjectId, auto: true},
  point: { type: String },
});

const highlightsSchema = new mongoose.Schema({
  _id: { type: Schema.ObjectId, auto: true},
    point: { type: String },
} );

const importantInformationSchema = new mongoose.Schema({
  _id: { type: Schema.ObjectId, auto: true},
  point: { type: String },
});


const tourSchema = new mongoose.Schema({

  title: { type: String }, // add
  slug: { type: String, required: true, unique: true }, // add
  duration: { type: String },
  description: { type: String },
  fullDescription: { type: String },
  strikePrice: { type: Number },
  priceAdult: { type: Number },
  priceChild: { type: Number },
  languages: { type: [String] },
  tag: { type: String }, // add

  // cancellationPolicy: { type: String },
  cardImage: { type: String },
  tourImages: { type: [String] },
  // tourImagesFront: { type: [String] },
  highlights: { type: [highlightsSchema] },
  includes: { type: [includesSchema] },
  heading: { type: String },
  importantInformation: { type: [importantInformationSchema] },
  subCategoryId: { type: Schema.Types.ObjectId, ref: 'SubCategory' },
  reviewsId: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
});

const bestTourSchema = new mongoose.Schema(
  {
    tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
    addedDate: { type: Date, default: Date.now },
  },
);

const discountedTourSchema = new mongoose.Schema({
  tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
  addedDate: { type: Date, default: Date.now },
});

// Adding Virtual Population for Reviews
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tourId',
});

// Ensure virtual fields are included in JSON output
tourSchema.set('toJSON', { virtuals: true });
tourSchema.set('toObject', { virtuals: true });

// 5 cat create krni h
const categorySchema = new mongoose.Schema({
  
  slug: { type: String, required: true, unique: true },
  categoryName: { type: String }, // add
  categoryImage: { type: String }, // add
  categoryMobImage: { type: String },
  bannerText: {type: String},
  bannerSlogan: {type: String},
  subCategoryId: [{ type: Schema.Types.ObjectId, ref: 'SubCategory' }], // add multiple subcategory obj ids
});

const blogSchema = new mongoose.Schema({
  title: { type: String }, 
  cardImage: { type: String }, 
  para: { type: String }
});

// total 15 sub cat create krni h
const subCategorySchema = new mongoose.Schema({
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' }, // add single category obj ids
  tourId: [{ type: Schema.Types.ObjectId, ref: 'Tour' }], // add multiple tour obj ids
  slug: { type: String, required: true, unique: true }, // add
  subCategoryName: { type: String }, // add
  subCategoryImage: { type: String },
});

const popularTourSchema = new mongoose.Schema({
  tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
  addedDate: { type: Date, default: Date.now },
});

const reviewSchema = new mongoose.Schema({
  tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
  name: { type: String, required: true },
  imageURL: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  reviewDate: { type: Date, default: Date.now },
  response: { type: String },
  readMoreUrl: { type: String },
});

const approvedReviewSchema = new mongoose.Schema({
  reviewId: { type: Schema.Types.ObjectId, ref: 'Review', required: true },
  addedDate: { type: Date, default: Date.now },
});

const bookingSchema = new mongoose.Schema({
  tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
  participants: {
    adults: { type: Number },
    children: { type: Number },
  },
  totalPrice: { type: Number },
  date: { type: Date },
  language: { type: String },
  name: { type: String },
  phoneNumber: { type: String },
  email: { type: String },

  status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'cancelled'] },
  bookingDate: { type: Date, default: Date.now },
});


const BookingModel = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
const TourModel =  mongoose.model('Tour', tourSchema);
const PopularTourModel = mongoose.models.PopularTour || mongoose.model('PopularTour', popularTourSchema);
const CategoryModel = mongoose.model('Category', categorySchema);
const SubCategoryModel =  mongoose.model('SubCategory', subCategorySchema);
const ReviewModel = mongoose.models.Review || mongoose.model('Review', reviewSchema);
const BestTourModel = mongoose.models.BestTours || mongoose.model('BestTours', bestTourSchema);
const DiscountedTourModel = mongoose.models.BestTours || mongoose.model('DiscountedTours', discountedTourSchema);
const BlogModel = mongoose.models.BlogModel || mongoose.model('Blogs', blogSchema);
const ApprovedReviewModel = mongoose.models.ApprovedSchemaModel || mongoose.model('ApprovedReviews', approvedReviewSchema);

module.exports = {
  TourModel, CategoryModel, SubCategoryModel, ReviewModel, BookingModel, PopularTourModel, BestTourModel, DiscountedTourModel, ApprovedReviewModel, BlogModel,
};
