import { readFileSync } from "node:fs";

// Produces SQL only. Never connects to a database or applies a migration.
const root = new URL("../", import.meta.url);
const fixture = readFileSync(new URL("SafeStepsTools/sql/p0-staging-rollback-authorization.sql",root),"utf8");
if (!/^rollback;\s*$/m.test(fixture)) throw new Error("Rollback terminator required.");
const args = process.argv.slice(2);
if (args.some(arg => arg !== "--candidate")) throw new Error("Only --candidate is supported.");
const migration = args.includes("--candidate")
  ? readFileSync(new URL("SafeStepsTools/sql/candidates/20261012215912_p0_assessment_and_profile_write_boundaries.sql",root),"utf8")
  : "";
process.stdout.write(fixture.replace("begin;\n", "begin;\n"+migration+"\n"));
