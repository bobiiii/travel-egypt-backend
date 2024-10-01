const mongoose = require('mongoose');

const { Schema } = mongoose;

// const importantInformationSchema = new mongoose.Schema({
//   heading: { type: String },
//   point: { type: String},
// }, { _id: false });

const includesSchema = new mongoose.Schema({
  _id: { type: Schema.ObjectId, auto: true },
  point: { type: String, required: true , trim: true},
  type: {
    type: String,
    enum: ["included", "excluded"],
    required: true

  },

});

const highlightsSchema = new mongoose.Schema({
  _id: { type: Schema.ObjectId, auto: true },
  point: { type: String, required: true , trim: true},
});

const importantInformationSchema = new mongoose.Schema({
  _id: { type: Schema.ObjectId, auto: true },
  point: { type: String, required: true, trim: true },
});


const tourSchema = new mongoose.Schema({

  title: { type: String, true: true, required: true, }, // add
  slug: { type: String, required: true, unique: true }, // add
  duration: { type: String, required: true,  trim: true },
  description: { type: String, required: true,  trim: true },
  fullDescription: { type: String, required: true, trim: true },
  strikePrice: { type: Number },
  priceAdult: { type: Number, required: true, },
  priceChild: { type: Number, required: true, },
  priceInfant: { type: Number, required: true, },

  childPriceAfterDiscount: {
    type: Number, default: 0, required: true,
  },
  adultPriceAfterDiscount: {
    type: Number, default: 0, required: true,
  },
  discountAmount: {
    type: Number, default: 0, required: true,
  },


  languages: { type: [String], required: true },
  tag: { type: String, trim: true, required: true, }, // add

  // cancellationPolicy: { type: String },
  cardImage: { type: String, required: true },
  tourImages: { type: [String], required: true },
  // tourImagesFront: { type: [String] },
  highlights: { type: [highlightsSchema] },
  includes: { type: [includesSchema] },
  heading: { type: String, required: true,  trim: true },
  importantInformation: { type: [importantInformationSchema] },
  subCategoryId: { type: Schema.Types.ObjectId, ref: 'SubCategory', required: true },
  reviewsId: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
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

  slug: { type: String, required: true, unique: true, trim: true },
  categoryName: { type: String, required: true, trim: true }, // add
  categoryImage: { type: String, required: true, }, // add
  categoryMobImage: { type: String, required: true, },
  bannerText: { type: String, required: true, trim: true },
  bannerSlogan: { type: String, required: true, trim: true },
  subCategoryId: [{ type: Schema.Types.ObjectId, ref: 'SubCategory' }], // add multiple subcategory obj ids
});



const subCategorySchema = new mongoose.Schema({
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, }, // add single category obj ids
  tourId: [{ type: Schema.Types.ObjectId, ref: 'Tour' }], // add multiple tour obj ids
  slug: { type: String, required: true, unique: true }, // add
  subCategoryName: { type: String, required: true, trim: true }, // add
  subCategoryImage: { type: String, required: true, },
  subCategoryTitle: { type: String, required: true, trim: true },
  subCategoryText: { type: String, required: true, trim: true },
  subCategoryHeroImage: { type: String, required: true, },
  subCaategoryMobHeroImage: { type: String, required: true, },

});

const popularTourSchema = new mongoose.Schema({
  tourId: [{ type: Schema.Types.ObjectId, ref: 'Tour', required: true }],
});

const bestTourSchema = new mongoose.Schema(
  {
    tourId: [{ type: Schema.Types.ObjectId, ref: 'Tour', required: true }],

  },
);

const discountedTourSchema = new mongoose.Schema({
  tourId: [{ type: Schema.Types.ObjectId, ref: 'Tour', required: true }],
});

const reviewSchema = new mongoose.Schema({
  tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
  name: { type: String, required: true },
  imageId: { type: [String], required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  reviewDate: { type: Date, default: Date.now },
  // response: { type: String },
  // readMoreUrl: { type: String },
});

const approvedReviewSchema = new mongoose.Schema({
  reviewId: { type: Schema.Types.ObjectId, ref: 'Review', required: true },
  addedDate: { type: Date, default: Date.now },
});

const blogSchema = new mongoose.Schema({
  title: { type: String },
  cardImage: { type: String },
  para: { type: String }
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


const BookingModel = mongoose.model('Booking', bookingSchema);
const TourModel = mongoose.model('Tour', tourSchema);
const PopularTourModel = mongoose.model('PopularTour', popularTourSchema);
const CategoryModel = mongoose.model('Category', categorySchema);
const SubCategoryModel = mongoose.model('SubCategory', subCategorySchema);
const ReviewModel = mongoose.model('Review', reviewSchema);
const BestTourModel = mongoose.model('BestTours', bestTourSchema);
const DiscountedTourModel = mongoose.model('DiscountedTours', discountedTourSchema);
const BlogModel = mongoose.model('Blogs', blogSchema);
const ApprovedReviewModel = mongoose.model('ApprovedReviews', approvedReviewSchema);

module.exports = {
  TourModel, CategoryModel, SubCategoryModel, ReviewModel, BookingModel, PopularTourModel, BestTourModel, DiscountedTourModel, ApprovedReviewModel, BlogModel,
};
