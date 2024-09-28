const { S3Client, UploadCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadImageToS3 = async (image) => {
  const imageKey = `${uuidv4()}-${image.originalname}`;
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: imageKey,
    Body: image.buffer,
    ContentType: image.mimetype,
  };
  const command = new PutObjectCommand(uploadParams);
  try {
    const data = await s3Client.send(command);
    console.log("data ", data);
    
    const region = 'us-east-1'; // or use process.env.AWS_REGION
    
    
    return imageKey
    //  `https://${process.env.AWS_BUCKET_NAME}.s3.${region}.amazonaws.com/${imageKey}`;
  } catch (err) {
    console.error(err);
    throw new Error('Error uploading image to S3');
  }
};




const updateImageToS3 = async (image, existingImageKey) => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: existingImageKey,
      Body: image.buffer,
      ContentType: image.mimetype,
    };
  
    try {
      // Overwrite existing image
 await s3Client.send(new PutObjectCommand(params));

  
      return  existingImageKey
    //   return `https://${process.env.AWS_BUCKET_NAME}.s3.${s3Client.config.region}.amazonaws.com/${existingImageKey}`;
    } catch (err) {
      console.error(err);
      throw new Error('Error updating image to S3');
    }
  };


  const deleteObjectFromS3 = async (imageKey) => {
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageKey,
    };
    const command = new DeleteObjectCommand(deleteParams);
    try {
      await s3Client.send(command);
      
    } catch (err) {
      console.error(err);
      throw new Error('Error deleting object from S3');
    }
  };



module.exports = {
    uploadImageToS3   ,
    updateImageToS3,
    deleteObjectFromS3
}