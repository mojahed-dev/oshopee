const express = require("express");
const { 
    createProduct,
    getaProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishList,
    rating,
    uploadImagesToCloudinary,
    
} = require('../controller/productCtrl');
const {
    upload,
    resizeImages
} = require('../middlewares/uploadImages');
const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, isAdmin, createProduct);
router.put(
    '/upload/:id', 
    authMiddleware, 
    isAdmin, 
    upload.array('productImages', 10), resizeImages, uploadImagesToCloudinary
);
router.get('/:id', getaProduct);
router.put('/rating', authMiddleware, rating); 
router.put('/wishlist', authMiddleware, addToWishList);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);
router.get('/', getAllProduct);
 



module.exports = router;    