const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    
    googleMapUrl = 'https://www.google.com/maps/search/real+estate/@-33.8662563,151.1723894,15z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI1MDIyMy4xIKXMDSoASAFQAw%3D%3D'

    // Open up the browser on a newpage and go to the google map url
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(googleMapUrl);
    
    await page.waitForSelector("[jstcache = '3']")
    // Successfully found the above element which basically contains all data for places that came up
    console.log('Loaded')

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
        } else {
            prevCount = placeCount;
        }
        
        console.log('scrolled down');
    }

    // Extract the url's of each of the places
    const urls = await page.$$eval('a', links => links.map(link => link.href).filter(href => href.startsWith('https://www.google.com/maps/place/')));

    //write to CSV file
    fs.writeFileSync('urls.csv', urls.join('\n'));

    await browser.close();
})();