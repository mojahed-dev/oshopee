const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const { 
    createEnquiry,
    updateEnquiry,
    deleteEnquiry,
    getEnquiry,
    getallEnquiry
} = require('../controller/enqCtrl');

router.post('/', createEnquiry);
router.put('/:id', authMiddleware, isAdmin, updateEnquiry);
router.delete('/:id', authMiddleware, isAdmin, deleteEnquiry);
router.get('/:id', getEnquiry);
router.get('/', getallEnquiry);


module.exports = router;