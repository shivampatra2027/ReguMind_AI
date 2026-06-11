const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.resolve(__dirname, '..', '..', 'uploads');
const maxFileSize = 10 * 1024 * 1024;

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, uniqueName);
  },
});

const fileFilterPdfOnly = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isPdf = file.mimetype === 'application/pdf' && extension === '.pdf';

  if (!isPdf) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only PDF files are allowed'));
  }

  return cb(null, true);
};

const fileFilterPdfOrTxt = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isPdf = file.mimetype === 'application/pdf' && extension === '.pdf';
  const isTxt = (file.mimetype === 'text/plain' || extension === '.txt');

  if (!(isPdf || isTxt)) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only PDF or TXT files are allowed'));
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter: fileFilterPdfOnly,
  limits: {
    fileSize: maxFileSize,
    files: 1,
  },
});

const evidenceUpload = multer({
  storage,
  fileFilter: fileFilterPdfOrTxt,
  limits: {
    fileSize: maxFileSize,
    files: 1,
  },
});

module.exports = {
  upload,
  evidenceUpload,
  uploadDir,
};
