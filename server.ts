import * as express from "express";
import * as snoowrap from "snoowrap";

const r: snoowrap = new snoowrap({
  userAgent: 'node:subreddit-cast-helper:0.1 (by /u/cynicaloctopus)',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.CLIENT_REFRESH_TOKEN
});

export async function getHaikuUrls() {
    return await r.getSubreddit('youtubehaiku').getTop({time: "week"}).map(submission => submission.url);
}

const entries = getHaikuUrls();

const app = express();

app.use(express.static('public'));

app.get('/youtubehaiku/top', async function (req, res) {
    res.send(await entries);
});

app.listen(8080, function () {
    console.log('started');
});
