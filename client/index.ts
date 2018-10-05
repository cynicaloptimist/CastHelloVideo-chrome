import * as _ from "lodash";
import * as $ from "jquery";

import { checkAuth, handleAuthResult } from "./google-auth";
import { createPlaylist, addToPlaylist } from "./youtube";
import { RedditPost, RedditResponse } from "./reddit";
import { AnimateElement } from "./animate";

function getRedditPath(subredditName: string, sort: string, time: string, limit: number) {
  return `r/${subredditName}/${sort}.json?t=${time}&limit=${limit}`;
}

declare var gapi;

// Upon loading, the Google APIs JS client automatically invokes this callback.
window["googleApiClientReady"] = function () {
  gapi.auth.init(function () {
    window.setTimeout(async () => {
      const auth = await checkAuth();
      handleAuthResult(auth, handleAPILoaded);
    });
  });
}

window["adsbygoogle"] = [{
  google_ad_client: "ca-pub-4726215415553638",
  enable_page_level_ads: true
}];

function handleAPILoaded() {
  $(".col--make-playlist").css("display", "block");
  $(".col--youtube-login").css("display", "none");
}

interface PostAndElement {
  data: RedditPost;
  element: JQuery
}

let posts: PostAndElement[] = [];

interface Video {
  id: string;
  startTime?: string;
  endTime?: string;
}

//From https://stackoverflow.com/a/27728417/514072
const youtubeRegex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
function getIdFromUrl(urlString: string) {
  const r = urlString.match(youtubeRegex);
  return r && r[1] || null;
}

function getVideoFromUrl(urlString: string): Video {
  const url = new URL(urlString);

  const video = {
    id: null,
    startTime: null,
    endTime: null
  };

  video.id = getIdFromUrl(url.href);
  if (url.searchParams.has("t")) {
    video.startTime = url.searchParams.get("t");
  }
  if (url.searchParams.has("start")) {
    video.startTime = url.searchParams.get("start");
  }

  return video;
}

let redditPath = "";

function getVideos() {
  const { subredditName, postCount } = getConfigurationOrDefaults();
  redditPath = getRedditPath(subredditName, "top", "week", postCount);

  $.getJSON('https://www.reddit.com/' + redditPath, (response: RedditResponse) => {
    posts = response.data.children.sort((a, b) => a.data.created_utc - b.data.created_utc)
      .map((c, i) => ({
        data: c.data,
        element: $(`
        <li class="list-group-item" id="imported-reddit-video--${i}">
          <a href="${c.data.url}" target="_blank">${c.data.title}</a>
          <button type="button" class="close" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </li>`)
      }));

    $(".button--get-videos").prop("disabled", true);
    $(".button--make-playlist").prop("disabled", false);

    const list = $(".video-list");
    for (const post of posts) {
      post.element.find("button.close").click(() => AnimateRemovePost(post, "bounceOutLeft"));
      AnimateAddPost(post, list);
    }
  });
}

function getConfigurationOrDefaults() {
  const subredditName = $(".configuration--subreddit").val() || "youtubehaiku";
  const parsedPostCount = parseInt($(".configuration--post-count").val());
  const postCount = parsedPostCount > 0 ? parsedPostCount : 5;

  return { subredditName, postCount };
}

async function AnimateAddPost(post, list) {
  return new Promise<JQuery>(resolve => {
    post.element.css("visibility", "hidden");
    list.append(post.element);
    post.element.slideDown(100, async () => {
      post.element.css("visibility", "visible");
      await AnimateElement(post.element, "bounceInLeft");
      resolve();
    });
  })
}

async function AnimateRemovePost(post: PostAndElement, animation: string) {
  return new Promise<JQuery>(resolve => {
    AnimateElement(post.element, animation);
    setTimeout(() => {
      post.element.css("visibility", "hidden");
      post.element.slideUp(100, () => post.element.remove());
      _.remove(posts, post);
      resolve(post.element);
    }, 300);
  });
}

async function makePlaylist() {
  if (posts.length == 0) {
    return;
  }

  const playlistId = await createPlaylist(redditPath);
  for (const post of posts.slice()) {
    const video = getVideoFromUrl(post.data.url);
    if (video) {
      try {
        await addToPlaylist(playlistId, video.id, video.startTime);
        AnimateRemovePost(post, "bounceOutRight");
      }
      catch (e) {
        console.warn(`Problem adding video ${JSON.stringify(video)}: ${JSON.stringify(e)}`);
        AnimateElement(post.element, "shake");
        post.element.addClass("list-group-item-warning");
      }
    }
  }
  $(".button--view-playlist").prop("disabled", false).click(() => window.open(`https://www.youtube.com/playlist?list=${playlistId}`, "_blank"));
  $(".button--make-playlist").prop("disabled", true);
}

$(".button--get-videos").click(getVideos);
$(".button--make-playlist").click(makePlaylist);