import * as _ from "lodash";
import * as $ from "jquery";

import { checkAuth, handleAuthResult } from "./google-auth";
import { createPlaylist, addToPlaylist } from "./youtube";
import { RedditPost, RedditResponse } from "./reddit";
import { AnimateElement } from "./animate";

const redditPath = "r/youtubehaiku/top.json?t=week&limit=5";

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

function handleAPILoaded() {
  $("#playlist-button").prop("disabled", false);
}

let posts: { data: RedditPost; element: JQuery }[] = [];

interface Video {
  id: string;
  startTime?: string;
  endTime?: string;
}

function getVideoFromUrl(urlString: string): Video {
  const url = new URL(urlString);

  const video = {
    id: null,
    startTime: null,
    endTime: null
  };

  if (url.searchParams.has("v")) {
    video.id = url.searchParams.get("v");
  } else if (url.hostname == "youtu.be") {
    video.id = url.pathname.replace("/", "");
  }

  if (url.searchParams.has("t")) {
    video.startTime = url.searchParams.get("t");
  }
  if (url.searchParams.has("start")) {
    video.startTime = url.searchParams.get("start");
  }

  return video;
}

$(".button--get-videos").click(() => {

  $.getJSON('https://www.reddit.com/' + redditPath, (response: RedditResponse) => {
    posts = response.data.children.sort((a, b) => a.data.created_utc - b.data.created_utc)
      .map((c, i) => ({
        data: c.data,
        element: $(`<p id="imported-reddit-video--${i}">${c.data.title} [${c.data.url}] <span>[x]</span></p>`)
      }));

    $(".button--make-playlist").prop("disabled", false);

    const list = $(".video-list");
    for (let index = 0; index < posts.length; index++) {
      const post = posts[index];
      post.element.find("span").click(async () => {
        await AnimateElement(post.element, "bounceOutLeft");
        post.element.css("visibility", "hidden");
        post.element.slideUp();
        posts.splice(index, 1);
      });
      
      list.append(post.element);
    }
  });
});

$(".button--make-playlist").click(() => {
  if (posts.length == 0) {
    return;
  }
  createPlaylist(async playlistId => {
    for (const post of posts) {
      const video = getVideoFromUrl(post.data.url);
      if (video) {
        try {
          await addToPlaylist(playlistId, video.id, video.startTime);
        }
        catch (e) {
          console.warn(`Problem adding video ${JSON.stringify(video)}: ${JSON.stringify(e)}`);
        }
      }
    }
    $(".playlist-link").html(`<a href="https://www.youtube.com/playlist?list=${playlistId}" target="_blank">Created Playlist</a>`);
  }, redditPath);
});