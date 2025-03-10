const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const csvFileName = 'realEstate.csv';
    const googleMapUrl = 'https://www.google.com/maps/search/real+estate/@-33.8662563,151.1723894,15z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI1MDIyMy4xIKXMDSoASAFQAw%3D%3D';

    // Open up the browser on a newpage and go to the google map url
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(googleMapUrl);

    await page.waitForSelector("[jstcache='3']");
    // Successfully found the above element which basically contains all data for places that came up
    console.log('Loaded Google Maps');

    
    //Got the xpath of the scroll element and set as variable
    const scroll = await page.$('xpath=/html/body/div[2]/div[3]/div[8]/div[9]/div/div/div[1]/div[2]/div/div[1]/div/div/div[1]/div[1]');
    
    // If scroll is empty that means no elements found in that url or no items to scroll
    if (!scroll) {
        console.log('Scroll element not found.');
        await browser.close();
        return;
    }

    // Scroll to the bottom of the google map page
    let endOfList = false;
    let prevCount = 0;
    while (!endOfList) {
        await scroll.evaluate(node => node.scrollBy(0, 10000));
        await page.waitForTimeout(1000);

        const placeCount = await page.$$eval('a[href^="https://www.google.com/maps/place/"]', places => places.length);
        
        if (placeCount === prevCount) {
            endOfList = true;
            console.log('End Of List Reached');
            break;
        } else {
            prevCount = placeCount;
        }
        console.log('Scrolled down');
    }

    // Extract the url's of each of the places
    const urls = await page.$$eval('a', links => links.map(link => link.href).filter(href => href.startsWith('https://www.google.com/maps/place/')));

    // Scrapes data of each individual page
    const individualPageData = async (url) => {
        const individualPage = await browser.newPage();
        await individualPage.goto(url);
        await individualPage.waitForSelector('[jstcache="3"]');

        const name = await individualPage.$('xpath=/html/body/div[2]/div[3]/div[8]/div[9]/div/div/div[1]/div[2]/div/div[1]/div/div/div[2]/div/div[1]/div[1]/h1');
        let nameText = name ? await individualPage.evaluate(element => element.textContent, name) : '';

        const rating = await individualPage.$('xpath=/html/body/div[2]/div[3]/div[8]/div[9]/div/div/div[1]/div[2]/div/div[1]/div/div/div[2]/div/div[1]/div[2]/div/div[1]/div[2]/span[1]/span[1]');
        let ratingText = rating ? await individualPage.evaluate(element => element.textContent, rating) : '';

        const category = await individualPage.$('xpath=/html/body/div[2]/div[3]/div[8]/div[9]/div/div/div[1]/div[2]/div/div[1]/div/div/div[2]/div/div[1]/div[2]/div/div[2]/span[1]/span/button');
        let categoryText = category ? await individualPage.evaluate(element => element.textContent, category) : '';

        const website = await individualPage.$('a[data-tooltip="Open website"]') || await individualPage.$('a[data-tooltip="Open menu link"]');
        let websiteText = website ? await individualPage.evaluate(element => element.getAttribute('href'), website) : '';

        const phone = await individualPage.$('button[data-tooltip="Copy phone number"]');
        let phoneText = phone ? await individualPage.evaluate(element => element.textContent, phone) : '';
        phoneText = phoneText.replace(/[^\d+()\s-]/g, '').trim(); // Clean phone number

        let emailText = '';
        if (websiteText) {
            emailText = await extractEmailFromWebsite(browser, websiteText);
        }

        await individualPage.close();
        return { nameText, ratingText, categoryText, websiteText, phoneText, emailText, url };
    };

    // Function to extract email from business website
    const extractEmailFromWebsite = async (browser, websiteUrl) => {
        try {
            const page = await browser.newPage();
            await page.goto(websiteUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });

            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            const pageContent = await page.evaluate(() => document.body.innerText);
            await page.close();

            let emails = pageContent.match(emailRegex) || [];

            // List of unwanted email patterns
            const blockedKeywords = [
                '@sentry-next.wixpress.com',
                '.png',
                'sentry.io',
                '@sentry.wixpress.com',
                '@wix.com'
            ];

            // Filter out unwanted emails
            emails = emails.filter(email => 
                !blockedKeywords.some(blocked => email.includes(blocked))
            );

            return emails.length > 0 ? emails[0] : ''; // Return first valid email if found
        } catch (error) {
            console.log(`Error fetching email from ${websiteUrl}:`, error.message);
            return '';
        }
    };

    // Prcoess urls in batches to make it quicker
    const batchSize = 5; // 5 was found to be a good number, can change based on how fast your system runs
    const results = [];

    for (let i = 0; i < urls.length; i += batchSize) {
        const batchUrls = urls.slice(i, i + batchSize);
        const batchResults = await Promise.all(batchUrls.map(url => individualPageData(url)));
        results.push(...batchResults);
        // To make sure that the batching is actually working
        console.log(`Batch ${i / batchSize + 1} completed.`);
    }

    // Convert the results into a CSV file which was named at the top
    const csvHeader = 'Name,Rating,Category,Website,Phone,Email,Url\n';
    const csvRows = results.map(r => 
        `"${r.nameText}","${r.ratingText}","${r.categoryText}","${r.websiteText}","${r.phoneText}","${r.emailText}","${r.url}"`
    ).join('\n');

    fs.writeFileSync(csvFileName, csvHeader + csvRows);
    console.log(`CSV saved as ${csvFileName}`);

    await browser.close();
})();
