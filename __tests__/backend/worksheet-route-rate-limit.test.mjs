import { readFile } from "node:fs/promises";

import { expect, test } from "@jest/globals";

test("rate limits worksheet requests before authentication", async () => {
  const source = await readFile("backend/server.js", "utf8");

  expect(source).toMatch(
    /app\.use\(\s*"\/worksheets"\s*,\s*userApiRateLimit\s*,\s*requireAuthenticatedUser\s*,\s*worksheetRoutes\s*\)/,
  );
});
