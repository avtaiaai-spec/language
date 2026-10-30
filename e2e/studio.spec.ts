import { test, expect } from '@playwright/test';
async function onboard(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Начать свой путь' }).click();
  await page.getByRole('button', { name: 'Путешествия', exact: true }).click();
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await page.getByRole('button', { name: 'Открыть студию' }).click();
  await expect(page.getByRole('heading', { name: 'Хороший день, чтобы начать.' })).toBeVisible();
}
test('onboarding, contextual lesson, every exercise, reload, result and vocabulary persist', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await onboard(page);
  await page.screenshot({
    path: `test-results/dashboard-${info.project.name}.png`,
    fullPage: true,
  });
  await page.goto('/#/lesson/to-be');
  await expect(page.getByRole('heading', { name: 'Verb to be', exact: true })).toBeVisible();
  await expect(page.getByText('I am at home.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Путешествия', exact: true }).click();
  await expect(page.getByText('We are at the airport.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'К упражнениям' }).click();
  for (let i = 0; i < 8; i++) {
    const active = await page.evaluate(
      () => JSON.parse(localStorage.getItem('english-studio:v1')!).active,
    );
    const ex = active.exercises[i];
    if (ex.type === 'choice')
      await page.getByRole('button', { name: ex.answers[0], exact: false }).click();
    else if (ex.type === 'order') {
      const tokens = ex.answers[0].replace(/[?.!,]/g, '').split(' ');
      const used = new Set<number>();
      for (const token of tokens) {
        const index = ex.tokens.findIndex((t: string, j: number) => t === token && !used.has(j));
        used.add(index);
        await page.locator('.token-pool button').nth(index).click();
      }
    } else await page.getByRole('textbox', { name: 'Ваш ответ' }).fill(ex.answers[0]);
    if (i === 2) {
      await page.reload();
      await expect(page.getByRole('textbox', { name: 'Ваш ответ' })).toHaveValue(ex.answers[0]);
    }
    await page.getByRole('button', { name: 'Проверить', exact: true }).click();
    await expect(page.getByText('Верно. Отличная работа!')).toBeVisible();
    await page
      .getByRole('button', { name: i === 7 ? 'Завершить' : 'Следующее', exact: true })
      .click();
  }
  await expect(page.getByRole('heading', { name: 'Ещё один шаг вперёд.' })).toBeVisible();
  await expect(page.locator('.result-score>strong')).toHaveText('100%');
  await page.reload();
  await expect(page.locator('.result-score>strong')).toHaveText('100%');
  await page.getByRole('button', { name: 'Добавить новые слова' }).click();
  await page.goto('/#/vocabulary');
  await expect(page.getByRole('heading', { name: 'airport', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Добавить слово' }).click();
  await page.getByLabel('Слово на английском').fill('journey');
  await page.getByLabel('Перевод', { exact: true }).fill('путешествие');
  await page.getByRole('button', { name: 'Сохранить слово' }).click();
  await expect(page.getByRole('heading', { name: 'journey', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'journey', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Повторить ·/ }).click();
  await page.getByRole('button', { name: 'Перевернуть карточку' }).click();
  await page.getByRole('button', { name: /Хорошо/ }).click();
  await expect(page.getByText(/Повторено: 1/)).toBeVisible();
  await page.goto('/#/insights');
  await expect(page.locator('.stats-grid').getByText('100%', { exact: true })).toBeVisible();
  for (const route of [
    '/learn',
    '/vocabulary',
    '/listening',
    '/settings',
    '/insights',
    '/lesson/present-simple',
  ]) {
    await page.goto('/#' + route);
    await expect(page.locator('main')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.goto('/#/settings');
  await page.getByLabel('Тема', { exact: true }).selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(errors).toEqual([]);
});
test('placement test calculates result and catalog labels planned courses', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Начать свой путь' }).click();
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await page.getByRole('button', { name: 'Определить уровень', exact: false }).click();
  const responses = [
    'am',
    'drinks',
    'are watching',
    'went',
    'be',
    'stayed',
    'will',
    'has finished',
    'I have seen',
    'is',
    'confusing',
    'supports it',
  ];
  for (let i = 0; i < 12; i++) {
    await page
      .locator('.placement')
      .getByRole('button', { name: responses[i], exact: true })
      .click();
    await page.getByRole('button', { name: 'Следующий вопрос' }).click();
  }
  await expect(page.getByText('РЕКОМЕНДУЕМЫЙ СТАРТ')).toBeVisible();
  await expect(page.locator('.large-number')).toHaveText('A2');
  await expect(page.getByText('4 из 12 ответов верны.')).toBeVisible();
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await page.getByRole('button', { name: 'Открыть студию' }).click();
  await page.goto('/#/learn');
  await page.getByRole('button', { name: 'C2', exact: true }).click();
  await expect(page.getByText('Новая глава ещё пишется')).toBeVisible();
});
test('listening results, error history and malformed import handling', async ({ page }) => {
  await onboard(page);
  await page.goto('/#/listening/cafe');
  await page.getByRole('button', { name: 'Открыть текст и перевод' }).click();
  await expect(page.getByText('Five pounds, please.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'К заданиям' }).click();
  await page.getByRole('button', { name: 'Кофе и торт', exact: false }).click();
  await page.getByRole('button', { name: 'Проверить', exact: true }).click();
  await expect(page.getByText('Ещё один шаг к пониманию.')).toBeVisible();
  await page.getByRole('button', { name: 'Следующее', exact: true }).click();
  await page.getByRole('button', { name: 'Пять фунтов', exact: false }).click();
  await page.getByRole('button', { name: 'Проверить', exact: true }).click();
  await page.getByRole('button', { name: 'Следующее', exact: true }).click();
  await page.getByRole('textbox', { name: 'Ваш ответ' }).fill('How much is it?');
  await page.getByRole('button', { name: 'Проверить', exact: true }).click();
  await page.getByRole('button', { name: 'Завершить', exact: true }).click();
  await expect(page.locator('.result-score>strong')).toHaveText('67%');
  await page.goto('/#/insights');
  await expect(page.getByText('Ваш ответ: Кофе и торт', { exact: true })).toBeVisible();
  await page.goto('/#/settings');
  await page.locator('input[type=file]').setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{}'),
  });
  await expect(page.getByRole('status')).toContainText('Структура резервной копии');
});

test('offline app shell, backup round trip, search and narrow layout', async ({
  page,
  context,
}) => {
  await onboard(page);
  await page.getByRole('button', { name: 'Поиск по урокам и словам' }).click();
  await page.getByPlaceholder('Урок, слово или тема…').fill('Present Simple');
  await page.getByRole('link', { name: 'Present Simple A1 · Урок', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Present Simple', exact: true })).toBeVisible();
  if (await page.locator('.lesson-toc').isVisible()) {
    await page.locator('.lesson-toc').getByRole('link', { name: '03 Примеры' }).click();
    await expect(page).toHaveURL(/#\/lesson\/present-simple$/);
  }
  await page.goto('/#/settings');
  await page.getByLabel('Как к вам обращаться').fill('Алекс');
  const backup = await page.evaluate(() => localStorage.getItem('english-studio:v1')!);
  await page.getByLabel('Как к вам обращаться').fill('Другое имя');
  await page.locator('input[type=file]').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(backup),
  });
  await expect(page.getByRole('heading', { name: 'Восстановить резервную копию?' })).toBeVisible();
  await page.getByRole('button', { name: 'Восстановить', exact: true }).click();
  await expect(page.getByLabel('Как к вам обращаться')).toHaveValue('Алекс');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Ваше пространство' })).toBeVisible();
  await expect(page.getByLabel('Как к вам обращаться')).toHaveValue('Алекс');
  await page.goto('/#/lesson/to-be');
  await expect(page.getByText('I am at home.', { exact: true })).toBeVisible();
  await context.setOffline(false);
  await page.setViewportSize({ width: 320, height: 740 });
  for (const route of ['/', '/learn', '/settings', '/vocabulary', '/listening', '/insights']) {
    await page.goto('/#' + route);
    await expect(page.locator('main')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      route,
    ).toBe(true);
  }
});
