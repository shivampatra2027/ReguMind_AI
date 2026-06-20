const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { extractTextFromPDF } = require('../services/pdf.service');
const {
  analyzeComplianceDocument,
  generateManagementActionPlans,
  generateRiskAssessment,
  validateComplianceCompletion,
} = require('../services/ollama.service');

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
  mapStatus: document.mapStatus,
  riskStatus: document.riskStatus || 'pending',
  summary: document.summary,
  obligations: document.obligations || [],
  obligationsCount: document.obligations?.length || 0,
  maps: document.maps || [],
  mapsCount: document.maps?.length || 0,
  risks: document.risks || [],
  risksCount: document.risks?.length || 0,
  overallRiskScore: document.overallRiskScore || 0,
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
  mapStatus: document.mapStatus || 'pending',
  maps: document.maps || [],
  riskStatus: document.riskStatus || 'pending',
  risks: document.risks || [],
  overallRiskScore: document.overallRiskScore || 0,
  evidenceFiles: (document.evidenceFiles || []).map((f) => ({
    fileName: f.fileName || '',
    uploadedAt: f.uploadedAt || null,
    fileType: f.fileType || '',
    extractionStatus: f.extractionStatus || 'pending',
    preview: f.extractedText ? String(f.extractedText).slice(0, 500) : '',
  })),
  validationStatus: document.validationStatus || 'pending',
  validationResult: document.validationResult || { status: '', confidence: 0, reason: '' },
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
  console.error('UPLOAD ERROR:', error);

  await removeUploadedFile(req.file.path);

  return res.status(500).json({
    success: false,
    message: error.message,
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
      .select(
        'title summary analysisStatus obligations mapStatus maps riskStatus risks overallRiskScore uploadedBy'
      )
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

    console.log('ANALYSIS RESPONSE MAP STATUS', document.mapStatus);
    console.log('ANALYSIS RESPONSE MAP COUNT', document.maps?.length);

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

    console.log('OLLAMA ANALYSIS DOCUMENT ID:', document._id.toString());
    console.log('OLLAMA ANALYSIS RAW TEXT LENGTH:', document.rawText.length);

    const analysis = await analyzeComplianceDocument(document.rawText);

    document.summary = analysis.summary;
    document.obligations = analysis.obligations;
    document.analysisStatus = 'completed';
    await document.save();

    console.log('OLLAMA ANALYSIS SUMMARY LENGTH:', analysis.summary.length);
    console.log('OLLAMA ANALYSIS OBLIGATIONS COUNT:', analysis.obligations.length);

    return res.status(200).json({
      success: true,
      summary: document.summary,
      obligationsCount: document.obligations.length,
    });
  } catch (error) {
    console.error('OLLAMA ANALYSIS ERROR:', error);

    if (document) {
      document.analysisStatus = 'failed';
      await document.save().catch((saveError) => {
        console.error('OLLAMA ANALYSIS STATUS UPDATE ERROR:', saveError);
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to analyze document',
    });
  }
};

const generateMAP = async (req, res) => {
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
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    if (document.analysisStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Document analysis must be completed before generating MAP',
      });
    }

    const obligations = document.obligations || [];

    if (obligations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No obligations found for this document',
      });
    }

    console.log('MAP GENERATION DOCUMENT ID:', document._id.toString());
    console.log('OBLIGATIONS COUNT:', obligations.length);

    const maps = await generateManagementActionPlans(
      document.summary || '',
      obligations
    );

    document.maps = maps;
    document.mapStatus = 'completed';
    console.log('MAPS BEFORE SAVE', maps);
    console.log('MAP STATUS BEFORE SAVE', document.mapStatus);

    const savedDocument = await document.save();

    console.log('MAPS GENERATED:', maps.length);
    console.log('MAP STATUS AFTER SAVE', savedDocument.mapStatus);
    console.log('MAP COUNT AFTER SAVE', savedDocument.maps?.length);

    return res.status(200).json({
      success: true,
      mapsGenerated: maps.length,
      mapStatus: 'completed',
    });
  } catch (error) {
    console.error('MAP GENERATION ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to generate management action plan',
    });
  }
};

const generateRiskScore = async (req, res) => {
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

    if (document.analysisStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Document analysis must be completed before generating risk score',
      });
    }

    const obligations = document.obligations || [];
    const maps = document.maps || [];

    if (obligations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No obligations found for this document',
      });
    }

    if (maps.length === 0 || document.mapStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Management Action Plan must be completed before generating risk score',
      });
    }

    document.riskStatus = 'processing';
    await document.save();

    console.log('RISK GENERATION DOCUMENT ID:', document._id.toString());
    console.log('OBLIGATIONS COUNT:', obligations.length);

    const riskAssessment = await generateRiskAssessment(obligations, maps);

    document.risks = riskAssessment.risks;
    document.overallRiskScore = riskAssessment.overallRiskScore;
    document.riskStatus = 'completed';
    await document.save();

    console.log('RISKS GENERATED:', document.risks.length);
    console.log('OVERALL RISK SCORE:', document.overallRiskScore);

    return res.status(200).json({
      success: true,
      overallRiskScore: document.overallRiskScore,
      risksGenerated: document.risks.length,
    });
  } catch (error) {
    console.error('RISK GENERATION ERROR:', error);

    if (document) {
      document.riskStatus = 'failed';
      await document.save().catch((saveError) => {
        console.error('RISK GENERATION STATUS UPDATE ERROR:', saveError);
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to generate risk score',
    });
  }
};

const uploadEvidence = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid document id' });
  }

  let document;
  try {
    document = await Document.findOne({ _id: id, uploadedBy: req.user.userId });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Evidence file is required' });
    }

    const absolutePath = path.resolve(backendRoot, normalizeFilePath(req.file.path));
    const fileName = req.file.originalname;
    const filePathRel = normalizeFilePath(req.file.path);
    const ext = path.extname(fileName || '').toLowerCase();
    const mime = req.file.mimetype || '';

    let extractedText = '';
    let extractionStatus = 'failed';

    try {
      if (ext === '.txt' || mime === 'text/plain') {
        // Read text file
        const buf = await fs.readFile(absolutePath, 'utf8');
        extractedText = String(buf || '').trim();
      } else {
        // Fall back to PDF extraction for other types (pdf expected)
        extractedText = await extractTextFromPDF(absolutePath);
      }
    } catch (err) {
      console.error('EVIDENCE EXTRACTION ERROR:', err);
      extractedText = '';
    }

    console.log('EVIDENCE TEXT LENGTH:', (extractedText || '').length);

    if (extractedText && String(extractedText).trim().length >= 50) {
      extractionStatus = 'success';
      console.log('EVIDENCE EXTRACTION SUCCESS:', fileName);
    } else {
      extractionStatus = 'failed';
      console.log('EVIDENCE EXTRACTION FAILED:', fileName);
    }

    const evidenceEntry = {
      fileName,
      filePath: filePathRel,
      uploadedAt: new Date(),
      fileType: mime || ext.replace('.', ''),
      extractedText: extractedText || '',
      extractionStatus,
    };

    // Keep evidenceFiles as additive history
    document.evidenceFiles = Array.isArray(document.evidenceFiles)
      ? [...document.evidenceFiles, evidenceEntry]
      : [evidenceEntry];

    await document.save();

    if (extractionStatus === 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Evidence contains insufficient readable text.',
      });
    }

    return res.status(200).json({
      success: true,
      evidenceFilesCount: document.evidenceFiles.length,
    });
  } catch (error) {
    console.error('UPLOAD EVIDENCE ERROR:', error);

    return res.status(500).json({ success: false, message: 'Failed to upload evidence' });
  }
};

const validateDocumentCompliance = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid document id' });
  }

  let document;

  try {
    document = await Document.findOne({ _id: id, uploadedBy: req.user.userId });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Validation rules (per AGENT.md)
    if (document.mapStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Management Action Plan must be completed before validation',
      });
    }


    const evidenceFiles = Array.isArray(document.evidenceFiles)
      ? document.evidenceFiles
      : [];

    if (evidenceFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one evidence file must be uploaded before validation',
      });
    }

    // Aggregate extracted text from stored evidence entries
    const evidenceTextChunks = [];
    for (const ev of evidenceFiles) {
      if (ev && ev.extractedText) {
        evidenceTextChunks.push(String(ev.extractedText));
      }
    }

    const evidenceText = evidenceTextChunks.join('\n\n');

    // Guardrail: do not call Ollama if extracted text is insufficient
    if (!evidenceText || evidenceText.trim().length < 50) {
      document.validationStatus = 'incomplete';
      document.validationResult = {
        status: 'incomplete',
        confidence: 0,
        reason: 'Evidence contains insufficient readable text.',
      };
      await document.save();

      console.log('VALIDATION ABORTED - INSUFFICIENT EVIDENCE TEXT LENGTH:', (evidenceText || '').length);

      return res.status(400).json({
        success: false,
        message: 'Evidence contains insufficient readable text.',
      });
    }

    document.validationStatus = 'processing';
    await document.save();

    const { status, confidence, reason } = await validateComplianceCompletion(
      document.maps || [],
      evidenceText
    );

    document.validationStatus = status || 'incomplete';
    document.validationResult = {
      status: status || 'incomplete',
      confidence: typeof confidence === 'number' ? confidence : 0,
      reason: reason || '',
    };

    await document.save();

    console.log('VALIDATION DOC ID:', document._id.toString());
    console.log('EVIDENCE FILE COUNT:', evidenceFiles.length);
    console.log('VALIDATION STATUS:', document.validationStatus);
    console.log('CONFIDENCE SCORE:', document.validationResult?.confidence);

    return res.status(200).json({
      success: true,
      validationStatus: document.validationStatus,
      validationResult: document.validationResult,
    });
  } catch (error) {
    console.error('VALIDATION ERROR:', error);

    if (document) {
      document.validationStatus = 'failed';
      await document.save().catch((saveError) => {
        console.error('VALIDATION STATUS UPDATE ERROR:', saveError);
      });
    }

    return res.status(500).json({ success: false, message: 'Failed to validate compliance' });
  }
};

module.exports = {
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
};
