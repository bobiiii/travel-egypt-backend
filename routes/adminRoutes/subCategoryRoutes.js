const express = require('express');
const multer = require('multer');
const { subCategoryControllers } = require('../../controllers');

const upload = multer();
const subCategoryRoute = express.Router();

subCategoryRoute.post('/add-subcategory', upload.any(), subCategoryControllers.addSubCategory);
subCategoryRoute.put('/update-subcategory/:subcategoryId', upload.any(), subCategoryControllers.updateSubCategory);
subCategoryRoute.delete('/delete-subcategory/:subcategoryId', subCategoryControllers.deleteSubCategory);

module.exports = subCategoryRoute;
