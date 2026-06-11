const express = require('express');
const multer = require('multer');

const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  getDocumentAnalysis,
  extractDocumentText,
  analyzeDocument,
  generateMAP,
  generateRiskScore,
  uploadEvidence,
  validateDocumentCompliance,
} = require('../controllers/document.controller');

const { upload, evidenceUpload } = require('../config/multer');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'PDF file must be 10MB or smaller'
          : error.field || 'Invalid upload';

      return res.status(400).json({
        success: false,
        message,
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
router.post('/:id/extract', authMiddleware, extractDocumentText);
router.post('/:id/analyze', authMiddleware, analyzeDocument);
router.post('/:id/generate-map', authMiddleware, generateMAP);
router.post('/:id/generate-risk', authMiddleware, generateRiskScore);

// Validation Agent
router.post('/:id/upload-evidence', authMiddleware, (req, res, next) => {
  evidenceUpload.single('file')(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'File must be 10MB or smaller'
          : error.field || 'Invalid upload';

      return res.status(400).json({ success: false, message });
    }

    return res.status(500).json({ success: false, message: 'Failed to process upload' });
  });
}, uploadEvidence);
router.post('/:id/validate', authMiddleware, validateDocumentCompliance);

router.get('/:id/analysis', authMiddleware, getDocumentAnalysis);
router.get('/:id', authMiddleware, getDocumentById);

module.exports = router;
