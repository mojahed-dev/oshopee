const express = require("express");
const { 
    createProduct,
    getaProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishList,
    rating,
    uploadImages,
    
} = require('../controller/productCtrl');
const {
    uploadPhoto,
    productImgResize
} = require('../middlewares/uploadImages');
const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, isAdmin, createProduct);
router.put(
    '/upload/:id', 
    authMiddleware, 
    isAdmin, 
    uploadPhoto.array('images', 10),
    productImgResize
);
router.get('/:id', getaProduct);
router.put('/rating', authMiddleware, rating); 
router.put('/wishlist', authMiddleware, addToWishList);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);
router.get('/', getAllProduct);
 



module.exports = router;    