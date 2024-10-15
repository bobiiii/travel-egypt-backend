const express = require('express');
const tourRoute = require('./tourRoutes');
const categoryRoute = require('./categoryRoutes');
const reviewRoute = require('./reviewRoutes');
const bookingRoute = require('./bookingRoutes');
const subCategoryRoute = require('./subCategoryRoutes');
const bestTourRoute = require('./bestTourRoutes');
const discounrtedTourRoute = require('./discontedTourRoutes');
const popularTourRoute = require('./popularTourRoutes');
const approvedReview = require('./approvedReviewRoute');
const metadataRoute = require('./metadataRoutes');
const messageRoute = require('./messageRoutes');
const userRoute = require('./userRoutes');
const subscribeRoute = require('./subscribeRoutes');
const blogRoute = require('./blogRoutes');

const adminRoutes = express.Router();

adminRoutes.use('/user/', userRoute);
adminRoutes.use('/tour', tourRoute);
adminRoutes.use('/category', categoryRoute);
adminRoutes.use('/review', reviewRoute);
adminRoutes.use('/booking', bookingRoute);
adminRoutes.use('/subcategory', subCategoryRoute);
adminRoutes.use('/besttour', bestTourRoute);
adminRoutes.use('/discountedtour', discounrtedTourRoute);
adminRoutes.use('/populartour', popularTourRoute);
adminRoutes.use('/approvedreview', approvedReview)
adminRoutes.use('/metadata', metadataRoute)
adminRoutes.use('/booking', bookingRoute)
adminRoutes.use('/message', messageRoute)
adminRoutes.use('/subscribe', subscribeRoute)
adminRoutes.use('/blog', blogRoute)

adminRoutes.use('/*', (req, res) => {
  res.status(404).json({ message: 'Route Not Found' });
});

module.exports = adminRoutes;
