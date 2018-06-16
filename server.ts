import * as express from "express";
import * as snoowrap from "snoowrap";

const r: snoowrap = new snoowrap({
  userAgent: 'node:subreddit-cast-helper:0.1 (by /u/cynicaloctopus)',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.CLIENT_REFRESH_TOKEN
});

const entries = [];
async function loadEntries() {
    await r.getSubreddit('youtubehaiku').getTop({time: "week"}).forEach(s => entries.push(s.url));

    console.table(entries);
}

loadEntries();

const app = express();

app.use(express.static('public'));

app.get('/youtubehaiku/top', function (req, res) {
    res.send(entries);
});

app.listen(8080, function () {
    console.log('started');
});
