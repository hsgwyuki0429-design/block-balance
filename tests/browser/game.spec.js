import { test, expect } from '@playwright/test';
test('select, drop, pause, experiment and restart',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.locator('.choice')).toHaveCount(3);await expect(page.locator('#rotate')).toBeDisabled();
  await page.locator('.choice').nth(1).click();await expect(page.locator('.choice').nth(1)).toHaveAttribute('aria-pressed','true');
  await page.locator('#drop').click();await expect(page.locator('#drops')).toHaveText('1');
  await page.locator('#pause').click();await expect(page.locator('#drop')).toBeDisabled();await page.keyboard.press('Space');await expect(page.locator('#drops')).toHaveText('1');
  await page.locator('#pause').click();await page.locator('summary').click();await page.locator('#rotation').check();await expect(page.locator('#rotate')).toBeEnabled();
  const before=await page.locator('.choice[aria-pressed=true] svg').innerHTML();await page.locator('#rotate').click();expect(await page.locator('.choice[aria-pressed=true] svg').innerHTML()).not.toBe(before);
  await page.locator('#choice-count').selectOption('1');await expect(page.locator('.choice')).toHaveCount(1);
  await page.locator('#reset').click();await expect(page.locator('#drops')).toHaveText('0');await expect(page.locator('#lost')).toHaveText('0');
  await page.locator('#game').focus();await page.keyboard.press('Space');await expect(page.locator('#drops')).toHaveText('1');
  await page.screenshot({path:'test-results/desktop.png',fullPage:true});expect(errors).toEqual([]);
});
test('phone touch placement and viewport fit',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  await page.locator('#game').dispatchEvent('pointerdown',{clientX:150,clientY:220,pointerType:'touch'});await page.locator('#game').dispatchEvent('pointerup',{pointerType:'touch'});
  await page.locator('#drop').click();await expect(page.locator('#drops')).toHaveText('1');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);await page.screenshot({path:'test-results/mobile.png',fullPage:true});
});
