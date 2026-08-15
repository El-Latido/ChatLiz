const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  const rootText = await page.evaluate(() => document.getElementById('root').innerText);
  console.log("ROOT TEXT:", rootText.substring(0, 500));
  
  await browser.close();
})();
