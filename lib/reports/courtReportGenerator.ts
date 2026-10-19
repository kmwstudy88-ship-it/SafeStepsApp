export type CourtReportData = {
  caseReference: string;
  parentName: string;
  childrenNames: string[];
  caseworkerName: string;
  reportPeriod: string;
  completedCurriculumModules: { title: string; completedDate: string; hours: number }[];
  assessmentTrajectories: { name: string; baselineScore: number; currentScore: number; deltaLabel: string }[];
  contactVisitStats: { totalVisits: number; attendedVisits: number; punctualityRate: string }[];
  verifiedEvidenceCount: number;
  workerObservationSummary: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);
}

export function buildCourtReportHtml(data: CourtReportData): string {
  const moduleRows = data.completedCurriculumModules
    .map(
      (module) => `<tr>
      <td>${escapeHtml(module.title)}</td>
      <td>${escapeHtml(module.completedDate)}</td>
      <td class="number">${module.hours} hrs</td>
    </tr>`
    )
    .join('');

  const assessmentRows = data.assessmentTrajectories
    .map(
      (assessment) => `<tr>
      <td><strong>${escapeHtml(assessment.name)}</strong></td>
      <td class="number">${assessment.baselineScore}%</td>
      <td class="number">${assessment.currentScore}%</td>
      <td>${escapeHtml(assessment.deltaLabel)}</td>
    </tr>`
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Unverified local report draft</title>
    <style>
      body { font-family: sans-serif; color: #2D3748; padding: 36px; line-height: 1.5; }
      .header { border-bottom: 3px solid #208AEF; padding-bottom: 16px; margin-bottom: 24px; }
      .title { font-size: 24px; font-weight: bold; color: #102033; margin: 0; }
      .subtitle { font-size: 13px; color: #718096; margin-top: 4px; }
      .warning { padding: 14px; margin-bottom: 20px; background: #FFF7ED; border: 2px solid #C05621; color: #7C2D12; font-weight: bold; }
      .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; background: #F7FAFC; padding: 16px; border-radius: 8px; font-size: 14px; }
      .section-title { font-size: 16px; font-weight: bold; color: #1A202C; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-top: 24px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
      th { background-color: #EDF2F7; padding: 8px; text-align: left; font-size: 12px; text-transform: uppercase; color: #4A5568; }
      td { padding: 8px; border-bottom: 1px solid #ddd; }
      .number { text-align: right; }
    </style>
  </head>
  <body>
    <div class="warning">UNVERIFIED LOCAL DRAFT — NOT A COURT FILING, CERTIFIED RECORD, OR VERIFIED REPORT. No cryptographic seal or case-system verification is applied.</div>
    <div class="header">
      <h1 class="title">Progress summary draft</h1>
      <div class="subtitle">All information is supplied by the report creator and has not been verified by SafeSteps.</div>
    </div>

    <div class="meta-grid">
      <div><strong>Case reference (unverified):</strong> ${escapeHtml(data.caseReference)}</div>
      <div><strong>Report period (unverified):</strong> ${escapeHtml(data.reportPeriod)}</div>
      <div><strong>Parent name (unverified):</strong> ${escapeHtml(data.parentName)}</div>
      <div><strong>Worker name (unverified):</strong> ${escapeHtml(data.caseworkerName)}</div>
      <div><strong>Children (unverified):</strong> ${data.childrenNames.map(escapeHtml).join(', ')}</div>
      <div><strong>Evidence count (unverified):</strong> ${data.verifiedEvidenceCount}</div>
    </div>

    <div class="section-title">Assessment values supplied by the report creator — not validated measures</div>
    <table>
      <thead><tr><th>Assessment</th><th class="number">Baseline</th><th class="number">Current</th><th>Change label</th></tr></thead>
      <tbody>${assessmentRows}</tbody>
    </table>

    <div class="section-title">Learning hours supplied by the report creator — not verified</div>
    <table>
      <thead><tr><th>Module</th><th>Date</th><th class="number">Reported hours</th></tr></thead>
      <tbody>${moduleRows}</tbody>
    </table>

    <div class="section-title">Observation summary supplied by the report creator — not independently confirmed</div>
    <p>${escapeHtml(data.workerObservationSummary)}</p>
  </body>
  </html>`;
}

export async function exportCourtReportPdf(data: CourtReportData): Promise<string> {
  const Print = await import('expo-print');
  const Sharing = await import('expo-sharing');
  const html = buildCourtReportHtml(data);
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  }
  return uri;
}
