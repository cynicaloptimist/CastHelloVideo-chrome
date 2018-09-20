import * as $ from "jquery";

declare var gapi;

export async function addToPlaylist(playlistId, videoId, startPos?, endPos?) {
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

export async function createPlaylist(redditPath: string) {
  return new Promise(resolve => {
    var request = gapi.client.youtube.playlists.insert({
      part: 'snippet,status',
      resource: {
        snippet: {
          title: 'Videos posted to Reddit: ' + redditPath,
          description: 'Created with RedditSlurp'
        },
        status: {
          privacyStatus: 'private'
        }
      }
    });
    request.execute(function (response) {
      var result = response.result;
      if (result) {
        resolve(result.id);
      } else {
        $('#status').html('Could not create playlist');
        throw (response);
      }
    });
  })
}
