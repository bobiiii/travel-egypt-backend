const { google } = require('googleapis');
const stream = require('stream');
// const path = require('path');
const { ErrorHandler } = require('../utils/errohandler');
const { environmentVariables } = require('../config');
// eslint-disable-next-line no-unused-expressions
require('buffer').Blob;

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_id: environmentVariables.GOOGLE_CLIENT_ID,
    client_email: environmentVariables.GOOGLE_CLIENT_EMAIL,
    project_id: environmentVariables.GOOGLE_PROJECT_ID,
    private_key: environmentVariables.GOOGLE_PRIVATE_KEY,
  },
  scopes: SCOPES,
});

const drive = google.drive({
  version: 'v3',
  auth,
});

// upload Image ======
const uploadImageToDrive = async (dynamicParameter) => {
  if (!dynamicParameter.buffer) {
    // console.error('Error: Invalid file object');
    return null;
  }
  try {
    const folder = environmentVariables.NODE_ENV === 'production'
      ? environmentVariables.DEPOSITFOLDER
      : environmentVariables.DEPOSITFOLDERTEST;
    const bufferImage = new stream.PassThrough();
    bufferImage.end(dynamicParameter.buffer);
    const { data } = await drive.files.create({
      media: {
        mimeType: dynamicParameter.mimetype,
        body: bufferImage,
      },
      requestBody: {
        name: dynamicParameter.originalname,
        // parents: ['1BVrmiApLtc6gjtNDPXE1Q3TqCmQ1hSeh'],
        parents: ['1lf8Ls8PX_NEWoO9so5Zf-itk8OgOY3so'],

      },
      fields: 'id, name',
    });

    return data.id;
  } catch (error) {
    // console.error('Error uploading image to Google Drive:', error);
    throw new ErrorHandler('Error uploading image to Google Drive', 500);
  }
};

const uploadImageToDriveDP = async (dynamicParameter) => {
  if (!dynamicParameter.buffer) {
    // console.error('Error: Invalid file object');
    return null;
  }
  try {
    const folder = environmentVariables.NODE_ENV === 'production'
      ? environmentVariables.PROFILEFOLDER
      : environmentVariables.PROFILEFOLDERTEST;
    const bufferImage = new stream.PassThrough();
    bufferImage.end(dynamicParameter.buffer);
    const { data } = await drive.files.create({
      media: {
        mimeType: dynamicParameter.mimetype,
        body: bufferImage,
      },
      requestBody: {
        name: dynamicParameter.originalname,
        parents: [folder],
      },
      fields: 'id, name',
    });

    return data.id;
  } catch (error) {
    // console.error('Error uploading image to Google Drive:', error);
    throw new ErrorHandler('Error uploading image to Google Drive', 500);
  }
};

const updateImageOnDrive = async (fileId, updatedImage) => {
  if (!updatedImage.buffer) {
    // console.error('Error: Invalid file object');
    return null;
  }
  try {
    const bufferImage = new stream.PassThrough();
    bufferImage.end(updatedImage.buffer);
    const { data } = await drive.files.update({
      fileId,
      media: {
        mimeType: updatedImage.mimetype,
        body: bufferImage,
      },
      requestBody: {
        name: updatedImage.originalname,
      },
    });
    // console.log(data)
    return data.id;
  } catch (error) {
    console.error('Error updating image on Google Drive:', error);
    throw new ErrorHandler('Error updating image on Google Drive', 500);
  }
};

const deleteImage = async (imageRef) => {
  try {
    await drive.files.delete({
      fileId: imageRef,
    });
  } catch (err) {
    throw new ErrorHandler('Error Deleting image on Google Drive', 500);
  }
};

const isImage = (file) => file && file.mimetype.startsWith('image/');

module.exports = {
  uploadImageToDrive,
  uploadImageToDriveDP,
  updateImageOnDrive,
  deleteImage,
  isImage,
};
