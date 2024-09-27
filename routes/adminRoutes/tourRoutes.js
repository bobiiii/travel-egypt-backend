const express = require('express');
const multer = require('multer');
const { tourControllers } = require('../../controllers');

const upload = multer();
const tourRoute = express.Router();

tourRoute.post('/add-tour', upload.any(), tourControllers.addTour);
tourRoute.put('/update-tour/:tourId', upload.any(), tourControllers.updateTour);
tourRoute.delete('/delete-tour/:tourId', tourControllers.deleteTour);
// tourRoute.get('/get-all-tours', tourControllers.getAllTours);

module.exports = tourRoute;
