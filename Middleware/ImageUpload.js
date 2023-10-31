const multer = require("multer");
const { config } = require("dotenv");
const { S3 } = require("@aws-sdk/client-s3");
const ErrorHandler = require("../Utils/ErrorHandler");
config();

const params = {
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY
    },
    region: process.env.AWS_BUCKET_REGION, // Set your desired region
    useAccelerateEndpoint: false, // Disable accelerated endpoint if not needed
};


// Create an S3 instance
const s3 = new S3(params);
const s3Destination = "uploads/";
const multerConfig = multer();


// Middleware to handle single image upload to S3
exports.imageSingleUpload = (req, res, next) => {
    multerConfig.single("image")(req, res, (error) => {
        if (error) {
            console.error("Multer Error:", error);
            return next(new ErrorHandler("Multer upload failed", 500));
        }
        // Use the `req.file` object to access the uploaded file
        if (!req.file) {
            return next();
        }
        const uniqueKey = `${Date.now()}-${Math.floor(Math.random() * 10000)}-${req.file.originalname}`;
        // Define the S3 upload parameters
        const s3Params = {
            Bucket: process.env.AWS_BUCKET_NAME, // Replace with your S3 bucket name
            Key: `${s3Destination}${uniqueKey}`, // Set the S3 key for the uploaded file
            Body: req.file.buffer, // Use the file buffer from Multer
            ContentType: req.file.mimetype, // Set the content type based on the file's mimetype
            ACL: "public-read", // Set access permissions as needed
        };
        s3.putObject(s3Params, (err, data) => {
            if (err) {
                console.error("S3 Upload Error:", err);
                return next(new ErrorHandler("S3 upload failed", 500));
            }
            // Optionally, you can store the S3 URL or other relevant information in the request for later use
            req.s3FileUrl = {
                Bucket: process.env.AWS_BUCKET_NAME, // Replace with your S3 bucket name
                Key: `${s3Destination}${uniqueKey}`, // Set the S3 key for the uploaded file
                Url: `https://${s3Params.Bucket}.s3.amazonaws.com/${s3Params.Key}`,
            };
            next(); // Continue to the next middleware if upload is successful
        });
    });
};



// Middleware to handle multiple image uploads to S3
exports.imageMultiUpload = (req, res, next) => {
    multerConfig.array("images[]")(req, res, (error) => {
        if (error) {
            console.error("Multer Error:", error);
            return next(new ErrorHandler("Multer upload failed", 500));
        }
        // Use the `req.files` array to access the uploaded files
        if (!req.files || req.files.length === 0) {
            req.files = []
        }
        // Map the uploaded files to S3 upload promises
        const uploadPromises = req.files.map((file) => {
            const uniqueKey = `${Date.now()}-${Math.floor(Math.random() * 10000)}-${file.originalname}`;
            // Define the S3 upload parameters for each file
            const s3Params = {
                Bucket: process.env.AWS_BUCKET_NAME, // Replace with your S3 bucket name
                Key: `${s3Destination}${uniqueKey}`, // Set the S3 key for the uploaded file
                Body: file.buffer, // Use the file buffer from Multer
                ContentType: file.mimetype, // Set the content type based on the file's mimetype
                ACL: "public-read", // Set access permissions as needed
            };
            // Return a promise that resolves when the file is uploaded to S3
            return new Promise((resolve, reject) => {
                // S3 ManagedUpload with callbacks are not supported in AWS SDK for JavaScript (v3).
                // Please convert to 'await client.upload(params, options).promise()', and re-run aws-sdk-js-codemod.
                // S3 ManagedUpload with callbacks are not supported in AWS SDK for JavaScript (v3).
                // Please convert to 'await client.upload(params, options).promise()', and re-run aws-sdk-js-codemod.
                s3.putObject(s3Params, (err, data) => {
                    if (err) {
                        console.error("S3 Upload Error:", err);
                        reject(err);
                    } else {
                        // Optionally, you can store the S3 URL or other relevant information in the request for later use
                        if (!req.s3FileUrls) {
                            req.s3FileUrls = [];
                        }
                        req.s3FileUrls.push({
                            Bucket: process.env.AWS_BUCKET_NAME, // Replace with your S3 bucket name
                            Key: `${s3Destination}${uniqueKey}`, // Set the S3 key for the uploaded file
                            Url: `https://${s3Params.Bucket}.s3.amazonaws.com/${s3Params.Key}`,
                        });
                        console.log({ s3FileUrls: req.s3FileUrls });
                        resolve(data);
                    }
                });
            });
        });

        // Wait for all file uploads to S3 to complete
        Promise.all(uploadPromises)
            .then(() => {
                next(); // Continue to the next middleware if all uploads are successful
            })
            .catch((err) => {
                console.log({ err });
                next(new ErrorHandler("S3 upload failed", 500));
            });
    });
};


// Middleware to handle video uploads to S3
exports.videoSingleUpload = (req, res, next) => {
    multerConfig.single("video")(req, res, (error) => {
        if (error) {
            console.error("Multer Error:", error);
            return next(new ErrorHandler("Multer upload failed", 500));
        }
        // Use the `req.file` object to access the uploaded video file
        if (!req.file) {
            return next(new ErrorHandler("No video file uploaded", 400));
        }
        const uniqueKey = `${Date.now()}-${Math.floor(Math.random() * 10000)}-${req.file.originalname}`;
        // Define the S3 upload parameters for the video file
        const s3Params = {
            Bucket: process.env.AWS_BUCKET,
            Key: `${s3Destination}${uniqueKey}`,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ACL: "public-read",
        };
        // Upload the video file to S3
        // S3 ManagedUpload with callbacks are not supported in AWS SDK for JavaScript (v3).
        // Please convert to 'await client.upload(params, options).promise()', and re-run aws-sdk-js-codemod.
        // S3 ManagedUpload with callbacks are not supported in AWS SDK for JavaScript (v3).
        // Please convert to 'await client.upload(params, options).promise()', and re-run aws-sdk-js-codemod.
        s3.upload(s3Params, (err, data) => {
            if (err) {
                console.error("S3 Upload Error:", err);
                return next(new ErrorHandler("S3 upload failed", 500));
            }

            // Optionally, you can store the S3 URL or other relevant information in the request for later use
            req.s3VideoUrl = {
                bucket: process.env.AWS_BUCKET, // Replace with your S3 bucket name
                key: `${s3Destination}${uniqueKey}`, // Set the S3 key for the uploaded file
                url: `https://${s3Params.Bucket}.s3.amazonaws.com/${s3Params.Key}`,
            };

            next(); // Continue to the next middleware if upload is successful
        });
    });
};


// Middleware to handle file uploads with specific field names
exports.TaxiFields = (req, res, next) => {
    multerConfig.fields([
        { name: "insurance", maxCount: 5 },
        { name: "registration", maxCount: 10 },
        { name: "taxiImage", maxCount: 10 },
        { name: "licensePicture", maxCount: 10 },
    ])(req, res, (error) => {
        if (error) {
            console.error("Multer Error:", error);
            return next(new ErrorHandler("Multer upload failed", 500));
        }

        // Initialize an object to store the S3 URLs for each uploaded file
        req.s3FileUrls = {};

        // Map the uploaded files to S3 upload promises
        const uploadPromises = Object.keys(req.files).map((fieldName) => {
            return Promise.all(
                req.files[fieldName].map((file) => {
                    const uniqueKey = `${Date.now()}-${Math.floor(Math.random() * 10000)}-${file.originalname}`;

                    // Define the S3 upload parameters for each file
                    const s3Params = {
                        Bucket: process.env.AWS_BUCKET,
                        Key: `${s3Destination}${uniqueKey}`,
                        Body: file.buffer,
                        ContentType: file.mimetype,
                        ACL: "public-read",
                    };

                    // Return a promise that resolves when the file is uploaded to S3
                    return new Promise((resolve, reject) => {
                        s3.putObject(s3Params, (err, data) => {
                            if (err) {
                                console.error("S3 Upload Error:", err);
                                reject(err);
                            } else {
                                if (!req.s3FileUrls[fieldName]) req.s3FileUrls[fieldName] = [];
                                req.s3FileUrls[fieldName].push({
                                    Bucket: process.env.AWS_BUCKET,
                                    Key: `${s3Destination}${uniqueKey}`,
                                    Url: `https://${s3Params.Bucket}.s3.amazonaws.com/${s3Params.Key}`,
                                });

                                resolve(data);
                            }
                        });
                    });
                })
            );
        });

        // Wait for all file uploads to S3 to complete
        Promise.all(uploadPromises.flat())
            .then(() => {
                next(); // Continue to the next middleware if all uploads are successful
            })
            .catch((err) => {
                next(new ErrorHandler("S3 upload failed", 500));
            });
    });
};



