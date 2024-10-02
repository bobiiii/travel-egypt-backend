const express = require('express');
const multer = require('multer');
const { metadataControllers } = require('../../controllers');

const upload = multer();
const metadataRoute = express.Router();

metadataRoute.get('/get-metadata/:metadataId', metadataControllers.getMetadata);
metadataRoute.post('/add-metadata', upload.any(), metadataControllers.addMetadata);
metadataRoute.put('/update-metadata/:metadataId', upload.any(), metadataControllers.updateMetadata);
metadataRoute.delete('/delete-metadata/:metadataId', metadataControllers.deleteMetadata);

module.exports = metadataRoute;
