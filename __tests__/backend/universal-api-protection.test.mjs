import {
  PUBLIC_API_ROUTES,
  isPublicApiRequest,
} from "../../backend/middleware/universalApiProtection.js";

describe("universal API protection policy", () => {
  test.each([
    ["GET", "/health"],
    ["POST", "/auth/child/login"],
    ["POST", "/auth/parent/login"],
    ["POST", "/auth/caseworker/login"],
  ])("allows the explicit public endpoint %s %s", (method, path) => {
    expect(isPublicApiRequest(method, path)).toBe(true);
  });

  test.each([
    ["POST", "/health"],
    ["GET", "/auth/child/login"],
    ["GET", "/auth/session"],
    ["POST", "/auth/logout"],
    ["POST", "/documents/upload"],
    ["GET", "/documents/analysis/abc"],
    ["GET", "/worksheets"],
    ["GET", "/users/abc/curriculum"],
    ["POST", "/future-sensitive-engine"],
  ])("protects %s %s by default", (method, path) => {
    expect(isPublicApiRequest(method, path)).toBe(false);
  });

  test("normalizes query strings and trailing slashes without widening access", () => {
    expect(isPublicApiRequest("GET", "/health/?probe=1")).toBe(true);
    expect(isPublicApiRequest("POST", "/auth/child/login/?source=app")).toBe(true);
    expect(isPublicApiRequest("POST", "/auth/child/login/extra")).toBe(false);
  });

  test("contains no wildcard public routes", () => {
    expect(PUBLIC_API_ROUTES.every(({ path }) => !path.includes("*"))).toBe(true);
  });
});
