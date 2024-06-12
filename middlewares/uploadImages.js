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
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/products/${file.filename}`);
      fs.unlinkSync(`public/images/products/${file.filename}`);
    })
  );
  next();
};

// const productImgResize = async (req, res, next) => {
//   if (!req.files) return next(); // If no files are uploaded, skip to the next middleware
//   try {
//     // Process each uploaded file asynchronously
//     await Promise.all(
//       req.files.map(async (file) => {
//         // Resize and format the image using sharp module
//         await sharp(file.path)
//           .resize(300, 300) // Resize image to 300x300 pixels
//           .toFormat("jpeg") // Convert image to JPEG format
//           .jpeg({ quality: 90 }) // Set JPEG quality to 90%
//           .toFile(`public/images/products/${file.filename}`); // Save resized image to products folder

//         // Delete the original uploaded file
//         fs.promises.unlink(`public/images/${file.filename}`);
//       })
//     );
//     next(); // Proceed to the next middleware
//   } catch (error) {
//     // Handle any errors that occur during image processing
//     console.error(`Error during image processing: ${error}`);
//     next(error); // Pass the error to the next middleware or error handler
//   }
// };

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
