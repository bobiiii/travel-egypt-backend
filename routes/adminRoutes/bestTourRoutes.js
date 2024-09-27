const express = require('express');
const { bstControllers } = require('../../controllers');

const bestTourRoute = express.Router();
console.log("a");


bestTourRoute.post('/add-besttour', bstControllers.addBestToursController);
bestTourRoute.put('/update-besttour/:bestTourId', bstControllers.updateBestTour);
bestTourRoute.delete('/delete-besttour/:bestTourId', bstControllers.deleteBestTour);

module.exports = bestTourRoute;
