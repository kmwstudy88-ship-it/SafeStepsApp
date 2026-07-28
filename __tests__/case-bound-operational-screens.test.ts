import fs from "node:fs";
import path from "node:path";

const screens = [
  "app/documents/index.tsx",
  "app/sessions/index.tsx",
  "app/referrals/index.tsx",
];

describe("case-bound operational screens", () => {
  test.each(screens)("%s uses the authorised sensitive-route case", (relativePath) => {
    const source = fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

    expect(source).toContain("useSensitiveAccess");
    expect(source).toContain("access?.caseId");
    expect(source).not.toContain('placeholder="Case ID"');
  });
});
