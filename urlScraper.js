const { chromium} = require('playwright');

(async () => {

    individualUrl = 'https://www.google.com/maps/place/Balmain+Realty/@-33.860419,151.168171,16z/data=!3m1!4b1!4m6!3m5!1s0x6b12afb74f36e251:0x8f174001cb4a6fa6!8m2!3d-33.860419!4d151.168171!16s%2Fg%2F1tfvhc8m?authuser=0&hl=en&entry=ttu&g_ep=EgoyMDI1MDIyNi4xIKXMDSoASAFQAw%3D%3D';


    const browser = await chromium.launch();
    const context = await browser.newContext({headless: false});
    const individualPage = await context.newPage();
    await individualPage.goto(individualUrl);

    await page.waitForSelector("[jstcache = '3']");

    const name = await individualPage.$$('/html/body/div[2]/div[3]/div[8]/div[9]/div/div/div[1]/div[2]/div/div[1]/div/div/div[2]/div/div[1]/div[1]/h1');
    console.log(name);


    await browser.close();
});