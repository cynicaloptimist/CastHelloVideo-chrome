import * as _ from "lodash";
import * as $ from "jquery";

const castUrls = (urls: string[]) => {
    
};

$.getJSON('/youtubehaiku/top', (urls: string[]) => {
    $('.play')
        .prop("disabled", false)
        .click(() => {
            castUrls(urls);
        });
}, err => console.error(err));
