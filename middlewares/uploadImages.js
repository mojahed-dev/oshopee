// const multer = require("multer");
// const sharp = require("sharp");
// const path = require("path");
// const fs = require("fs/promises");
// const asyncHandler = require("express-async-handler");


// // const storage = multer.diskStorage({
// //   destination: function (req, file, cb) {
// //     cb(null, path.join(__dirname, "../public/images/"));
// //   },
// //   filename: function (req, file, cb) {
// //     const uniquesuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
// //     cb(null, file.fieldname + "-" + uniquesuffix + ".jpeg");
// //   },
// // });

// // const multerFilter = (req, file, cb) => {
// //   if (file.mimetype.startsWith("image")) {
// //     cb(null, true);
// //   } else {
// //     cb({ message: "Unsupported file format" }, false);
// //   }
// // };

// // const uploadPhoto = multer({
// //   storage: storage,
// //   fileFilter: multerFilter,
// //   limits: { fileSize: 1000000 },
// // });

// // const productImgResize = async (req, res, next) => {
// //   if (!req.files) return next();
// //   await Promise.all(
// //     req.files.map(async (file) => {
// //       await sharp(file.path)
// //         .resize(300, 300)
// //         .toFormat("jpeg")
// //         .jpeg({ quality: 90 })
// //         .toFile(`public/images/products/${file.filename}`);
// //       fs.unlinkSync(`public/images/products/${file.filename}`);
// //     })
// //   );
// //   next();
// // };

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "../public/images/"));
//   },
//   filename: function (req, file, cb) {
//     const uniquesuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniquesuffix + ".jpeg");
//   },
// });

// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb({ message: "Unsupported file format" }, false);
//   }
// };

// const uploadPhoto = multer({
//   storage: storage,
//   fileFilter: multerFilter,
//   limits: { fileSize: 1000000 },
// });

// // const productImgResize = async (req, res, next) => {
// //   if (!req.files) return next();
// //   await Promise.all(
// //     req.files.map(async (file) => {
// //       await sharp(file.path)
// //         .resize(300, 300)
// //         .toFormat("jpeg")
// //         .jpeg({ quality: 90 })
// //         .toFile(`public/images/products/${file.filename}`);
// //       fs.unlinkSync(`public/images/products/${file.filename}`);
// //     })
// //   );
// //   next();
// // };


// // const productImgResize = async (req, res, next) => {
// //   if (!req.files) return next();

// //   try {
// //     await Promise.all(
// //       req.files.map(async (file) => {
// //         const outputPath = path.join(__dirname, "../public/images/products/", file.filename);
// //         console.log(`Processing file: ${file.path}`);
// //         await sharp(file.path)
// //           .resize(300, 300)
// //           .toFormat("jpeg")
// //           .jpeg({ quality: 90 })
// //           .toFile(outputPath);
        
// //         console.log(`Deleting original file: ${file.path}`);
// //         fs.unlinkSync(file.path);
// //       })
// //     );
// //     next();
// //   } catch (error) {
// //     console.error("Error processing images:", error);
// //     res.status(500).json({ message: "Error processing images", error });
// //   }
// // };





// const productImgResize = asyncHandler(async (req, res, next) => {
//   if (!req.files) return next();
//   // console.log("req.files: ", req.files);

//   const outputDir = path.join(__dirname, '..', 'public', 'images', 'products');
//   // Ensure the output directory exists
//   await fs.mkdir(outputDir, { recursive: true });

//   await Promise.all(
//     req.files.map(async (file) => {
//       const outputPath = path.join(outputDir, file.filename);

//       try {
//         await sharp(file.path)
//           .resize(300, 300)
//           .toFormat('jpeg')
//           .jpeg({ quality: 90 })
//           .toFile(outputPath);

//         // Remove original file after resizing
//         console.log(`Deleting original file(productImgResize): ${file.path}`);
//         await fs.unlink(file.path);

//         // Update the file path to the resized image for the next middleware
//         file.path = outputPath;
//         console.log("file.path: ", file.path);
//       } catch (error) {
//         console.error(`Failed to process file(productImgResize) ${outputPath}:`, error);
//       }
//     })
//   );

//   next();
// });



// const blogImgResize = async (req, res, next) => {
//   if (!req.files) return next();
//   await Promise.all(
//     req.files.map(async (file) => {
//       await sharp(file.path)
//         .resize(300, 300)
//         .toFormat("jpeg")
//         .jpeg({ quality: 90 })
//         .toFile(`public/images/blogs/${file.filename}`);
//       fs.unlinkSync(`public/images/blogs/${file.filename}`);
//     })
//   );
//   next();
// };
// module.exports = { uploadPhoto, productImgResize, blogImgResize };

const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Helper to ensure directory existence
const ensureDirectoryExistence = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Setup storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("fieldname ", file.fieldname);
        const folder = file.fieldname === 'productImages' ? 'public/images/products' : 'public/images/blogs';
        ensureDirectoryExistence(folder);
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append time stamp to the original file name
    }
});

const upload = multer({ storage: storage });

// Middleware to resize multiple images
const resizeImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next();
    }

    try {
        await Promise.all(
            req.files.map(async (file) => {
                const folder = file.fieldname === 'productImages' ? 'products' : 'blogs';
                const filePath = path.join(__dirname, `../public/images/${folder}/${file.filename}`);
                const outputFilePath = path.join(__dirname, `../public/images/${folder}/resized-${file.filename}`);

                console.log(`Resizing file: ${filePath}`);
                
                if (fs.existsSync(filePath)) {
                    await sharp(filePath)
                        .resize(300, 300)
                        .toFile(outputFilePath);

                    console.log(`Resized file saved: ${outputFilePath}`);

                    // Replace the original file path with the resized file path
                    file.path = outputFilePath;

                    // Delete the original file after resizing
                    fs.unlinkSync(filePath);
                } else {
                    console.error(`File not found: ${filePath}`);
                }
            })
        );
        next();
    } catch (error) {
        console.error(`Error in resizing: ${error}`);
        next(error);
    }
};

module.exports = { upload, resizeImages };
