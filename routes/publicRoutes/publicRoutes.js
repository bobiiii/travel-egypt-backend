const express = require('express');
const {
  tourControllers, categoryControllers, subCategoryControllers, reviewControllers, popularToursControllers, relatedToursControllers, bstControllers, discountedTours,
  bookingControllers,
  metadataControllers,
} = require('../../controllers');

const publicRoute = express.Router();

publicRoute.get('/get-tour/:slug', tourControllers.getTour);
publicRoute.get('/get-all-tours', tourControllers.getAllTours);
publicRoute.get('/get-all-categories', categoryControllers.getAllCategories);
publicRoute.get('/get-category/:slug', categoryControllers.getCategory);
publicRoute.get('/get-all-subcategories', subCategoryControllers.getAllSubCategories);
publicRoute.get('/get-subcategories/:slug', subCategoryControllers.getSubCategory);
publicRoute.get('/get-reviews', reviewControllers.getReviews);
publicRoute.get('/get-approved-reviews', reviewControllers.getApprovedReviews);
publicRoute.get('/get-besttours', bstControllers.getAllBestTours);
publicRoute.get('/get-discountedtours', discountedTours.getAllDiscountTours);
publicRoute.get('/get-popular-tours', popularToursControllers.getAllPopularTours);
publicRoute.get('/get-related-tours', relatedToursControllers.getAllRelatedTours);
publicRoute.post('/add-booking', bookingControllers.addBooking);
publicRoute.get('/get-metadata/:metadataId', metadataControllers.getMetadata);;

// publicRoute.get('/get-all-bookings', relatedToursControllers.getAllRelatedTours);
// publicRoute.get('/update-bookings', relatedToursControllers.getAllRelatedTours);
// publicRoute.get('/get-booking', relatedToursControllers.getAllRelatedTours);

// publicRoute.get('/category/:categoryId', categoryControllers.getCategoryWithTours);
// tourRoute.get('/get-all-tours', tourControllers.getAllTours);
// publicRoute.get('/get-besttour/:bestTourId', bstControllers.getBestTour);
// publicRoute.get('/get-discountedtour/:discountedTourId', discountedTours.getDiscountedTour);

module.exports = publicRoute;
