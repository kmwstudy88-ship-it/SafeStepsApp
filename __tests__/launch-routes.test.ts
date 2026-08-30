import {
  isPublicLaunchRoute,
  launchRouteIsActive,
} from "../lib/navigation/launchRoutes";

describe("launch routes", () => {
  test("treats welcome and why-safesteps as public discovery routes", () => {
    expect(isPublicLaunchRoute("/welcome")).toBe(true);
    expect(isPublicLaunchRoute("/why-safesteps")).toBe(true);
  });

  test("does not mark protected dashboard routes as public", () => {
    expect(isPublicLaunchRoute("/dashboard")).toBe(false);
    expect(isPublicLaunchRoute("/assessment-system")).toBe(false);
  });

  test("matches nested launch routes for active navigation state", () => {
    expect(launchRouteIsActive("/programs/recommendation", "/programs")).toBe(true);
    expect(launchRouteIsActive("/assessment-system/report-output", "/assessment-system")).toBe(true);
    expect(launchRouteIsActive("/why-safesteps", "/dashboard")).toBe(false);
  });
});
