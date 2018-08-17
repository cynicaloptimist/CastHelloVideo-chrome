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

function getHaikuVideoIds(urls: string []) {
    const ids = urls.map(urlString => {
        const url = new URL(urlString);
        if (url.searchParams.has("v")) {
            return url.searchParams.get("v");
        }
        if (url.hostname == "youtu.be") {
            return url.pathname.replace("/", "");
        }

        return undefined;
    });
        
    return ids.filter(id => id !== undefined);
}

let entries = [];

const app = express();

app.use(express.static('public'));

app.get('/youtubehaiku/top', async function (req, res) {
    res.send(entries);
});

app.listen(8080, async () => {
    const urls = await getHaikuUrls();
    entries = getHaikuVideoIds(urls);
    console.log('started');
});
