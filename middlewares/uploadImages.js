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
const fs = require('fs').promises; // Use promises API of fs
const ensureDirectoryExistence = (dir) => {
    if (!require('fs').existsSync(dir)) {
        require('fs').mkdirSync(dir, { recursive: true });
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
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the original file name
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
                
                if (await fs.stat(filePath).then(() => true).catch(() => false)) { // Check if file exists
                    await sharp(filePath)
                        .resize(300, 300)
                        .toFile(outputFilePath);

                    console.log(`Resized file saved: ${outputFilePath}`);

                    // Replace the original file path with the resized file path
                    file.path = outputFilePath;

                    // Add a small delay before attempting to delete the original file
                    setTimeout(async () => {
                        try {
                            await fs.unlink(filePath);
                            console.log(`Original file deleted: ${filePath}`);
                        } catch (unlinkError) {
                            console.error(`Error in deleting the file: ${unlinkError.message}`);
                        }
                    }, 100); // 100ms delay
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

