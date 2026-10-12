import type { AppRole } from "./types";

export function canManagePlatformContent(role: AppRole | null | undefined): boolean {
  return role === "admin";
}

export function canCreateFacilitatorNotes(role: AppRole | null | undefined): boolean {
  return role === "admin" || role === "facilitator" || role === "caseworker";
}

export function canViewPrivateFacilitatorNotes(role: AppRole | null | undefined): boolean {
  return role === "admin" || role === "facilitator" || role === "caseworker";
}

export function canViewCourtReports(role: AppRole | null | undefined): boolean {
  return role === "admin" || role === "facilitator" || role === "caseworker" || role === "court_viewer";
}

export function canParentSeeNote(visibility: string, isLearner: boolean): boolean {
  return isLearner && visibility === "shared_with_parent";
}

export function assertCanManageContent(role: AppRole | null | undefined): void {
  if (!canManagePlatformContent(role)) {
    throw new Error("Only an admin can create or edit programs, courses, lessons, resources, and bundles.");
  }
}

export function assertCanCreateFacilitatorNote(role: AppRole | null | undefined): void {
  if (!canCreateFacilitatorNotes(role)) {
    throw new Error("Only facilitators, caseworkers, or admins can create facilitator notes.");
  }
}