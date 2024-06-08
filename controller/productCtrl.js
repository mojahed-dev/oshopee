const Product = require('../models/productModel');
const User = require('../models/userModel');
const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const { query } = require('express');
const cloudinaryUploadImg = require('../utils/cloudinary');
const validateMongoDbId = require('../utils/validateMongodbid');
const fs = require('fs').promises;


const createProduct =  asyncHandler(async(req, res) => {
    try {
        if(req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch (error) {
        throw new Error(error);
    }
     res.json({
        message: "Hey, it's product post route."
     });
});


const getaProduct = asyncHandler(async(req, res) => {
    const {id} = req.params;
   
    try {
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    } catch (error) {
        throw new Error(error);
    }
});


const getAllProduct = asyncHandler(async(req, res) => {
    // console.log(req.query);
    try {
      // Filtering
      const queryObj = { ...req.query };
      const excludeFields = ["page", "sort", "limit", "fields"];
      excludeFields.forEach((el) => delete queryObj[el]);
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  
      let query = Product.find(JSON.parse(queryStr));
  
      // Sorting
  
      if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        query = query.sort(sortBy);
      } else {
        query = query.sort("-createdAt");
      }
  
      // limiting the fields
  
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        query = query.select(fields);
      } else {
        query = query.select("-__v");
      }
  
      // pagination
  
      const page = req.query.page;
      const limit = req.query.limit;
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
      
      if (req.query.page) {
        const productCount = await Product.countDocuments();
        if (skip >= productCount) throw new Error("This Page does not exists");
      }
      
      const product = await query;
      res.json(product);
    } catch (error) {
      throw new Error(error);
    }
});


const updateProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
    // validateMongoDbId(id);
    try {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const updateProduct = await Product.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
      });
      res.json(updateProduct);
    } catch (error) {
      throw new Error(error);
    }
  });

  const deleteProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
    // validateMongoDbId(id);
    try {
      const deleteProduct = await Product.findOneAndDelete(id);
      res.json(updateProduct);
    } catch (error) {
      throw new Error(error);
    }
  });

  const addToWishList = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    const { prodId } = req.body;

    try{
      const user = await User.findById(_id);
      const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId);

      if(alreadyAdded) {
        let user = await User.findByIdAndUpdate(_id, {
          $pull: {wishlist: prodId},
        },{
          new: true,
        }
      );

      res.json(user);

      }else {
        let user = await User.findByIdAndUpdate(_id, {
          $push: {wishlist: prodId},
        },{
          new: true,
        }
      );

      res.json(user);

      }
    }catch(error) {
      throw new Error(error);
    }
  });


  /*
const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId } = req.body;
  const product = await Product.findById(prodId)

  let alreadyRated = product.ratings.find((userId) => userId.postedby.toString() === _id.toString());

  try {
    if(alreadyRated) {
      const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star},
        },
        {
          new: true,
        }
      );
        res.json(updateRating);
    }else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      );
    }
      res.json(rateProduct);
    }
  } catch (error) {
    throw new Error(error);
  }
});  
*/

const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  
  try {
      const product = await Product.findById(prodId);
      if (!product) {
          res.status(404);
          throw new Error('Product not found');
      } 

      let alreadyRated = product.ratings.find((rating) => rating.postedby.toString() === _id.toString());

      if (alreadyRated) {
          const updateRating = await Product.updateOne(
              {
                  _id: prodId,
                  "ratings._id": alreadyRated._id,
              },
              {
                  $set: { "ratings.$.star": star, "ratings.$.comment": comment },
              },
              {
                  new: true,
              }
          );
          // res.json(updateRating);
      } else {
          const rateProduct = await Product.findByIdAndUpdate(
              prodId,
              {
                  $push: {
                      ratings: {
                          star: star,
                          comment: comment,
                          postedby: _id,
                      },
                  },
              },
              {
                  new: true,
              }
          );
          // res.json(rateProduct);
      }

    const getallratings = await Product.findById(prodId);
    let totalRating = getallratings.ratings.length;
    let ratingsum = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / totalRating);
    let finalproduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
      },
      { new: true }
    );
    res.json(finalproduct);

  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

/*
const uploadImages = asyncHandler(async(req, res) => {
  const { id }  = req.params;
  validateMongoDbId(id);

  try {
    const uploader =  (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
      // Debugging output
      console.log('req.files:', files);
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      console.log("newpath: ", newpath);
      urls.push(newpath);
      fs.unlinkSync(path);
    }
    const findProduct = await Product.findByIdAndUpdate(id, {
      images: urls.map((file) => {return file;}),
    }, {
      new: true
    })
    console.log(findProduct);
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
})

*/

// const uploadImages = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);

//   try {
//     const uploader = (path) => cloudinaryUploadImg(path, "images");
//     const urls = [];
//     const files = req.files;

//     console.log('requested files(uploadImages):', files);

//     for (const file of files) {
//       const { path } = file;
//       console.log(`Uploading file(uploadImages): ${path}`);
//       const newpath = await uploader(path);
//       urls.push(newpath.url);
      
//       // Delete the resized image after uploading to Cloudinary
//       console.log(`Deleting uploaded file(uploadImages): ${file.path}`);
//       await fs.promises.unlink(file.path);
//     }

//     const updatedProduct = await Product.findByIdAndUpdate(id, {
//       images: urls,
//     }, {
//       new: true
//     });

//     console.log(updatedProduct);
//     res.json(updatedProduct);
//   } catch (error) {
//     console.error("Error uploading images(uploadImages):", error);
//     res.status(500).json({ message: "Error uploading images(uploadImages)", error });
//   }
// });



const uploadImagesToCloudinary = async (req, res, next) => {
  const { id } = req.params; // Get the Blog ID from the route parameters

  try {
      // Check if any files were uploaded
      if (!req.files || req.files.length === 0) {
          return res.status(400).send('No files uploaded');
      }

      // Upload files to Cloudinary and collect URLs
      const uploadPromises = req.files.map(file => cloudinaryUploadImg(file.path));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(result => result.url);

      // Delete local files after successful upload to Cloudinary
      await Promise.all(req.files.map(file => fs.unlink(file.path)));

      // Find the Blog by ID and update the images field
      const updateProduct = await Product.findByIdAndUpdate(
          id,
          { $push: { images: { $each: urls } } }, // Add the URLs to the images array
          { new: true } // Return the updated document
      );

      if (!updateProduct) {
          return res.status(404).send('Product not found');
      }

      // Respond with the Cloudinary URLs and the updated Blog
      res.status(200).json({
          message: 'Images uploaded and URLs added to the Product successfully',
          urls,
          Product: updateProduct
      });
  } catch (error) {
      // Log and handle the error
      console.error(`Error during image upload to Cloudinary: ${error}`);
      next(error);
  }
};


/*
const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const uploader = (path) => cloudinaryUploadImg(path, "oshopee-images");
    const urls = [];
    const files = req.files;

    // Debugging output
    console.log('req.files:', files);

    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      console.log("newpath: ", newpath);
      urls.push(newpath);
      fs.unlinkSync(path);
    }

    const findProduct = await Product.findByIdAndUpdate(
      id,
      {
        images: urls,
      },
      {
        new: true,
      }
    );
    
    console.log(findProduct);
    res.json(findProduct);
  } catch (error) {
    console.error("Error uploading images: ", error); // More detailed error logging
    res.status(500).json({ error: error.message }); // Respond with error message
  }
});

*/

/*
const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const uploader = (path) => cloudinaryUploadImg(path, "oshopee-images");
    const urls = [];
    const files = req.files;

    // Debugging output
    console.log('req.files:', files);

    for (const file of files) {
      const { path } = file;
      try {
        const newpath = await uploader(path);
        console.log("newpath: ", newpath);
        urls.push(newpath);
        await fs.unlink(path); // Use async unlink
      } catch (unlinkError) {
        console.error(`Failed to delete file ${path}:`, unlinkError);
      }
    }

    const findProduct = await Product.findByIdAndUpdate(
      id,
      {
        images: urls,
      },
      {
        new: true,
      }
    );

    console.log(findProduct);
    res.json(findProduct);
  } catch (error) {
    console.error("Error uploading images: ", error); // More detailed error logging
    res.status(500).json({ error: error.message }); // Respond with error message
  }
});*/

/*
const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const uploader = async (path) => {
      try {
        const result = await cloudinaryUploadImg(path);
        return result.url;
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw new Error('Failed to upload image to Cloudinary');
      }
    };

    const files = req.files;

    console.log('req.files:', files);

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files were uploaded.' });
    }

    const uploadPromises = files.map(file => uploader(file.path));
    const urls = await Promise.all(uploadPromises);

    const findProduct = await Product.findByIdAndUpdate(
      id,
      { images: urls },
      { new: true }
    );

    console.log('Updated product:', findProduct);
    res.json(findProduct);
  } catch (error) {
    console.error('Error in uploadImages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
*/


/*
const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log('ID:', id);
  validateMongoDbId(id);

  try {
    const uploader = async (path) => {
      try {
        console.log('Uploading file:', path);
        const result = await cloudinaryUploadImg(path);
        console.log('Uploaded file to:', result);
        return result;
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw new Error('Failed to upload image to Cloudinary');
      }
    };

    const files = req.files;
    console.log('req.files:', files);

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files were uploaded.' });
    }

    const urls = [];
    for (const file of files) {
      const newPath = await uploader(file.path);
      urls.push(newPath);
      // fs.unlinkSync(path)
    }

    console.log('URLs:', urls);

    const findProduct = await Product.findByIdAndUpdate(
      id,
      { images: urls },
      { new: true }
    );

    console.log('Updated product:', findProduct);
    res.json(findProduct);
  } catch (error) {
    console.error('Error in uploadImages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


*/


  
  

module.exports = {
    createProduct,
    getaProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishList,
    rating,
    uploadImagesToCloudinary
};