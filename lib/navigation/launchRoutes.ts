import type { Href } from "expo-router";

export type LaunchNavItem = {
  label: string;
  href: Href;
};

export type LaunchQuickAction = LaunchNavItem & {
  icon: string;
};

export const PUBLIC_LAUNCH_ROUTES = [
  "/",
  "/welcome",
  "/why-safesteps",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/onboarding/how-safesteps-works",
  "/onboarding/privacy-parent-rights",
  "/onboarding/verify-account",
] as const;

export const PARENT_PRIMARY_NAV_ITEMS: readonly LaunchNavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Programs", href: "/programs" },
  { label: "Curriculum", href: "/library" },
  { label: "Challenges", href: "/challenges" },
  { label: "Tasks", href: "/tasks" },
  { label: "Evidence", href: "/evidence" },
  { label: "Assessments", href: "/assessment-system" },
  { label: "Reports", href: "/reports" },
  { label: "Resources", href: "/resources" },
  { label: "Referrals", href: "/referrals" },
  { label: "Settings", href: "/settings" },
] as const;

export const PARENT_MOBILE_NAV_ITEMS: readonly LaunchNavItem[] = [
  { label: "Home", href: "/dashboard" },
  { label: "Programs", href: "/programs" },
  { label: "Tasks", href: "/tasks" },
  { label: "Evidence", href: "/evidence" },
  { label: "Assessments", href: "/assessment-system" },
  { label: "Reports", href: "/reports" },
  { label: "Resources", href: "/resources" },
] as const;

export const PARENT_DASHBOARD_QUICK_ACTIONS: readonly LaunchQuickAction[] = [
  { label: "My Program", href: "/programs/recommendation", icon: "★" },
  { label: "Curriculum", href: "/library", icon: "▤" },
  { label: "Challenges", href: "/challenges", icon: "◎" },
  { label: "Tasks", href: "/tasks", icon: "✓" },
  { label: "Upload Evidence", href: "/evidence", icon: "↑" },
  { label: "Assessments", href: "/assessment-system", icon: "⌁" },
  { label: "Reports", href: "/reports", icon: "▣" },
  { label: "Resources", href: "/resources", icon: "?" },
] as const;

export const PARENT_EVIDENCE_ENTRY_POINTS: readonly LaunchNavItem[] = [
  { label: "Daily task uploads", href: "/tasks" },
  { label: "Evidence uploads", href: "/evidence" },
  { label: "Reflection uploads", href: "/growth" },
  { label: "Photo and document uploads", href: "/evidence-upload" },
] as const;

function normalizePathname(pathname: string) {
  const withoutQuery = pathname.split(/[?#]/, 1)[0] || "/";
  const withSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
}

export function isPublicLaunchRoute(pathname: string) {
  const normalized = normalizePathname(pathname);
  return PUBLIC_LAUNCH_ROUTES.includes(normalized as (typeof PUBLIC_LAUNCH_ROUTES)[number]);
}

export function launchRouteIsActive(pathname: string, href: Href) {
  const normalizedPath = normalizePathname(pathname);
  const normalizedHref = normalizePathname(String(href));
  return normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`);
}
