import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateBoundaryRead } from "./staging-boundary-result.mjs";

test("broken deployments and network failures cannot pass denied reads", () => {
  for (const code of ["42P01", "42703", "PGRST205", "PGRST204", undefined]) {
    assert.equal(evaluateBoundaryRead({data:null,error:{code}},false),false);
  }
  assert.equal(evaluateBoundaryRead({data:null,error:null},false),false);
});
test("explicit privilege denial and RLS-filtered reads are classified correctly", () => {
  assert.equal(evaluateBoundaryRead({data:null,error:{code:"42501"}},false),true);
  assert.equal(evaluateBoundaryRead({data:[],error:null},false),true);
  assert.equal(evaluateBoundaryRead({data:[{id:"fixture"}],error:null},false),false);
  assert.equal(evaluateBoundaryRead({data:[{id:"fixture"}],error:null},true),true);
  assert.equal(evaluateBoundaryRead({data:[],error:null},true),false);
  assert.equal(evaluateBoundaryRead({data:null,error:{code:"42501"}},true),false);
});
