import { normalizePrivateReportExpiry } from "../lib/privateReportDownload";
describe("private report download",()=>{
 test("defaults to a ten-minute signed URL",()=>expect(normalizePrivateReportExpiry()).toBe(600));
 test("caps links at ten minutes",()=>expect(normalizePrivateReportExpiry(3600)).toBe(600));
 test("requires at least one minute",()=>expect(normalizePrivateReportExpiry(5)).toBe(60));
});
