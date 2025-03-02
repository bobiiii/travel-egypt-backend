const fs = require('fs');
const path = require('path');

const uploadImage = async (image, folder) => {
  return new Promise((resolve, reject) => {

    if (!image) {
      return reject(new Error('No image provided'));
    }


    const uploadDir = path.resolve(__dirname, '../public/images', folder);

    const uniqueId = Date.now(); // Or use any unique identifier
    const sanitizedFileName = image.originalname.replace(/\s+/g, '_');
    const uniqueFileName = `${uniqueId}_${sanitizedFileName}`;

    const uploadPath = path.join(uploadDir, uniqueFileName);
    fs.writeFile(uploadPath, image.buffer, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(uniqueFileName);
    });

  });
};


const updateImageLocal = async (newImage, oldImageName, folder) => {
  return new Promise((resolve, reject) => {
    if (!newImage) {
      return reject(new Error('No new image provided'));
    }

    const uploadDir = path.resolve(__dirname, '../public/images', folder);

    // Delete the old image if it exists
    const oldImagePath = path.join(uploadDir, oldImageName);
    if (fs.existsSync(oldImagePath)) {
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          return reject(err);
        }
      });
    }

    // Generate new unique file name for the new image
    const uniqueId = Date.now(); // Or use any unique identifier
    const sanitizedFileName = newImage.originalname.replace(/\s+/g, '_');
    const uniqueFileName = `${uniqueId}_${sanitizedFileName}`;
    const newUploadPath = path.join(uploadDir, uniqueFileName);

    // Save the new image
    fs.writeFile(newUploadPath, newImage.buffer, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(uniqueFileName);
    });
  });
};


const deleteImage = async (imageName, folder) => {
  return new Promise((resolve, reject) => {
    if (!imageName) {
      console.info("No Image name provided while deleting blog")
      return resolve(true);

    }

    const uploadDir = path.resolve(__dirname, '../public/images', folder);
    const imagePath = path.join(uploadDir, imageName);

    // Check if the image exists before deleting
    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.info("No Images found while deleting blog");
          return resolve(true);
        }
        resolve('Image deleted successfully');
      });
    } else {
      console.info("No Images found while deleting blog");
      return resolve(true);
    }
  });
};

module.exports = {
  uploadImage,
  updateImageLocal,
  deleteImage
}