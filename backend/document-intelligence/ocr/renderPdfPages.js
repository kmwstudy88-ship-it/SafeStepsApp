"use strict";

const { execFile } = require("child_process");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

function pdftoppm(pdfPath, outPrefix) {
  return new Promise((resolve, reject) => {
    execFile("pdftoppm", ["-png", "-r", "300", pdfPath, outPrefix], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function renderPdfToPageBuffers(pdfBuffer) {
  let tmpDir = null;
  try {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "docintel-pdf-"));
    const pdfPath = path.join(tmpDir, "input.pdf");
    const outPrefix = path.join(tmpDir, "page");
    await fs.writeFile(pdfPath, pdfBuffer);
    await pdftoppm(pdfPath, outPrefix);

    const files = (await fs.readdir(tmpDir)).filter((f) => f.startsWith("page") && f.endsWith(".png")).sort();
    const buffers = [];
    for (const f of files) buffers.push(await fs.readFile(path.join(tmpDir, f)));
    return buffers;
  } catch (_err) {
    // If pdftoppm is not installed on host, treat the PDF as single buffer for text fallback
    return [pdfBuffer];
  } finally {
    if (tmpDir) {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

module.exports = { renderPdfToPageBuffers };
