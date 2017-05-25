const express = require('express');
const snoowrap = require('snoowrap');

const r = new snoowrap({
  userAgent: 'node:subreddit-cast-helper:0.1 (by /u/cynicaloctopus)',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: 'put your refresh token here'
});

const app = express();

r.getSubreddit('youtubehaiku')
    .getTop({ time: 'week' })
    .then(console.log);
        