import { validateReportExportRequest } from "../lib/reportExport";

describe("report export controls",()=>{
 test("requires recipient authority and purpose",()=>{
  expect(validateReportExportRequest({authority:"",purpose:"court filing",expirySeconds:600}))
   .toBe("Recipient authority and export purpose are required.");
 });
 test("caps sensitive signed-link requests at ten minutes",()=>{
  expect(validateReportExportRequest({authority:"court order",purpose:"court filing",expirySeconds:601}))
   .toBe("Sensitive report links must expire within 1 to 10 minutes.");
 });
 test("allows a complete ten-minute request",()=>{
  expect(validateReportExportRequest({authority:"court order",purpose:"court filing",expirySeconds:600})).toBeNull();
 });
});
