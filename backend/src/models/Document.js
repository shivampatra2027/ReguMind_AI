const mongoose = require('mongoose');

const mapSchema = new mongoose.Schema(
  {
    obligationTitle: {
      type: String,
      default: '',
      trim: true,
    },
    objective: {
      type: String,
      default: '',
      trim: true,
    },
    owner: {
      type: String,
      default: '',
      trim: true,
    },
    actionPlan: [
      {
        type: String,
        trim: true,
      },
    ],
    deliverables: [
      {
        type: String,
        trim: true,
      },
    ],
    estimatedEffort: {
      type: String,
      default: 'Low',
      trim: true,
    },
    timeline: {
      type: String,
      default: 'Not specified',
      trim: true,
    },
  },
  { _id: false }
);

const riskSchema = new mongoose.Schema(
  {
    obligationTitle: {
      type: String,
      default: '',
      trim: true,
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
    },
    reason: {
      type: String,
      default: '',
      trim: true,
    },
    impact: {
      type: String,
      default: '',
      trim: true,
    },
    mitigation: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    mimeType: {
      type: String,
      required: true,
      enum: ['application/pdf'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'processed', 'failed'],
      default: 'uploaded',
    },
    rawText: {
      type: String,
      default: '',
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    summary: {
      type: String,
      default: '',
      trim: true,
    },
    obligations: [
      {
        title: {
          type: String,
          default: '',
          trim: true,
        },
        description: {
          type: String,
          default: '',
          trim: true,
        },
        department: {
          type: String,
          default: '',
          trim: true,
        },
        priority: {
          type: String,
          default: '',
          trim: true,
        },
        deadline: {
          type: String,
          default: '',
          trim: true,
        },
      },
    ],
    maps: [mapSchema],
    mapStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    riskStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    risks: [riskSchema],
    overallRiskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    analysisStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },

    // Validation Agent (evidence-based compliance completion)
    validationStatus: {
      type: String,
      default: 'pending',
      index: true,
    },
    validationResult: {
      status: {
        type: String,
        default: '',
        trim: true,
      },
      confidence: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      reason: {
        type: String,
        default: '',
        trim: true,
      },
    },
    evidenceFiles: [
      {
        fileName: {
          type: String,
          default: '',
          trim: true,
        },
        filePath: {
          type: String,
          default: '',
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        fileType: {
          type: String,
          default: '',
          trim: true,
        },
        extractedText: {
          type: String,
          default: '',
        },
        extractionStatus: {
          type: String,
          enum: ['pending', 'success', 'failed'],
          default: 'pending',
        },
      },
    ],

    // Keep field order stable for readability and future extensions
    // (Validation Agent fields are appended here intentionally)

  },
  { timestamps: true }
);

documentSchema.index({ uploadedBy: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
