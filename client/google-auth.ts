import * as $ from "jquery";

declare var gapi;
// The client ID is obtained from the {{ Google Cloud Console }}
// at {{ https://cloud.google.com/console }}.
// If you run this code from a server other than http://localhost,
// you need to register your own client ID.
const OAUTH2_CLIENT_ID = '242493825035-7qbipme8ck42aniqtkgr2e94a2f7ibib.apps.googleusercontent.com';
const OAUTH2_SCOPES = [
    'https://www.googleapis.com/auth/youtube'
];

// Attempt the immediate OAuth 2.0 client flow as soon as the page loads.
// If the currently logged-in Google Account has previously authorized
// the client specified as the OAUTH2_CLIENT_ID, then the authorization
// succeeds with no user intervention. Otherwise, it fails and the
// user interface that prompts for authorization needs to display.
export async function checkAuth() {
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
export function handleAuthResult(authResult, handleAPILoaded) {
    if (authResult && !authResult.error) {
        // Authorization was successful. Hide authorization prompts and show
        // content that should be visible after authorization succeeds.
        $('.button--youtube-login').hide();
        loadAPIClientInterfaces(handleAPILoaded);
    } else {
        // Make the #login-link clickable. Attempt a non-immediate OAuth 2.0
        // client flow. The current function is called when that flow completes.
        $('.button--youtube-login').click(function () {
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
function loadAPIClientInterfaces(handleAPILoaded) {
    gapi.client.load('youtube', 'v3', function () {
      handleAPILoaded();
    });
  }
    