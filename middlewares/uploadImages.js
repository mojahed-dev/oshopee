const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/"));
  },
  filename: function (req, file, cb) {
    const uniquesuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniquesuffix + ".jpeg");
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

const uploadPhoto = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: { fileSize: 1000000 },
});


const productImgResize = async (req, res, next) => {
    if (!req.files) return next();
  
    try {
      // Process each file with sharp
      await Promise.all(
        req.files.map(async (file) => {
          const outputPath = path.join('public', 'images', 'products', file.filename);
  
          // Use sharp to resize and format the image
          await sharp(file.path)
            .resize(300, 300)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(outputPath);

          // Update file.path to the output path
        //  
  
          // Log file information and check permissions before attempting to delete
          console.log(`Attempting to delete file: ${file.path}`);
          
          try {
            // Add a delay to ensure the file is not locked
            await new Promise(resolve => setTimeout(resolve, 100));
  
            // Attempt to delete the original file
            fs.unlinkSync(file.path);
            console.log(`Successfully deleted file: ${file.path}`);
          } catch (deleteError) {
            console.error(`Error deleting file: ${file.path}. Error: ${deleteError}`);
            // Instead of throwing the error, continue processing other files
            // throw deleteError;
          }
        })
      );
  
      next(); // Proceed to the next middleware
    } catch (error) {
      // Log and handle the error
      console.error(`Error during image processing or file deletion: ${error}`);
      next(error); // Pass the error to the next middleware or error handler
    }
  };



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
module.exports = { uploadPhoto, productImgResize };
/* -------------------------------- */
// const multer = require('multer');
// const path = require('path');
// const sharp = require('sharp');
// const fs = require('fs').promises; // Use promises API of fs
// const ensureDirectoryExistence = (dir) => {
//     if (!require('fs').existsSync(dir)) {
//         require('fs').mkdirSync(dir, { recursive: true });
//     }
// };

// // Setup storage configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         console.log("fieldname ", file.fieldname);
//         const folder = file.fieldname === 'productImages' ? 'public/images/products' : 'public/images/blogs';
//         ensureDirectoryExistence(folder);
//         cb(null, folder);
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the original file name
//     }
// });

// const upload = multer({ storage: storage });

// // Middleware to resize multiple images
// const resizeImages = async (req, res, next) => {
//     if (!req.files || req.files.length === 0) {
//         return next();
//     }

//     try {
//         await Promise.all(
//             req.files.map(async (file) => {
//                 const folder = file.fieldname === 'productImages' ? 'products' : 'blogs';
//                 const filePath = path.join(__dirname, `../public/images/${folder}/${file.filename}`);
//                 const outputFilePath = path.join(__dirname, `../public/images/${folder}/resized-${file.filename}`);

//                 console.log(`Resizing file: ${filePath}`);
                
//                 if (await fs.stat(filePath).then(() => true).catch(() => false)) { // Check if file exists
//                     await sharp(filePath)
//                         .resize(300, 300)
//                         .toFile(outputFilePath);

//                     console.log(`Resized file saved: ${outputFilePath}`);

//                     // Replace the original file path with the resized file path
//                     file.path = outputFilePath;

//                     // Add a small delay before attempting to delete the original file
//                     setTimeout(async () => {
//                         try {
//                             await fs.unlink(filePath);
//                             console.log(`Original file deleted: ${filePath}`);
//                         } catch (unlinkError) {
//                             console.error(`Error in deleting the file: ${unlinkError.message}`);
//                         }
//                     }, 100); // 100ms delay
//                 } else {
//                     console.error(`File not found: ${filePath}`);
//                 }
//             })
//         );
//         next();
//     } catch (error) {
//         console.error(`Error in resizing: ${error}`);
//         next(error);
//     }
// };

// module.exports = { upload, resizeImages };

