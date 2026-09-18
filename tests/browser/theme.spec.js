import { expect, test } from '@playwright/test';

async function openThemeControls(page, isMobile) {
  if (isMobile) await page.getByRole('button', { name: 'Más opciones de navegación' }).click();
}

test('tema oscuro inicial, system, selección manual y persistencia', async ({ page, isMobile }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveClass(/dark/);

  await openThemeControls(page, isMobile);
  await page.getByRole('button', { name: 'Usar tema oscuro' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('mock-kine-theme'))).toBe('dark');

  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await openThemeControls(page, isMobile);
  await page.getByRole('button', { name: 'Usar tema sistema' }).click();
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('todas las variantes del Hero conservan su tratamiento oscuro', async ({ page }) => {
  for (const variant of ['actual', 'opcion2', 'opcion3', 'opcion4', 'opcion5']) {
    await page.goto(`/?hero=${variant}`);
    await expect(page.locator('#inicio')).toHaveAttribute('data-hero-variant', variant);
    await expect(page.locator('#inicio')).toHaveClass(/theme-dark/);
  }
});
