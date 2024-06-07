const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.SECRET_KEY
});

const cloudinaryUploadImg = async(fileToUpload) => {
    return new Promise((resolve) => {
        cloudinary.uploader.upload((fileToUpload), (result) => {
            resolve({
                url: result.secure_url,
            },{
                resource_type: "auto",
            })
        });
    });
};


// const cloudinaryUploadImg = async (fileToUploads) => {
//     return new Promise((resolve) => {
//       cloudinary.uploader.upload(fileToUploads, (result) => {
//         resolve(
//           {
//             url: result.secure_url,
//             asset_id: result.asset_id,
//             public_id: result.public_id,
//           },
//           {
//             resource_type: "auto",
//           }
//         );
//       });
//     });
//   };


// const cloudinaryUploadImg = async (fileToUpload) => {
//     return new Promise((resolve, reject) => {
//       cloudinary.uploader.upload(
//         fileToUpload,
//         { resource_type: "auto" },
//         (error, result) => {
//           if (error) {
//             reject(error);
//           } else {
//             resolve({
//               url: result.secure_url,
//             });
//           }
//         }
//       );
//     });
//   };

// const cloudinaryUploadImg = async (fileToUpload) => {
//     return new Promise((resolve, reject) => {
//         cloudinary.uploader.upload(fileToUpload, { resource_type: "auto" }, (error, result) => {
//             if (error) {
//                 return reject(error);
//             }
//             resolve({
//                 url: result.secure_url,
//             });
//         });
//     });
// };


module.exports = cloudinaryUploadImg;