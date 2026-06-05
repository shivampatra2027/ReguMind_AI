const fs = require('fs/promises');
const { PDFParse } = require('pdf-parse');

const extractTextFromPDF = async (filePath) => {
  const dataBuffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: dataBuffer });

  try {
    const parsedPdf = await parser.getText();
    return parsedPdf.text || '';
  } finally {
    await parser.destroy();
  }
};

module.exports = {
  extractTextFromPDF,
};
