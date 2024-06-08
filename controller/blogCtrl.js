const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const cloudinaryUploadImg = require('../utils/cloudinary');
const fs = require('fs');

const createBlog = asyncHandler(async(req, res) => {
    try {
        const newBlog = await  Blog.create(req.body);
        res.json(newBlog);
    } catch (error) {
        throw new Error(error);
    }
});

const updateBlog = asyncHandler(async(req, res) => {
    const { id } =req.params;
    validateMongoDbId(id);

    try {
        const updateBlog = await  Blog.findByIdAndUpdate(id, req.body, {new:true});
        res.json(updateBlog);
    } catch (error) {
        throw new Error(error);
    }
});

const getBlog = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const getBlog = await Blog.findById(id)
        .populate("likes")
        .populate("dislikes");
        await Blog.findByIdAndUpdate(
            id,
            {
                $inc: { numViews: 1 },
            },
            {
                new: true,
            }
        );
        res.json(getBlog);
    } catch (error) {
        throw new Error(error);
    }
});


const  getAllBlogs = asyncHandler(async(req, res) => {
    try {
        const getBlogs = await  Blog.find();
        res.json(getBlogs);
    } catch (error) {
        throw new Error(error);
    }
});


const deleteBlog = asyncHandler(async(req, res) => {
    const { id } =req.params;
    validateMongoDbId(id);

    try {
        const deleteBlog = await  Blog.findByIdAndDelete(id);
        res.json(deleteBlog);
    } catch (error) {
        throw new Error(error);
    }
});


const likeBlog = asyncHandler(async(req, res) => {
    const { blogId } = req.body;
    validateMongoDbId(blogId);

    // find the blog which you want to like
    const blog = await Blog.findById(blogId);
    // find the login user
    const loginUserId = req?.user?._id;
    // find if the user has liked the post
    const isLiked = blog?.isLiked;
    // find if the has disliked the post
    const alreadyDisliked = blog?.disliked?.find(userId == userId.toString() === loginUserId?.toString());

    if(alreadyDisliked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { dislikes: loginUserId },
            isDisliked: false
        }, {
            new: true
        });
        res.json(blog);
    }

    if(isLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { likes: loginUserId },
            isLiked: false
        }, {
            new: true
        });
        res.json(blog);
    } else {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { likes: loginUserId },
            isLiked: true
        }, {
            new: true
        }); 
        res.json(blog);
    }
});

const disLikeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoDbId(blogId);
    // Find the blog which you want to be liked
    const blog = await Blog.findById(blogId);
    // find the login user
    const loginUserId = req?.user?._id;
    // find if the user has liked the blog
    const isDisLiked = blog?.isDisliked;
    // find if the user has disliked the blog
    const alreadyLiked = blog?.likes?.find(
      (userId) => userId?.toString() === loginUserId?.toString()
    );
    if (alreadyLiked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: loginUserId },
          isLiked: false,
        },
        { new: true }
      );
      res.json(blog);
    }
    if (isDisLiked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { dislikes: loginUserId },
          isDisliked: false,
        },
        { new: true }
      );
      res.json(blog);
    } else {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { dislikes: loginUserId },
          isDisliked: true,
        },
        { new: true }
      );
      res.json(blog);
    }
  });

  // const uploadImages = asyncHandler(async (req, res) => {
  //   const { id } = req.params;
  //   console.log('ID:', id);
  //   validateMongoDbId(id);
  
  //   try {
  //     const uploader = async (path) => {
  //       try {
  //         console.log('Uploading file:', path);
  //         const result = await cloudinaryUploadImg(path);
  //         console.log('Uploaded file to:', result);
  //         return result;
  //       } catch (error) {
  //         console.error('Error uploading to Cloudinary:', error);
  //         throw new Error('Failed to upload image to Cloudinary');
  //       }
  //     };
  
  //     const files = req.files;
  //     console.log('req.files:', files);
  
  //     if (!files || files.length === 0) {
  //       return res.status(400).json({ message: 'No files were uploaded.' });
  //     }
  
  //     const urls = [];
  //     for (const file of files) {
  //       const newPath = await uploader(file.path);
  //       urls.push(newPath);
  //       fs.unlinkSync(path);
  //     }
  
  //     console.log('URLs:', urls);
  
  //     const findBlog = await Blog.findByIdAndUpdate(
  //       id,
  //       { images: urls },
  //       { new: true }
  //     );
  
  //     console.log('Updated product:', findBlog);
  //     res.json(findBlog);
  //   } catch (error) {
  //     console.error('Error in uploadImages:', error);
  //     res.status(500).json({ message: 'Internal server error' });
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
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            { $push: { images: { $each: urls } } }, // Add the URLs to the images array
            { new: true } // Return the updated document
        );

        if (!updatedBlog) {
            return res.status(404).send('Blog not found');
        }

        // Respond with the Cloudinary URLs and the updated Blog
        res.status(200).json({
            message: 'Images uploaded and URLs added to the Blog successfully',
            urls,
            blog: updatedBlog
        });
    } catch (error) {
        // Log and handle the error
        console.error(`Error during image upload to Cloudinary: ${error}`);
        next(error);
    }
};


const uploadImages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const uploader = (path) => cloudinaryUploadImg(path, "images");
      const urls = [];
      const files = req.files;
      for (const file of files) {
        const { path } = file;
        const newpath = await uploader(path);
        console.log(newpath);
        urls.push(newpath);
        fs.unlinkSync(path);
      }
      const findBlog = await Blog.findByIdAndUpdate(
        id,
        {
          images: urls.map((file) => {
            return file;
          }),
        },
        {
          new: true,
        }
      );
      res.json(findBlog);
    } catch (error) {
      throw new Error(error);
    }
  });
  

module.exports ={
    createBlog,
    updateBlog,
    getBlog,
    getAllBlogs,
    deleteBlog,
    likeBlog,
    disLikeBlog,
    uploadImagesToCloudinary,
    uploadImages
}