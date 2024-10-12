const express = require('express');
const {
  tourControllers, categoryControllers, subCategoryControllers, reviewControllers, popularToursControllers, relatedToursControllers, bstControllers, discountedTours,
  bookingControllers,
  messageControllers,
  metadataControllers,
  userControllers,
  subscribeControllers,
} = require('../../controllers');

const publicRoute = express.Router();

publicRoute.post('/admin-login', userControllers.loginUserController);
publicRoute.get('/get-tour/:slug', tourControllers.getTour);
publicRoute.get('/get-all-tours', tourControllers.getAllTours);
publicRoute.get('/get-all-categories', categoryControllers.getAllCategories);
publicRoute.get('/get-category/:slug', categoryControllers.getCategory);
publicRoute.get('/get-all-subcategories', subCategoryControllers.getAllSubCategories);
publicRoute.get('/get-subcategories/:slug', subCategoryControllers.getSubCategory);
publicRoute.get('/get-reviews/:tourId', reviewControllers.getReviews);
publicRoute.post('/add-review', reviewControllers.addReview);
// publicRoute.get('/get-reviews-status', reviewControllers.getReviewsByStatus);
publicRoute.get('/get-besttours', bstControllers.getAllBestTours);
publicRoute.get('/get-discountedtours', discountedTours.getAllDiscountTours);
publicRoute.get('/get-popular-tours', popularToursControllers.getAllPopularTours);
publicRoute.get('/get-related-tours', relatedToursControllers.getAllRelatedTours);
publicRoute.post('/add-booking', bookingControllers.addBooking);
publicRoute.post('/send-message', messageControllers.addMessage);
publicRoute.get('/get-metadata/:entityId', metadataControllers.getMetadata);;
publicRoute.post('/add-subscriber', subscribeControllers.addSubscriber);;

// publicRoute.get('/get-all-bookings', relatedToursControllers.getAllRelatedTours);
// publicRoute.get('/update-bookings', relatedToursControllers.getAllRelatedTours);
// publicRoute.get('/get-booking', relatedToursControllers.getAllRelatedTours);

// publicRoute.get('/category/:categoryId', categoryControllers.getCategoryWithTours);
// tourRoute.get('/get-all-tours', tourControllers.getAllTours);
// publicRoute.get('/get-besttour/:bestTourId', bstControllers.getBestTour);
// publicRoute.get('/get-discountedtour/:discountedTourId', discountedTours.getDiscountedTour);

module.exports = publicRoute;
