import { test, expect } from '@playwright/test';
test('grid game selects, rotates, drops, pauses and resets',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await expect(page.locator('.choice')).toHaveCount(3);await expect(page.locator('#rotate')).toBeEnabled();
 await page.locator('.choice').nth(1).click();await page.locator('#rotate').click();
 await page.locator('#drop').click();await expect(page.locator('#drops')).toHaveText('1');await expect(page.locator('#drop')).toBeDisabled();
 await page.locator('#pause').click();await expect(page.locator('#status')).toHaveText('一時停止中');
 await page.locator('#pause').click();await page.locator('#reset').click();
 await expect(page.locator('#score')).toHaveText('0');await expect(page.locator('#drops')).toHaveText('0');
 await page.locator('#game').focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('Space');await expect(page.locator('#drops')).toHaveText('1');
 await page.screenshot({path:'test-results/desktop.png',fullPage:true});expect(errors).toEqual([]);
});
test('far-edge drop ends the game and restart restores play on a phone',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.locator('#game').focus();for(let i=0;i<20;i++)await page.keyboard.press('ArrowRight');
 await page.keyboard.press('Space');await expect(page.locator('#status')).toContainText('ゲームオーバー',{timeout:15000});
 await expect(page.locator('#drop')).toBeDisabled();await page.locator('#reset').click();await expect(page.locator('#drop')).toBeEnabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
 await page.screenshot({path:'test-results/mobile.png',fullPage:true});
});
