const express = require('express');
const multer = require('multer');
const { categoryControllers } = require('../../controllers');
const { adminOnly } = require('../../middlewares');

const upload = multer();
const categoryRoute = express.Router();

categoryRoute.post('/add-category',adminOnly, upload.any(), categoryControllers.addCategory);
categoryRoute.put('/update-category/:categoryId', upload.any(), categoryControllers.updateCategory);
categoryRoute.delete('/delete-category/:categoryId', categoryControllers.deleteCategory);
// categoryRoute.get('/get-all-tours', tourControllers.getAllTours);

module.exports = categoryRoute;
