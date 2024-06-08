const express = require('express');
const { 
    createUser, 
    loginUserCtrl, 
    getallUser, 
    getaUser, 
    deleteaUser, 
    updateaUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdmin,
    getWishList,
    saveAddress,
      
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();



router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.post('/admin-login', loginAdmin);
router.put("/password", authMiddleware, updatePassword);
router.post('/forgot-password-token', forgotPasswordToken);
router.put('/reset-password/:token', resetPassword);
router.get('/all-users', getallUser);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logout);
router.get('/wishlist', authMiddleware, getWishList);
router.get('/:id', authMiddleware, isAdmin, getaUser);
router.delete('/:id',  deleteaUser);
router.put('/edit-user', authMiddleware,  updateaUser);
router.put('/save-address', authMiddleware,  saveAddress);
router.put('/block-user/:id', authMiddleware, isAdmin,  blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin,  unblockUser);


module.exports = router;