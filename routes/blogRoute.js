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
     uploadImages
     } = require('../controller/blogCtrl');

const {
    uploadPhoto,
    blogImgResize,
} = require('../middlewares/uploadImages');

router.put('/likes', authMiddleware, likeBlog);
router.put('/dislikes', authMiddleware, disLikeBlog);
router.post('/', authMiddleware, isAdmin, createBlog);
router.put(
    '/upload/:id', 
    authMiddleware, 
    isAdmin, 
    uploadPhoto.array('images', 2),
    blogImgResize,
    uploadImages
);
router.put('/:id', authMiddleware, isAdmin, updateBlog);
router.get("/:id", getBlog);
router.get("/", getAllBlogs);
router.delete("/:id", authMiddleware, isAdmin, deleteBlog);



module.exports = router;