import * as _ from "lodash";
import * as $ from "jquery";
import { getSession, enqueueUrl } from "./cast-api";

const castUrls = (urls: string[]) => {
    console.log(urls[0]);
    const session = getSession();
    enqueueUrl(session, urls[0]);
};

$.getJSON('/youtubehaiku/top', (urls: string[]) => {
    $('.play')
        .prop("disabled", false)
        .click(() => {
            castUrls(urls);
        });
}, err => console.error(err));