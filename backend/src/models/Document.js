const mongoose = require('mongoose');

const mapSchema = new mongoose.Schema(
  {
    obligationTitle: {
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
    owner: {
      type: String,
      default: '',
      trim: true,
    },
    estimatedEffort: {
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
    analysisStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

documentSchema.index({ uploadedBy: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
