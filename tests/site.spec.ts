import { test, expect } from '@playwright/test';
for (const width of [1440, 390]) {
  test(`paper and lifecycle work at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Identity thatoutlives its keys.');
    await expect(page.locator('.paper-chapter')).toHaveCount(10);
    await expect(page.locator('.prose table tbody tr')).toHaveCount(8);
    await expect(page.getByRole('tab', { name: /Rotate/ })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: /Recover/ }).click();
    await expect(page.getByRole('tabpanel')).toContainText('A way back in.');
    await expect(page.locator('.state-fields')).toContainText('K₂');
    await page.getByRole('tab', { name: /Revoke/ }).click();
    await expect(page.locator('.status')).toHaveText('Revoked');
    await expect(page.locator('.state-fields')).toContainText('None');
    await page.getByRole('tab', { name: /Revoke/ }).press('Home');
    await expect(page.getByRole('tab', { name: /Create/ })).toBeFocused();
    await expect(page.getByRole('tabpanel')).toContainText('An identity begins.');
    await page.getByRole('button', { name: 'Corrections', exact: true }).click();
    await expect(page.locator('.finding')).toHaveCount(11);
    await page.getByRole('button', { name: 'Open questions', exact: true }).click();
    await expect(page.locator('.finding')).toHaveCount(1);
    await page.locator('.finding summary').click();
    await expect(page.locator('.finding-body')).toContainText('Regtest transactions');
    await page.getByRole('button', { name: 'All findings', exact: true }).click();
    await expect(page.locator('.finding')).toHaveCount(16);
    await page.locator('#fee-rate').fill('20');
    await expect(page.locator('.fee-result')).toContainText('5,000');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
test('source downloads, sources, metadata and diagrams are present', async ({ page, request }) => {
  await page.goto('/');
  for (const url of ['/whitepaper.md', '/rooted-whitepaper.pdf', '/technical-review.md', '/social-card.png', '/icon.svg', '/fonts/body.woff2']) {
    const response = await request.get(url);
    expect(response.status(), url).toBe(200);
  }
  await expect(page.locator('.reference-grid > a')).toHaveCount(14);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-card.png/);
  await expect(page.getByRole('img', { name: 'One identity, changing keys' })).toBeVisible();
  const links = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute('href')).filter(href => href !== '#'));
  for (const link of new Set(links)) expect(await page.locator(link!).count(), link!).toBe(1);
});
