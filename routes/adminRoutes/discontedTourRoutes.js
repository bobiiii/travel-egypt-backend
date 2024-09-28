const express = require('express');
const { discountedTours } = require('../../controllers');

const discounrtedTourRoute = express.Router();

// discounrtedTourRoute.post('/add-discountedtour', discountedTours.addDiscountedTourController);
// discounrtedTourRoute.put('/update-discountedtour/:discountedTourId', discountedTours.updateDiscountedTour);
// discounrtedTourRoute.delete('/delete-discountedtour/:discountedTourId', discountedTours.deleteDiscountedTour);

module.exports = discounrtedTourRoute;
