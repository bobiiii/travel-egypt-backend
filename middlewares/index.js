const {adminOnly} = require('./adminOnly');
// const protect = require('./protect');
const {
  uploadImageToDrive,
  uploadImageToDriveDP,
  updateImageOnDrive,
  deleteImage,
  isImage,
} = require('./uploadImage');

module.exports = {
//   protect,
//   adminOnly,
  uploadImageToDrive,
  uploadImageToDriveDP,
  updateImageOnDrive,
  deleteImage,
  isImage,
  adminOnly
};
