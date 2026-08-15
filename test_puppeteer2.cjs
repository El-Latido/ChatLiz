const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  const rootHtml = await page.evaluate(() => document.getElementById('root').innerHTML);
  console.log("ROOT HTML LENGTH:", rootHtml.length);
  
  await browser.close();
})();
