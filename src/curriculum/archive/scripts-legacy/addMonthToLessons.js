#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const Ajv = require("ajv");

const LESSON_GLOB = path.join(__dirname, "..", "packages", "content-courses", "**", "v*", "lessons", "*.json");
const SCHEMA_PATH = path.join(__dirname, "..", "packages", "content-schema", "lesson.schema.json");

function safeWrite(filePath, content) {
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + "\n", "utf8");
}

function main() {
  const schema = fs.existsSync(SCHEMA_PATH) ? JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8")) : null;
  const ajv = schema ? new Ajv({ allErrors: true }) : null;
  const validate = ajv ? ajv.compile(schema) : null;

  const files = glob.sync(LESSON_GLOB);
  if (!files.length) {
    console.log("No lesson files found at", LESSON_GLOB);
    process.exit(0);
  }

  let modified = 0;
  let errors = 0;

  files.forEach(file => {
    try {
      const raw = fs.readFileSync(file, "utf8");
      const lesson = JSON.parse(raw);

      if (typeof lesson.week !== "number") {
        console.warn(`Skipping ${file} — missing numeric week`);
        return;
      }

      const computedMonth = Math.ceil(lesson.week / 4) || 1;
      if (lesson.month !== computedMonth) {
        const bak = file + ".bak";
        if (!fs.existsSync(bak)) fs.writeFileSync(bak, raw, "utf8");
        lesson.month = computedMonth;
        safeWrite(file, lesson);
        modified++;
      }

      if (validate) {
        const valid = validate(lesson);
        if (!valid) {
          console.error(`Schema validation failed for ${file}:`, validate.errors);
          errors++;
        }
      }
    } catch (err) {
      console.error("Error processing", file, err);
      errors++;
    }
  });

  console.log(`Processed ${files.length} files. Modified: ${modified}. Errors: ${errors}.`);
  if (errors) process.exit(2);
}

main();
