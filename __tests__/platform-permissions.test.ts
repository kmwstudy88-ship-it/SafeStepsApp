import { canCreateFacilitatorNotes, canManagePlatformContent, canParentSeeNote, canViewCourtReports } from "../lib/platform/permissions";

describe("platform permissions", () => {
  test("only admin can manage content", () => {
    expect(canManagePlatformContent("admin")).toBe(true);
    expect(canManagePlatformContent("facilitator")).toBe(false);
    expect(canManagePlatformContent("parent")).toBe(false);
  });

  test("facilitator notes are staff only", () => {
    expect(canCreateFacilitatorNotes("admin")).toBe(true);
    expect(canCreateFacilitatorNotes("facilitator")).toBe(true);
    expect(canCreateFacilitatorNotes("caseworker")).toBe(true);
    expect(canCreateFacilitatorNotes("parent")).toBe(false);
  });

  test("parent sees only shared notes for their own enrolment", () => {
    expect(canParentSeeNote("shared_with_parent", true)).toBe(true);
    expect(canParentSeeNote("private_facilitator", true)).toBe(false);
    expect(canParentSeeNote("shared_with_parent", false)).toBe(false);
  });

  test("court reports can be viewed by court viewer and staff", () => {
    expect(canViewCourtReports("court_viewer")).toBe(true);
    expect(canViewCourtReports("admin")).toBe(true);
    expect(canViewCourtReports("parent")).toBe(false);
  });
});