
const express = require('express');
const multer = require('multer');

const {
  uploadDocument,
  getDocuments,
  getDocumentById,
} = require('../controllers/document.controller');

const { upload } = require('../config/multer');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to process upload',
    });
  });
};

router.post('/upload', authMiddleware, handleUpload, uploadDocument);
router.get('/', authMiddleware, getDocuments);
router.get('/:id', authMiddleware, getDocumentById);

module.exports = router;