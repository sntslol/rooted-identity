/** Typeset the academic PDF directly from the paper and review sources. */
import { readFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { review, references } from '../lib/review.ts';
const root = fileURLToPath(new URL('../', import.meta.url));
const python = process.env.PDF_PYTHON || 'python3';
mkdirSync(new URL('../output/pdf/', import.meta.url), { recursive: true });
const result = spawnSync(python, [fileURLToPath(new URL('typeset-paper.py', import.meta.url))], {
  cwd: root,
  input: JSON.stringify({ markdown: readFileSync(new URL('../docs/whitepaper.md', import.meta.url), 'utf8'), review, references }),
  encoding: 'utf8', stdio: ['pipe', 'inherit', 'inherit'],
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
copyFileSync(new URL('../output/pdf/rooted-whitepaper.pdf', import.meta.url), new URL('../public/rooted-whitepaper.pdf', import.meta.url));
console.log('Published the academic PDF to public/rooted-whitepaper.pdf.');
