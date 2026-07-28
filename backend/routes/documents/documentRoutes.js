import express from 'express';
import multer from 'multer';

import { requireAuthenticatedUser } from '../../middleware/requireAuthenticatedUser.js';
import {
  DOCUMENT_INTELLIGENCE_MAX_TEXT_CHARS,
  DOCUMENT_INTELLIGENCE_SCHEMA_VERSION,
  analyzeDocument,
  documentIntelligenceSections,
} from '../../Services/DocumentIntelligence/DocumentService.js';

const router = express.Router();
const MAX_TEXT_BYTES = 2 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.get('/intelligence/schema', (_req, res) => {
  res.json({
    schemaVersion: DOCUMENT_INTELLIGENCE_SCHEMA_VERSION,
    maxTextBytes: MAX_TEXT_BYTES,
    maxTextCharacters: DOCUMENT_INTELLIGENCE_MAX_TEXT_CHARS,
    maxFileBytes: 10 * 1024 * 1024,
    supportedFileTypes: ['application/pdf', 'text/plain', 'text/csv', 'text/markdown', 'application/json'],
    sections: documentIntelligenceSections(),
  });
});

router.post('/analyze', requireAuthenticatedUser, upload.single('file'), async (req, res, next) => {
  try {
    if (process.env.SAFESTEPS_OPENAI_CONFIGURED !== 'true') {
      throw serviceUnavailable('Set OPENAI_KEY or OPENAI_API_KEY before running document intelligence.');
    }

    const text = await documentTextFromRequest(req);
    const result = await analyzeDocument(text);

    res.json({
      source: {
        mode: req.file ? 'file' : 'text',
        fileName: req.file?.originalname ?? null,
        mimeType: req.file?.mimetype ?? null,
        textLength: text.length,
      },
      result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

async function documentTextFromRequest(req) {
  const bodyText = typeof req.body?.text === 'string' ? req.body.text.trim() : '';

  if (bodyText) {
    assertTextSize(bodyText);
    return bodyText;
  }

  if (!req.file) {
    throw badRequest('Send document text in the text field or upload a supported document file.');
  }

  const mimeType = req.file.mimetype ?? '';

  if (mimeType === 'application/pdf' || req.file.originalname?.toLowerCase().endsWith('.pdf')) {
    return textFromPdf(req.file.buffer);
  }

  if (isTextLikeFile(mimeType, req.file.originalname)) {
    const text = req.file.buffer.toString('utf8').trim();
    assertTextSize(text);
    if (!text) {
      throw badRequest('The uploaded document did not contain readable text.');
    }

    return text;
  }

  throw badRequest('Unsupported document type. Use PDF, TXT, CSV, Markdown, JSON, or paste the document text.');
}

async function textFromPdf(buffer) {
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: buffer });

  try {
    const parsed = await parser.getText();
    const text = parsed.text.trim();
    assertTextSize(text);

    if (!text) {
      throw badRequest('The uploaded PDF did not contain extractable text.');
    }

    return text;
  } finally {
    await parser.destroy();
  }
}

function assertTextSize(text) {
  if (Buffer.byteLength(text, 'utf8') > MAX_TEXT_BYTES) {
    throw badRequest('Document text is too large for review. Submit a shorter extract under 2 MB.');
  }
}

function isTextLikeFile(mimeType, fileName = '') {
  const lowerName = fileName.toLowerCase();

  return (
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.csv') ||
    lowerName.endsWith('.md') ||
    lowerName.endsWith('.json')
  );
}

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function serviceUnavailable(message) {
  const error = new Error(message);
  error.statusCode = 503;
  return error;
}
