import { readFile } from "node:fs/promises";

import { expect, test } from "@jest/globals";

test("case authorization never trusts user-editable metadata", async () => {
  const source = await readFile("lib/security/caseAccess.ts", "utf8");

  expect(source).not.toContain("user.user_metadata?.role");
  expect(source).toContain("user.app_metadata?.role");
  expect(source).toContain('from("user_roles")');
});
