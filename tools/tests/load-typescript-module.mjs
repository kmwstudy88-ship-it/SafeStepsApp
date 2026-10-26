import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

export async function importTypeScriptModule(relativePath) {
  const sourcePath = new URL(relativePath, import.meta.url);
  const source = await readFile(sourcePath, 'utf8');
  const javascript = stripTypeScriptTypes(source, { mode: 'strip' });
  const dataUrl = `data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`;
  return import(dataUrl);
}
