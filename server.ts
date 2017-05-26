import * as _ from "lodash";
import * as express from "express";
import * as snoowrap from "snoowrap";

const r = new snoowrap({
  userAgent: 'node:subreddit-cast-helper:0.1 (by /u/cynicaloctopus)',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.CLIENT_REFRESH_TOKEN
});

const entries = [];

function addEntries(newEntries: any []) {
    console.log(newEntries.length);
    newEntries.forEach(e => entries.push(e));
}

r.getSubreddit('youtubehaiku')
    .getTop({ time: 'week', limit: 50 })
    .map(post => post.url)
    .then(addEntries);

const app = express();

app.use(express.static('public'));

app.get('/youtubehaiku/top', function (req, res) {
    res.send(entries);
});

app.listen(8080, function () {
    console.log('started');
});
