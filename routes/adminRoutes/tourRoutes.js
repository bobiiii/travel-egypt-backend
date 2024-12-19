const express = require('express');
const multer = require('multer');
const { tourControllers } = require('../../controllers');

const upload = multer();
const tourRoute = express.Router();



tourRoute.post('/add-tour', upload.any(), tourControllers.addTour);
tourRoute.put('/update-tour/:tourId', upload.any(), tourControllers.updateTour);
tourRoute.put('/add-tour-data/:tourId', upload.any(), tourControllers.addTourData);
tourRoute.put('/add-include/:tourId', upload.any(), tourControllers.addIncludePoint);
tourRoute.put('/add-highlight/:tourId', upload.any(), tourControllers.addHighlightPoint);
tourRoute.delete('/delete-tour/:tourId', tourControllers.deleteTour);
tourRoute.delete('/delete-include', tourControllers.deleteIncludePoint);
tourRoute.delete('/delete-highlight', tourControllers.deleteHighlightPoint);
// tourRoute.get('/get-all-tours', tourControllers.getAllTours);

module.exports = tourRoute;
