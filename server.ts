import * as express from "express";
import * as snoowrap from "snoowrap";
import * as querystring from "querystring";
import * as fs from "fs";
import { sendHaikusToYoutubePlaylist } from "./nodejs-quickstart";

let r: snoowrap = new snoowrap({
  userAgent: 'node:subreddit-cast-helper:0.1 (by /u/cynicaloctopus)',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.CLIENT_REFRESH_TOKEN
});

async function getHaikuUrls() {
    return await r.getSubreddit('youtubehaiku').getTop({time: "week"}).map(submission => submission.url);
}

async function getHaikuVideoIds() {
    const urls = await getHaikuUrls();
    return urls.map(url => {
        const params = querystring.parse(url);
        if (!(params && params.v)) {
            return undefined;
        }
        if ((<string []>params.v).pop != undefined) {
            return (<string []>params.v).pop();
        }
        return <string>(params.v);
    }).filter(id => id !== undefined);
}

let entries = [];

const app = express();

app.use(express.static('public'));

app.get('/youtubehaiku/top', async function (req, res) {
    res.send(await entries);
});

app.listen(8080, async () => {
    entries = await getHaikuVideoIds();
    console.log('started');
});
