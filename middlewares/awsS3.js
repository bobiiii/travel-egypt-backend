const { S3Client, UploadCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { CloudFrontClient, CreateInvalidationCommand, GetInvalidationCommand } = require("@aws-sdk/client-cloudfront");

const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// const cloudfrontClient = new CloudFrontClient({ region: process.env.AWS_REGION });


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
  const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: existingImageKey,
      Body: image.buffer,
      ContentType: image.mimetype,
  };

  try {
      await s3Client.send(new PutObjectCommand(s3Params));

      const cloudfrontClient = new CloudFrontClient({ region: "GLOBAL" });
      const encodedImageKey = `/${existingImageKey.replace(/ /g, '%20')}`;

      const cloudfrontParams = {
          DistributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID, // Your CloudFront distribution ID
          InvalidationBatch: {
              CallerReference: `invalidate-${Date.now()}`, // Unique string to ensure the request is unique
              Paths: {
                  Quantity: 1,
                  Items: [`${encodedImageKey}`], // Path to the image to invalidate (starting with /)
              },
          },
      };
 await cloudfrontClient.send(new CreateInvalidationCommand(cloudfrontParams));

      return existingImageKey;
  } catch (err) {
      console.error(err);
      throw new Error('Error updating image and invalidating CloudFront cache');
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