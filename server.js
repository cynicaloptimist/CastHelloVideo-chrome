const express = require('express');
const snoowrap = require('snoowrap');

const r = new snoowrap({
  userAgent: 'node:subreddit-cast-helper:0.1 (by /u/cynicaloctopus)',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.CLIENT_REFRESH_TOKEN
});

const app = express();

function log(g) {
    console.log(g);
}

r.getSubreddit('youtubehaiku').getTop({ time: 'week' }).then(log);

/*    
    
    .map(post => post.title)
    .then(console.log);
  */  
return;