const puppeteer = require('puppeteer');
const $ = require('cheerio');

const link = "https://sfbay.craigslist.org/d/software-ga-dba-etc/search/sof"

const main = async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(link);
    const html = await page.content();
    const $ = cheerio.load(html);
    $(".result-title").each((index, element) => console.log($(element).text()));
}

main();