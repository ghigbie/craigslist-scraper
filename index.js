const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const link = "https://sfbay.craigslist.org/d/software-ga-dba-etc/search/sof"

const main = async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(link);
    const html = await page.content();
    const $ = cheerio.load(html);
    const results = $('.result-info').map((index, element) => {
        const titleElement = $(element).find('.result-title')
        const title = $(titleElement).text();
        const url = $(titleElement).attr('href');
        return { title, url}
    }).get();
    console.log(Array.isArray(results));
    console.log(results);
}

main();