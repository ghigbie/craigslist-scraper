const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const creds = require('./creds');
const Listing = require('./model/Listing');

const connectToMongoDB = async () => {
    const connectionURL = mongoose.connect(`mongodb+srv://${creds.username}:${creds.password}@cluster0.ei9du.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, { useNewUrlParser: true } );
    console.log('connected to mongodb');
}

const sleep = async (miliseconds) => {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
}

const scrapeListings = async (page, link) => {
    await page.goto(link);
    const html = await page.content();
    const $ = cheerio.load(html);
    const listings = $('.result-info').map((index, element) => {
        const titleElement = $(element).find('.result-title');
        const dateElement = $(element).find('.result-date');
        const title = $(titleElement).text();
        const url = $(titleElement).attr('href');
        const dateTimePosted = new Date($(dateElement).attr('datetime'));
        const hood = $(element).find('.result-hood')
            .text()
            .replace(/[{()}]/g, '')
            .trim();
        return { title, url, dateTimePosted, hood}
    }).get();
    return listings;
}

const scrapeJobDescriptions = async (listings, page) => {
    for(let i = 0; i < listings.length; i++){
        const jobDetails = {};
        await page.goto(listings[i].url);
        const html = await page.content();
        const $ = cheerio.load(html);
        const jobDescription = $('#postingbody').text();
        const compensation = $('p.attrgroup > span:nth-child(1) > b').text();
        listings[i].jobDescription = jobDescription;
        listings[i].compensation = compensation
        const listingModel = new Listing(listings[i]);
        await listingModel.save();
        await sleep(1000); // puases execution for 1 second
    }
    console.log('***************************');
    console.log(listings);
    console.log('***************************');
}

const main = async () => {
    await connectToMongoDB();
    const link = "https://sfbay.craigslist.org/d/software-ga-dba-etc/search/sof"
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const listings = await scrapeListings(page, link);
    scrapeJobDescriptions(listings, page);
}

main();