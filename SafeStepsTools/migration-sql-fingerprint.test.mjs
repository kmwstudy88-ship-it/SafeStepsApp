import { test } from "node:test";
import assert from "node:assert/strict";
import { sqlFingerprint } from "./migration-sql-fingerprint.mjs";

test("ignores comments and empty recovery statements without merging SQL tokens", () => {
  assert.equal(sqlFingerprint("select /* outer /* inner */ end */ 1; -- end\n;"), sqlFingerprint("select 1"));
  assert.notEqual(sqlFingerprint("select ab"), sqlFingerprint("select a b"));
  assert.notEqual(sqlFingerprint("select 1;select 2"), sqlFingerprint("select 1 select 2"));
});

test("preserves string, quoted identifier and function-body contents", () => {
  for (const [a, b] of [["select 'a  b'", "select 'a b'"], ['select "A"', 'select "a"'], ["do $$begin -- keep\nend$$;", "do $$begin end$$;"]]) {
    assert.notEqual(sqlFingerprint(a), sqlFingerprint(b));
  }
  assert.equal(sqlFingerprint("select 'a''--b', E'escaped\\\'quote'"), sqlFingerprint("select  'a''--b',E'escaped\\\'quote';"));
  assert.notEqual(sqlFingerprint("select E'x'"), sqlFingerprint("select E 'x'"));
  assert.notEqual(sqlFingerprint("select 'a'\n'b'"), sqlFingerprint("select 'a' 'b'"));
  assert.notEqual(sqlFingerprint("select 'a'-- comment\n'b'"), sqlFingerprint("select 'a'/* comment */'b'"));
});

test("rejects unterminated SQL instead of claiming a match", () => {
  for (const sql of ["select 'x", "do $body$ x", "/* x"]) assert.throws(() => sqlFingerprint(sql));
});
