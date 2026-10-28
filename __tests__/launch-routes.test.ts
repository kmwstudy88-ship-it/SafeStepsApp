import {
  isPublicLaunchRoute,
  launchRouteIsActive,
  PARENT_DASHBOARD_QUICK_ACTIONS,
  PARENT_MOBILE_NAV_ITEMS,
  PARENT_PRIMARY_NAV_ITEMS,
} from "../lib/navigation/launchRoutes";

describe("launch routes", () => {
  test("treats welcome and why-safesteps as public discovery routes", () => {
    expect(isPublicLaunchRoute("/welcome")).toBe(true);
    expect(isPublicLaunchRoute("/why-safesteps")).toBe(true);
  });

  test("does not mark protected dashboard routes as public", () => {
    expect(isPublicLaunchRoute("/dashboard")).toBe(false);
    expect(isPublicLaunchRoute("/assessment-system")).toBe(false);
    expect(isPublicLaunchRoute("/visits/transition-coach")).toBe(false);
    expect(isPublicLaunchRoute("/family-meeting/restorative-repair")).toBe(false);
  });

  test("matches nested launch routes for active navigation state", () => {
    expect(launchRouteIsActive("/programs/recommendation", "/programs")).toBe(true);
    expect(launchRouteIsActive("/assessment-system/report-output", "/assessment-system")).toBe(true);
    expect(launchRouteIsActive("/visits/transition-coach", "/visits/transition-coach")).toBe(true);
    expect(launchRouteIsActive("/why-safesteps", "/dashboard")).toBe(false);
  });

  test("surfaces companion hubs in primary navigation items without duplicates", () => {
    const hrefs = PARENT_PRIMARY_NAV_ITEMS.map((item) => String(item.href));
    const labels = PARENT_PRIMARY_NAV_ITEMS.map((item) => item.label);

    // Verify all 4 companion hubs are present
    expect(hrefs).toContain("/visits/transition-coach");
    expect(hrefs).toContain("/family-meeting/restorative-repair");
    expect(hrefs).toContain("/child/three-houses-playroom");
    expect(hrefs).toContain("/assessment-system/multi-informant-court-bridge");

    // Verify no duplicates
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(new Set(labels).size).toBe(labels.length);
  });

  test("surfaces mobile navigation items with valid paths and no duplicates", () => {
    const hrefs = PARENT_MOBILE_NAV_ITEMS.map((item) => String(item.href));
    expect(hrefs).toContain("/visits/transition-coach");
    expect(hrefs).toContain("/family-meeting/restorative-repair");
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  test("surfaces companion hubs in dashboard quick actions with icons", () => {
    const actionMap = new Map(PARENT_DASHBOARD_QUICK_ACTIONS.map((a) => [String(a.href), a]));

    expect(actionMap.has("/visits/transition-coach")).toBe(true);
    expect(actionMap.get("/visits/transition-coach")?.icon).toBe("⇄");

    expect(actionMap.has("/family-meeting/restorative-repair")).toBe(true);
    expect(actionMap.get("/family-meeting/restorative-repair")?.icon).toBe("🤝");

    expect(actionMap.has("/child/three-houses-playroom")).toBe(true);
    expect(actionMap.get("/child/three-houses-playroom")?.icon).toBe("🏡");

    expect(actionMap.has("/assessment-system/multi-informant-court-bridge")).toBe(true);
    expect(actionMap.get("/assessment-system/multi-informant-court-bridge")?.icon).toBe("⌖");

    for (const action of PARENT_DASHBOARD_QUICK_ACTIONS) {
      expect(action.label.length).toBeGreaterThan(0);
      expect(action.icon.length).toBeGreaterThan(0);
    }
  });
});
