const express = require('express');

const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const {
     createBlog, 
     updateBlog, 
     getBlog, 
     getAllBlogs, 
     deleteBlog, 
     likeBlog, 
     disLikeBlog, 
     uploadImagesToCloudinary
     } = require('../controller/blogCtrl');

const {
    upload,
    resizeImages,
} = require('../middlewares/uploadImages');

router.put('/likes', authMiddleware, likeBlog);
router.put('/dislikes', authMiddleware, disLikeBlog);
router.post('/', authMiddleware, isAdmin, createBlog);
router.put(
    '/upload/:id', 
    authMiddleware, 
    isAdmin, 
    upload.array('blogImages', 2),
    resizeImages,
    uploadImagesToCloudinary
);
router.put('/:id', authMiddleware, isAdmin, updateBlog);
router.get("/:id", getBlog);
router.get("/", getAllBlogs);
router.delete("/:id", authMiddleware, isAdmin, deleteBlog);



module.exports = router;