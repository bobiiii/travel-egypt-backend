const express = require('express');
const multer = require('multer');
const {adminOnly} = require('../../middlewares')
const { subscribeControllers } = require('../../controllers');

const subscribeRoute = express.Router();

subscribeRoute.get('/get-subscribers', subscribeControllers.getSubscribers);
subscribeRoute.delete('/delete-subscriber/:subscriberId', subscribeControllers.deleteSubscriber);

module.exports = subscribeRoute;