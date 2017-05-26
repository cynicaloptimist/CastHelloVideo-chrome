const express = require('express');
const snoowrap = require('snoowrap');

const r = new snoowrap({
  userAgent: 'node:subreddit-cast-helper:0.1 (by /u/cynicaloctopus)',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.CLIENT_REFRESH_TOKEN
});

const entries = [];

function addEntries(newEntries) {
    console.log(newEntries.length);
    entries = newEntries;
}

r.getSubreddit('youtubehaiku')
    .getTop({ time: 'week', limit: 50 })
    .map(post => post.url)
    .then(addEntries);

const app = express();

app.get('/youtubehaiku/top', function (req, res) {
    res.send(entries);
});

app.listen(8080, function () {
    console.log('started');
});
