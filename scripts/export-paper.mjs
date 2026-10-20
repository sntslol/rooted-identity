/** Run against a locally built/running site: npm run export:paper */
import { chromium } from '@playwright/test';
import { mkdirSync, copyFileSync } from 'node:fs';
const url = process.env.PAPER_BASE_URL || 'http://127.0.0.1:3016';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll('details').forEach(detail => detail.open = true);
  });
  mkdirSync('output/pdf', { recursive: true });
  await page.pdf({
    path: 'output/pdf/rooted-whitepaper.pdf', format: 'A4', printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="width:100%;padding:0 18mm;font:8px Arial;color:#62736a;display:flex;justify-content:space-between"><span>ROOTED · RESEARCH DRAFT · v0.1</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
    margin: { top: '18mm', bottom: '20mm', left: '18mm', right: '18mm' },
  });
  copyFileSync('output/pdf/rooted-whitepaper.pdf', 'public/rooted-whitepaper.pdf');
  console.log('Exported the paper, diagrams, technical review, and references to PDF.');
} finally { await browser.close(); }
