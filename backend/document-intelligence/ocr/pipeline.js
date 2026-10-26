"use strict";

const Tesseract = require("tesseract.js");
const sharp = require("sharp");

const MIN_ACCEPTABLE_CONFIDENCE = 0.55;

async function preprocessImage(buffer) {
  return sharp(buffer).grayscale().normalize().sharpen().threshold(160).toBuffer();
}

async function ocrBuffer(buffer, lang = "eng") {
  const processed = await preprocessImage(buffer);
  const { data } = await Tesseract.recognize(processed, lang, { logger: () => {} });
  const confidence = (data.confidence || 0) / 100;
  return { text: data.text.trim(), confidence, needsReview: confidence < MIN_ACCEPTABLE_CONFIDENCE };
}

async function processImageBuffer(buffer, lang = "eng") {
  const result = await ocrBuffer(buffer, lang);
  return [{ pageNumber: 1, ...result }];
}

async function processPageBuffers(pageBuffers, lang = "eng") {
  const pages = [];
  for (let i = 0; i < pageBuffers.length; i++) {
    const result = await ocrBuffer(pageBuffers[i], lang);
    pages.push({ pageNumber: i + 1, ...result });
  }
  return pages;
}

function fullText(pages) {
  return pages.map((p) => `[Page ${p.pageNumber}]\n${p.text}`).join("\n\n");
}

function meanConfidence(pages) {
  if (!pages.length) return 0;
  return pages.reduce((sum, p) => sum + p.confidence, 0) / pages.length;
}

module.exports = { ocrBuffer, processImageBuffer, processPageBuffers, fullText, meanConfidence, MIN_ACCEPTABLE_CONFIDENCE };