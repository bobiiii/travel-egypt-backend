const express = require('express');
const { internalImageControllers } = require('../../controllers');
const multer = require('multer');
const upload = multer();
const internalImageRoute = express.Router();

internalImageRoute.post('/upload-blog-image', upload.any(), internalImageControllers.uploadInternalImage);
internalImageRoute.delete('/delete-blog-image', internalImageControllers.deleteInternalImage);

module.exports = internalImageRoute;
