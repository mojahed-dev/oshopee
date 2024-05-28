const Product = require('../models/productModel');
const User = require('../models/userModel');
const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const { query } = require('express');

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
  const { star, prodId } = req.body;
  
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
                  $set: { "ratings.$.star": star },
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
  
  

module.exports = {
    createProduct,
    getaProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishList,
    rating,
};