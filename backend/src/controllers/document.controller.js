const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { extractTextFromPDF } = require('../services/pdf.service');
const { analyzeComplianceDocument } = require('../services/gemini.service');

const backendRoot = path.resolve(__dirname, '..', '..');

const toDocumentResponse = (document, options = {}) => ({
  id: document._id.toString(),
  title: document.title,
  originalFileName: document.originalFileName,
  filePath: document.filePath,
  fileSize: document.fileSize,
  mimeType: document.mimeType,
  uploadedBy: document.uploadedBy.toString(),
  status: document.status,
  processingStatus: document.processingStatus,
  analysisStatus: document.analysisStatus,
  summary: document.summary,
  obligations: document.obligations || [],
  obligationsCount: document.obligations?.length || 0,
  rawTextLength: document.rawText?.length || 0,
  ...(options.includeRawText ? { rawText: document.rawText || '' } : {}),
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
});

const toAnalysisResponse = (document) => ({
  success: true,
  documentId: document._id.toString(),
  title: document.title,
  summary: document.summary || '',
  analysisStatus: document.analysisStatus,
  obligations: document.obligations || [],
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
      filePath: normalizeFilePath(path.relative(backendRoot, req.file.path)),
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
      document: toDocumentResponse(document, { includeRawText: true }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
    });
  }
};

const getDocumentAnalysis = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid document id',
    });
  }

  try {
    const document = await Document.findById(id)
      .select('title summary analysisStatus obligations uploadedBy')
      .lean();

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    if (document.uploadedBy.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    return res.status(200).json(toAnalysisResponse(document));
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch document analysis',
    });
  }
};

const extractDocumentText = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid document id',
    });
  }

  let document;

  try {
    document = await Document.findOne({
      _id: id,
      uploadedBy: req.user.userId,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    document.processingStatus = 'processing';
    document.status = 'processing';
    await document.save();

    const absoluteFilePath = path.resolve(backendRoot, document.filePath);

    console.log('PDF EXTRACTION DOCUMENT ID:', document._id.toString());
    console.log('PDF EXTRACTION FILE PATH:', absoluteFilePath);

    const rawText = await extractTextFromPDF(absoluteFilePath);

    document.rawText = rawText;
    document.processingStatus = 'completed';
    document.status = 'processed';
    await document.save();

    console.log('PDF EXTRACTION TEXT LENGTH:', rawText.length);

    return res.status(200).json({
      success: true,
      textLength: rawText.length,
      processingStatus: document.processingStatus,
    });
  } catch (error) {
    console.error('PDF EXTRACTION ERROR:', error);

    if (document) {
      document.processingStatus = 'failed';
      document.status = 'failed';
      await document.save().catch((saveError) => {
        console.error('PDF EXTRACTION STATUS UPDATE ERROR:', saveError);
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to extract text from document',
    });
  }
};

const analyzeDocument = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid document id',
    });
  }

  let document;

  try {
    document = await Document.findOne({
      _id: id,
      uploadedBy: req.user.userId,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    if (!document.rawText || !document.rawText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Document text has not been extracted',
      });
    }

    document.analysisStatus = 'processing';
    await document.save();

    console.log('GEMINI ANALYSIS DOCUMENT ID:', document._id.toString());
    console.log('GEMINI ANALYSIS RAW TEXT LENGTH:', document.rawText.length);

    const analysis = await analyzeComplianceDocument(document.rawText);

    document.summary = analysis.summary;
    document.obligations = analysis.obligations;
    document.analysisStatus = 'completed';
    await document.save();

    console.log('GEMINI ANALYSIS SUMMARY LENGTH:', analysis.summary.length);
    console.log('GEMINI ANALYSIS OBLIGATIONS COUNT:', analysis.obligations.length);

    return res.status(200).json({
      success: true,
      summary: document.summary,
      obligationsCount: document.obligations.length,
    });
  } catch (error) {
    console.error('GEMINI ANALYSIS ERROR:', error);

    if (document) {
      document.analysisStatus = 'failed';
      await document.save().catch((saveError) => {
        console.error('GEMINI ANALYSIS STATUS UPDATE ERROR:', saveError);
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to analyze document',
    });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  getDocumentAnalysis,
  extractDocumentText,
  analyzeDocument,
};
