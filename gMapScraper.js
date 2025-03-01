const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    
    csvFileName = 'realEstate.csv';
    googleMapUrl = 'https://www.google.com/maps/search/real+estate/@-33.8662563,151.1723894,15z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI1MDIyMy4xIKXMDSoASAFQAw%3D%3D'

    // Open up the browser on a newpage and go to the google map url
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(googleMapUrl);
    
    await page.waitForSelector("[jstcache = '3']");
    // Successfully found the above element which basically contains all data for places that came up
    console.log('Loaded');

    //Got the xpath of the scroll element and set as variable
    const scroll = await page.$('xpath=/html/body/div[2]/div[3]/div[8]/div[9]/div/div/div[1]/div[2]/div/div[1]/div/div/div[1]/div[1]')

    // If scroll is empty that means no elements found in that url or no items to scroll
    if (!scroll) {
        console.log('Scroll element not found.');
        await browser.close();
        return;
    }

    // Scroll to the bottom of the google map page until it says "You've reached the end of the list"
    let endOfList = false;
    let prevCount = 0;
    while (!endOfList) {
        await scroll.evaluate(node => node.scrollBy(0, 10000));
        await page.waitForTimeout(1000);

        const placeCount = await page.$$eval('a[href^="https://www.google.com/maps/place/"]', places => places.length)
        
        if (placeCount === prevCount){
            endOfList = true;
            console.log('End Of List Reached');
            break;
        } else {
            prevCount = placeCount;
        }
        
        console.log('scrolled down');
    }

    // Extract the url's of each of the places
    const urls = await page.$$eval('a', links => links.map(link => link.href).filter(href => href.startsWith('https://www.google.com/maps/place/')));

    const individualPageData = async (url) => {
        const individualPage = await browser.newPage();
        await individualPage.goto(url);
        await individualPage.waitForSelector('[jstcache="3"]');

        const name = await individualPage.$('xpath=/html/body/div[2]/div[3]/div[8]/div[9]/div/div/div[1]/div[2]/div/div[1]/div/div/div[2]/div/div[1]/div[1]/h1');
        let nameText = name ? await individualPage.evaluate(element => element.textContent, name) : '';
        nameText = `"${nameText}"`;

        const rating = await individualPage.$('xpath=/html/body/div[2]/div[3]/div[8]/div[9]/div/div/div[1]/div[2]/div/div[1]/div/div/div[2]/div/div[1]/div[2]/div/div[1]/div[2]/span[1]/span[1]');
        let ratingText = rating ? await individualPage.evaluate(element => element.textContent, rating) : '';
        ratingText = `"${ratingText}"`;

        const category = await individualPage.$('xpath=/html/body/div[2]/div[3]/div[8]/div[9]/div/div/div[1]/div[2]/div/div[1]/div/div/div[2]/div/div[1]/div[2]/div/div[2]/span[1]/span/button');
        let categoryText = category ? await individualPage.evaluate(element => element.textContent, category) : '';
        categoryText = `"${categoryText}"`;

        const website = await individualPage.$('a[data-tooltip="Open website"]') || await individualPage.$('a[data-tooltip="Open menu link"]');
        let websiteText = website ? await individualPage.evaluate(element => element.getAttribute('href'), website) : '';
        websiteText = `"${websiteText}"`;

        const phone = await individualPage.$('button[data-tooltip="Copy phone number"]');
        let phoneText = phone ? await individualPage.evaluate(element => element.textContent, phone) : '';
        phoneText = `"${phoneText}"`;

        url = `"${url}"`;
        await individualPage.close();
        return { nameText, ratingText, categoryText, websiteText, phoneText, url };
    };

    // Batch processing
    const batchSize = 5; // Adjust batch size based on your system capability
    const results = [];

    for (let i = 0; i < urls.length; i += batchSize) {
        const batchUrls = urls.slice(i, i + batchSize);
        const batchResults = await Promise.all(batchUrls.map(url => individualPageData(url)));
        results.push(...batchResults);
        console.log(`Batch ${i / batchSize + 1} completed.`);
    }

    // Convert results to CSV format and write to file
    const csvHeader = 'Name,Rating,Category,Website,Phone,Url\n';
    const csvRows = results.map(r => `${r.nameText},${r.ratingText},${r.categoryText},${r.websiteText},${r.phoneText},${r.url}`).join('\n');
    fs.writeFileSync(csvFileName, csvHeader + csvRows);

    await browser.close();
})();