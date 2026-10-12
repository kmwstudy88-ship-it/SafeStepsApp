import { STAGING_ROLE_MATRIX, assertSafeStagingTarget } from "../lib/stagingVerification";

describe("staging verification safety",()=>{
 test("refuses the connected live project",()=>{
  expect(()=>assertSafeStagingTarget("https://yzxotxbwgxnxemkzigse.supabase.co")).toThrow("Refusing");
 });
 test("accepts a separate Supabase staging project",()=>{
  expect(assertSafeStagingTarget("https://safestepsstage123.supabase.co")).toBe("safestepsstage123");
 });
 test("covers every required real-role boundary",()=>{
  expect(STAGING_ROLE_MATRIX.map((item)=>item.role)).toEqual([
   "parent","child","caseworker","supervisor","court_viewer","unrelated","anonymous",
  ]);
 });
});
