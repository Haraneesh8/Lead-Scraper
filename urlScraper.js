//Initial draft of individual page scrapper which was then combined with the gMap Scraper



// const { chromium } = require('playwright');
// const fs = require('fs');

// (async () => {

//     individualUrl = 'https://www.google.com/maps/place/McGrath+Estate+Agents+Leichhardt/@-33.8775524,151.1534392,17z/data=!3m2!4b1!5s0x6b12b01db994d783:0xf1b984aa6612ca0d!4m6!3m5!1s0x6b12b01db842c077:0xe21678b236446064!8m2!3d-33.8775524!4d151.1560141!16s%2Fg%2F1thz1tts?authuser=0&hl=en&entry=ttu&g_ep=EgoyMDI1MDIyNi4xIKXMDSoASAFQAw%3D%3D';


//     const browser = await chromium.launch();
//     const context = await browser.newContext();
//     const individualPage = await context.newPage();
    
//     await individualPage.goto(individualUrl);

//     await individualPage.waitForSelector("[jstcache = '3']");

//     const name = await individualPage.$('xpath=/html/body/div[2]/div[3]/div[8]/div[9]/div/div/div[1]/div[2]/div/div[1]/div/div/div[2]/div/div[1]/div[1]/h1');
//     let nameText = name ? await individualPage.evaluate(element => element.textContent, name) : '';
//     console.log(nameText);

//     const rating = await individualPage.$('xpath=/html/body/div[2]/div[3]/div[8]/div[9]/div/div/div[1]/div[2]/div/div[1]/div/div/div[2]/div/div[1]/div[2]/div/div[1]/div[2]/span[1]/span[1]');
//     let ratingText = rating ? await individualPage.evaluate(element => element.textContent, rating) : '';
//     console.log(ratingText);

//     const category = await individualPage.$('xpath=/html/body/div[2]/div[3]/div[8]/div[9]/div/div/div[1]/div[2]/div/div[1]/div/div/div[2]/div/div[1]/div[2]/div/div[2]/span[1]/span/button');
//     let categoryText = category ? await individualPage.evaluate(element => element.textContent, category) : '';
//     console.log(categoryText);

//     const website = await individualPage.$('a[data-tooltip="Open website"]') || await individualPage.$('a[data-tooltip="Open menu link"]');
//     let websiteText = website ? await individualPage.evaluate(element => element.getAttribute('href'), website) : '';
//     console.log(websiteText);

//     const phone = await individualPage.$('button[data-tooltip="Copy phone number"]');
//     let phoneText = phone ? await individualPage.evaluate(element => element.textContent, phone) : '';
//     console.log(phoneText);


//     await browser.close();
// })();