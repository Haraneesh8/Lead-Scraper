const { chromium } = require('playwright');

{async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://www.apple.com');
    const bodyHandle = await page.$('body');
    const html = await page.evaluate(body => body.innerText, bodyHandle);
    console.log(html);
    await browser.close();
}}