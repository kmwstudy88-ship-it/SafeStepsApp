import { validDeliveryChallenge } from "../lib/reportDeliveryChallenge";
describe("report delivery challenge",()=>{
 test("requires an opaque 24-byte hex token and six-digit code",()=>{
  expect(validDeliveryChallenge("a".repeat(48),"123456")).toBe(true);
  expect(validDeliveryChallenge("a".repeat(47),"123456")).toBe(false);
  expect(validDeliveryChallenge("a".repeat(48),"12345")).toBe(false);
 });
});
