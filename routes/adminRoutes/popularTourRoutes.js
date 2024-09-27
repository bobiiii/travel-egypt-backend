const express = require('express');
const { popularToursControllers } = require('../../controllers');

const popularTourRoute = express.Router();

popularTourRoute.post('/add-populartour', popularToursControllers.addPopularTour);
popularTourRoute.put('/update-populartour/:popularTourId', popularToursControllers.updatePopularTour);
popularTourRoute.delete('/delete-populartour/:popularTourId', popularToursControllers.deletePopularTour);

module.exports = popularTourRoute;
