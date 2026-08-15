const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', error => errors.push(error.message));
  
  await page.goto('http://localhost:3000');
  
  // Wait a bit
  await page.waitForTimeout(3000);
  
  const content = await page.content();
  console.log("BODY LENGTH:", content.length);
  if (content.includes('id="root"')) {
    const rootHtml = await page.evaluate(() => document.getElementById('root').innerHTML);
    console.log("ROOT HTML LENGTH:", rootHtml.length);
    if (rootHtml.length < 100) {
      console.log("ROOT IS BLANK!");
    }
  }
  
  console.log("ERRORS:", errors);
  await browser.close();
})();
