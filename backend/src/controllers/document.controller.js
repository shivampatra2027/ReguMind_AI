const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const Document = require('../models/Document');

const toDocumentResponse = (document) => ({
  id: document._id.toString(),
  title: document.title,
  originalFileName: document.originalFileName,
  filePath: document.filePath,
  fileSize: document.fileSize,
  mimeType: document.mimeType,
  uploadedBy: document.uploadedBy.toString(),
  status: document.status,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
});

const normalizeFilePath = (filePath) => filePath.split(path.sep).join('/');

const removeUploadedFile = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Failed to clean up uploaded file:', error);
    }
  }
};

const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'PDF file is required',
    });
  }

  const fallbackTitle = path.parse(req.file.originalname).name;
  const title = (req.body.title || fallbackTitle).trim();

  if (!title) {
    await removeUploadedFile(req.file.path);

    return res.status(400).json({
      success: false,
      message: 'Document title is required',
    });
  }

  try {
    const document = await Document.create({
      title,
      originalFileName: req.file.originalname,
      filePath: normalizeFilePath(path.relative(path.resolve(__dirname, '..', '..'), req.file.path)),
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.userId,
      status: 'uploaded',
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: toDocumentResponse(document),
    });
  } catch (error) {
    await removeUploadedFile(req.file.path);

    return res.status(500).json({
      success: false,
      message: 'Failed to upload document',
    });
  }
};

const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ uploadedBy: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents: documents.map(toDocumentResponse),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
    });
  }
};

const getDocumentById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid document id',
    });
  }

  try {
    const document = await Document.findOne({
      _id: id,
      uploadedBy: req.user.userId,
    }).lean();

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    return res.status(200).json({
      success: true,
      document: toDocumentResponse(document),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
    });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
};
