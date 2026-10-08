import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function classifyAuditReport(report) {
  if (!report.auditReportVersion || report.error) {
    throw new Error(`npm audit did not return a valid report: ${JSON.stringify(report.error ?? report)}`);
  }

  const vulnerabilities = Object.entries(report.vulnerabilities ?? {});
  const blocking = vulnerabilities.filter(([, vulnerability]) => {
    if (vulnerability.severity === 'critical') return true;
    if (vulnerability.severity !== 'high') return false;

    const hasCompatibleFix = vulnerability.fixAvailable === true
      || (typeof vulnerability.fixAvailable === 'object'
        && vulnerability.fixAvailable !== null
        && vulnerability.fixAvailable.isSemVerMajor === false);

    return hasCompatibleFix
      && vulnerability.via.some((advisory) => typeof advisory === 'object');
  });
  const unfixableHigh = vulnerabilities
    .filter(([, vulnerability]) => vulnerability.severity === 'high')
    .filter(([name]) => !blocking.some(([blockingName]) => blockingName === name))
    .map(([name]) => name);

  return {
    blocking: blocking.map(([name]) => name),
    unfixableHigh,
  };
}

function main(reportPath) {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const { blocking, unfixableHigh } = classifyAuditReport(report);

  if (unfixableHigh.length) {
    console.warn(`High-severity production findings without a compatible fix: ${unfixableHigh.join(', ')}`);
  }
  if (blocking.length) {
    console.error(`Production vulnerabilities with compatible fixes: ${blocking.join(', ')}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv[2]);
}
