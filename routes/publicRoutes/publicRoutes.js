const express = require('express');
const {
  tourControllers, categoryControllers, subCategoryControllers, reviewControllers, popularToursControllers, bstControllers, discountedTours,
} = require('../../controllers');

const publicRoute = express.Router();

publicRoute.get('/get-tour/:slug', tourControllers.getTour);
publicRoute.get('/get-all-tours', tourControllers.getAllTours);
publicRoute.get('/get-all-categories', categoryControllers.getAllCategories);
publicRoute.get('/get-category/:slug', categoryControllers.getCategory);
publicRoute.get('/get-all-subcategories', subCategoryControllers.getAllSubCategories);
publicRoute.get('/get-subcategories/:slug', subCategoryControllers.getSubCategory);
// publicRoute.get('/category/:categoryId', categoryControllers.getCategoryWithTours);
publicRoute.get('/get-reviews', reviewControllers.getReviews);
publicRoute.get('/get-approved-reviews', reviewControllers.getApprovedReviews);
publicRoute.get('/get-besttour/:bestTourId', bstControllers.getBestTour);
publicRoute.get('/get-besttours', bstControllers.getAllBestTours);
publicRoute.get('/get-discountedtour/:discountedTourId', discountedTours.getDiscountedTour);
publicRoute.get('/get-discountedtours', discountedTours.getAllDiscountTours);
publicRoute.get('/get-popular-tours', popularToursControllers.getAllPopularTours);

// tourRoute.get('/get-all-tours', tourControllers.getAllTours);

module.exports = publicRoute;
