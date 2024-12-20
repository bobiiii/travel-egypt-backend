const express = require('express');
const multer = require('multer');
const { tourControllers } = require('../../controllers');

const upload = multer();
const tourRoute = express.Router();



tourRoute.post('/add-tour', upload.any(), tourControllers.addTour);
tourRoute.put('/update-tour/:tourId', upload.any(), tourControllers.updateTour);
tourRoute.put('/add-tour-data/:tourId', upload.any(), tourControllers.addTourData);
tourRoute.put('/add-include/:tourId',  tourControllers.addIncludePoint);
tourRoute.put('/add-highlight/:tourId',  tourControllers.addHighlightPoint);
tourRoute.put('/add-importantInfo/:tourId',  tourControllers.addImportantInformation);
tourRoute.delete('/delete-tour/:tourId', tourControllers.deleteTour);
tourRoute.delete('/delete-include', tourControllers.deleteIncludePoint);
tourRoute.delete('/delete-highlight', tourControllers.deleteHighlightPoint);
tourRoute.delete('/delete-importantInfo', tourControllers.deleteImportantInformation);
// tourRoute.get('/get-all-tours', tourControllers.getAllTours);

module.exports = tourRoute;
