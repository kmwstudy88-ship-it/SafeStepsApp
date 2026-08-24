import fs from 'fs';
import path from 'path';

describe('assessment-system routes', () => {
  it('exposes the routes used by the documents screen', () => {
    const routeFiles = [
      path.join(__dirname, '..', 'app', 'assessment-system', 'index.tsx'),
      path.join(__dirname, '..', 'app', 'assessment-system', 'document-intelligence.tsx'),
    ];

    routeFiles.forEach((routeFile) => {
      expect(fs.existsSync(routeFile)).toBe(true);
    });
  });
});
