import { expect, test, type Page } from '@playwright/test';

const storageKey = 'classified-laura-progress-v1';
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}
async function enter(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Пропустить анимацию' }).click();
  await page.getByRole('button', { name: 'Открыть секретное досье' }).click();
  const skip = page.getByRole('button', { name: 'Завершить сканирование' });
  await skip.click();
  await page.getByRole('button', { name: 'Изучить материалы дела' }).click();
  await expect(page.getByRole('heading', { name: 'Лаура', exact: true })).toBeVisible();
}
async function chooseQuiz(page: Page, answer: number) {
  for (let question = 0; question < 3; question++) {
    await page.locator('.answer-button').nth(answer).click();
    await expect(page.locator('.answer-button.selected')).toHaveCount(1);
    await expect(page.locator('.answer-button:disabled')).toHaveCount(3);
    await expect(page.locator('.reaction-copy')).toBeVisible();
    await page.getByRole('button', { name: question === 2 ? 'Узнать результат' : 'Следующий вопрос' }).click();
  }
  const skip = page.getByRole('button', { name: 'Пропустить анимацию' });
  if (!await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)) await skip.click();
  await expect(page.locator('.compatibility-result')).toContainText('999');
}

for (const width of [320, 375, 390, 430, 1440]) {
  test(`complete story and layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('/');
    await noOverflow(page);
    await enter(page);
    await noOverflow(page);
    await page.getByRole('button', { name: '02 Характер угрозы' }).click();
    await expect(page.getByText('Практически нулевая.')).toBeVisible();
    for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Пенсия. Секретная кнопка.' }).click();
    await expect(page.getByText('Агент делает вид, что ему всё равно.')).toBeVisible();
    await page.getByRole('button', { name: 'Закрыть уведомление' }).click();
    await page.getByRole('button', { name: 'Перейти к проверке' }).click();
    await noOverflow(page);
    await chooseQuiz(page, 1);
    await noOverflow(page);
    await page.getByRole('button', { name: 'Посмотреть, что там ещё накопали' }).click();
    const skip = page.getByRole('button', { name: 'Раскрыть всё сразу' });
    if (await skip.isVisible()) await skip.click();
    await expect(page.getByRole('heading', { name: 'Ты правда очень красивая ♡' })).toBeVisible();
    await expect(page.locator('.portrait-frame img')).toBeVisible();
    await expect.poll(() => page.locator('.portrait-frame img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await noOverflow(page);
    await page.getByRole('button', { name: 'Завершить операцию' }).click();
    await expect(page.locator('.mission-stamp')).toContainText('MISSION');
    await noOverflow(page);
    await page.reload();
    await expect(page.locator('.mission-stamp')).toBeVisible();
    await page.getByRole('button', { name: 'Пройти историю ещё раз' }).click();
    await expect(page.getByRole('button', { name: 'Открыть секретное досье' })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

for (const answer of [0, 2]) {
  test(`all quiz questions accept option ${answer + 1}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(key => localStorage.setItem(key, JSON.stringify({ stage: 3, answers: [], complete: false })), storageKey);
    await page.goto('/');
    await chooseQuiz(page, answer);
    const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey);
    expect(stored.answers).toEqual([answer, answer, answer]);
    await page.getByRole('button', { name: 'Посмотреть, что там ещё накопали' }).click();
    await expect(page.getByRole('heading', { name: 'Ты правда очень красивая ♡' })).toBeVisible();
  });
}

test('reload restores quiz; back and reset work; rapid taps do not skip stages', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Открыть секретное досье' }).evaluate((el: HTMLButtonElement) => { el.click(); el.click(); el.click(); });
  await expect(page.getByRole('button', { name: 'Изучить материалы дела' })).toBeVisible();
  await page.getByRole('button', { name: 'Изучить материалы дела' }).click();
  await page.getByRole('button', { name: 'Перейти к проверке' }).click();
  await page.locator('.answer-button').nth(0).click();
  await page.reload();
  await expect(page.locator('.quiz-question-count')).toContainText('ВОПРОС 02');
  await page.getByRole('button', { name: 'НАЗАД', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Лаура', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Начать сначала', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Продолжить операцию' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'Начать сначала', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Начать сначала' }).click();
  await expect(page.getByRole('button', { name: 'Открыть секретное досье' })).toBeVisible();
});

test('invalid or unavailable local storage does not block the story', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'getItem', { value: () => { throw new Error('Storage blocked'); } });
    Object.defineProperty(Storage.prototype, 'setItem', { value: () => { throw new Error('Storage blocked'); } });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Открыть секретное досье' }).click();
  await expect(page.getByRole('button', { name: 'Изучить материалы дела' })).toBeEnabled();
});
