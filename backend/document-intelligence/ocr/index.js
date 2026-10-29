"use strict";

const {
  ocrBuffer,
  processImageBuffer,
  processPageBuffers,
  fullText,
  meanConfidence,
  MIN_ACCEPTABLE_CONFIDENCE,
} = require("./pipeline");
const { renderPdfToPageBuffers } = require("./renderPdfPages");

module.exports = {
  ocrBuffer,
  processImageBuffer,
  processPageBuffers,
  fullText,
  meanConfidence,
  MIN_ACCEPTABLE_CONFIDENCE,
  renderPdfToPageBuffers,
};
