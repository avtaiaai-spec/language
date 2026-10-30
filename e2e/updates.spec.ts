import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdtempSync, readFileSync, statSync, rmSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

test('an already-open PWA installs a new release without clearing vocabulary or unfinished answers', async ({
  page,
  browserName,
}, info) => {
  test.setTimeout(120000);
  expect(browserName).toBe('chromium');
  const folder = mkdtempSync(join(tmpdir(), 'english-studio-update-'));
  const oldDir = join(folder, 'v1');
  const newDir = join(folder, 'v2');
  let serving = oldDir;
  const build = (id: string, outDir: string) => {
    const r = spawnSync(
      process.execPath,
      ['node_modules/vite/bin/vite.js', 'build', '--outDir', outDir],
      {
        cwd: process.cwd(),
        env: { ...process.env, APP_BUILD_ID: id, VITE_BASE_PATH: '/' },
        encoding: 'utf8',
      },
    );
    if (r.status !== 0) throw new Error(`Build failed: ${r.stdout}\n${r.stderr}`);
  };
  build('old0001', oldDir);
  build('new0002', newDir);
  const types: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.webmanifest': 'application/manifest+json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
  };
  const server = createServer((req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url!, 'http://localhost').pathname);
      let file = resolve(serving, '.' + path);
      if (!file.startsWith(serving + '/') && file !== serving) {
        res.writeHead(403);
        res.end();
        return;
      }
      if (statSync(file).isDirectory()) file = join(file, 'index.html');
      res.writeHead(200, {
        'Content-Type': types[extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(readFileSync(file));
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No test server');
  const origin = `http://127.0.0.1:${address.port}`;
  try {
    await page.goto(origin);
    await page.getByRole('button', { name: 'Начать свой путь' }).click();
    for (let i = 0; i < 4; i++)
      await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
    await page.getByRole('button', { name: 'Открыть студию' }).click();
    await page.goto(origin + '/#/settings');
    await page.getByLabel('Как к вам обращаться').fill('Мой прогресс');
    await page.goto(origin + '/#/vocabulary');
    await page.getByRole('button', { name: 'Добавить слово' }).click();
    await page.getByLabel('Слово на английском').fill('keep');
    await page.getByLabel('Перевод', { exact: true }).fill('сохранять');
    await page.getByRole('button', { name: 'Сохранить слово' }).click();
    await page.goto(origin + '/#/lesson/to-be');
    await page.getByRole('button', { name: 'К упражнениям', exact: true }).click();
    await page.getByRole('textbox', { name: 'Ваш ответ' }).fill('Мой незаконченный ответ');
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await expect(page.getByRole('textbox', { name: 'Ваш ответ' })).toHaveValue(
      'Мой незаконченный ответ',
    );
    const before = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('english-studio:v1')!),
    );
    // New files are published while the existing tab remains open on the older cached shell.
    serving = newDir;
    await page.goto(origin + '/#/settings');
    await expect(page.getByText(/сборка old0001/)).toBeVisible();
    if (info.project.name === 'mobile') {
      await page.clock.setFixedTime(Date.now() + 61000);
      await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    } else await page.getByRole('button', { name: 'Проверить обновление', exact: true }).click();
    const banner = page.locator('.app-update-banner');
    await expect(banner).toBeVisible();
    await banner.getByRole('button', { name: 'Обновить приложение', exact: true }).click();
    await expect(page.getByText(/сборка new0002/)).toBeVisible({ timeout: 30000 });
    const after = await page.evaluate(() => JSON.parse(localStorage.getItem('english-studio:v1')!));
    expect(after.profile).toEqual(before.profile);
    expect(after.vocabulary).toEqual(before.vocabulary);
    expect(after.progress).toEqual(before.progress);
    expect(after.active.draft).toBe('Мой незаконченный ответ');
    await page.goto(origin + '/#/practice');
    await expect(page.getByRole('textbox', { name: 'Ваш ответ' })).toHaveValue(
      'Мой незаконченный ответ',
    );
    await page.goto(origin + '/#/lesson/alphabet');
    await expect(page.locator('.alphabet-letter')).toHaveCount(26);
  } finally {
    await page.goto('about:blank');
    await new Promise<void>((r) => server.close(() => r()));
    rmSync(folder, { recursive: true, force: true });
  }
});
