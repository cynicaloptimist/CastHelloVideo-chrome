import * as _ from "lodash";
import * as $ from "jquery";

declare var gapi;

$.getJSON('/youtubehaiku/top', (ids: string[]) => {
    $('.play')
        .prop("disabled", false)
        .click(() => {
            const request = gapi.client.youtube.playlists.insert({
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
            
        });
}, err => console.error(err));