import * as _ from "lodash";
import * as $ from "jquery";

declare var gapi;
// The client ID is obtained from the {{ Google Cloud Console }}
// at {{ https://cloud.google.com/console }}.
// If you run this code from a server other than http://localhost,
// you need to register your own client ID.
var OAUTH2_CLIENT_ID = '242493825035-7qbipme8ck42aniqtkgr2e94a2f7ibib.apps.googleusercontent.com';
var OAUTH2_SCOPES = [
  'https://www.googleapis.com/auth/youtube'
];

// Upon loading, the Google APIs JS client automatically invokes this callback.
window["googleApiClientReady"] = function () {
  gapi.auth.init(function () {
    window.setTimeout(async () => {
      const auth = await checkAuth();
      handleAuthResult(auth);
    });
  });
}

// Attempt the immediate OAuth 2.0 client flow as soon as the page loads.
// If the currently logged-in Google Account has previously authorized
// the client specified as the OAUTH2_CLIENT_ID, then the authorization
// succeeds with no user intervention. Otherwise, it fails and the
// user interface that prompts for authorization needs to display.
async function checkAuth() {
  return new Promise((resolve, reject) => {
    gapi.auth.authorize({
      client_id: OAUTH2_CLIENT_ID,
      scope: OAUTH2_SCOPES,
      immediate: true
    }, (authResult) => {
      if (authResult.error) {
        reject(authResult.error);
      } else {
        resolve(authResult);
      }
    });
  })
}

// Handle the result of a gapi.auth.authorize() call.
function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    // Authorization was successful. Hide authorization prompts and show
    // content that should be visible after authorization succeeds.
    $('.pre-auth').hide();
    $('.post-auth').show();
    loadAPIClientInterfaces();
  } else {
    // Make the #login-link clickable. Attempt a non-immediate OAuth 2.0
    // client flow. The current function is called when that flow completes.
    $('#login-link').click(function () {
      gapi.auth.authorize({
        client_id: OAUTH2_CLIENT_ID,
        scope: OAUTH2_SCOPES,
        immediate: false
      }, handleAuthResult);
    });
  }
}

// Load the client interfaces for the YouTube Analytics and Data APIs, which
// are required to use the Google APIs JS client. More info is available at
// https://developers.google.com/api-client-library/javascript/dev/dev_jscript#loading-the-client-library-and-the-api
function loadAPIClientInterfaces() {
  gapi.client.load('youtube', 'v3', function () {
    handleAPILoaded();
  });
}

function handleAPILoaded() {
  $("#playlist-button").prop("disabled", false);
}

function createPlaylist(callback: (playlistId: string) => void) {
  var request = gapi.client.youtube.playlists.insert({
    part: 'snippet,status',
    resource: {
      snippet: {
        title: 'Test Playlist',
        description: 'A private playlist created with the YouTube API'
      },
      status: {
        privacyStatus: 'private'
      }
    }
  });
  request.execute(function (response) {
    var result = response.result;
    if (result) {
      callback(result.id);
    } else {
      $('#status').html('Could not create playlist');
    }
  });
}

// Add a video to a playlist. The "startPos" and "endPos" values let you
// start and stop the video at specific times when the video is played as
// part of the playlist. However, these values are not set in this example.
async function addToPlaylist(playlistId, videoId, startPos?, endPos?) {
  var details = {
    videoId,
    kind: 'youtube#video'
  }
  if (startPos != undefined) {
    details['startAt'] = startPos;
  }
  if (endPos != undefined) {
    details['endAt'] = endPos;
  }
  var request = gapi.client.youtube.playlistItems.insert({
    part: 'snippet',
    resource: {
      snippet: {
        playlistId,
        resourceId: details
      }
    }
  });

  return new Promise((resolve, reject) => {
    request.execute(function (response) {
      var result = response.result;
      if (result) {
        resolve(result);
      } else {
        reject(response);
      }
    });
  });
}

let videos: RedditPostData[] = [];

interface RedditResponse {
  data: {
    children: {
      data: RedditPostData
    }[]
  }
}

interface RedditPostData {
  title: string;
  url: string;
  created_utc: number;
}

function getVideoDataFromUrl(urlString: string): ({ videoId: string, startTime?: string } | undefined) {
  const url = new URL(urlString);
  if (url.searchParams.has("v")) {
    return {
      videoId: url.searchParams.get("v"),
      startTime: url.searchParams.get("t")
    };
  }
  if (url.hostname == "youtu.be") {
    return {
      videoId: url.pathname.replace("/", "")
    };
  }
}

$(".button--get-videos").click(() => {
  $.getJSON('https://www.reddit.com/r/youtubehaiku/top.json?t=week&limit=5', (response: RedditResponse) => {
    videos = response.data.children.map(c => c.data).sort((a, b) => a.created_utc - b.created_utc);
    $(".button--make-playlist").prop("disabled", false);
    $(".video-list").html(videos.map(video => `<p>${video.title} [${video.url}]</p>`).join("\n"));
  });
});

$(".button--make-playlist").click(() => {
  if (videos.length == 0) {
    return;
  }
  createPlaylist(async playlistId => {
    for (const video of videos) {
      const data = getVideoDataFromUrl(video.url);
      if (data) {
        try {
          await addToPlaylist(playlistId, data.videoId, data.startTime);
        }
        catch (e) {
          console.warn(`Problem adding video ${JSON.stringify(video)}: ${JSON.stringify(e)}`);
        }
      }
    }
    $(".playlist-link").html(`<a href="https://www.youtube.com/playlist?list=${playlistId}">Created Playlist</a>`);
  });
});