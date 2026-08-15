const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:3000/chat/Fabian');
  await page.waitForTimeout(2000);
  
  const rootText = await page.evaluate(() => document.getElementById('root').innerText);
  console.log("ROOT TEXT (length):", rootText.length);
  
  await browser.close();
})();
