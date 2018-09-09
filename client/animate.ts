import * as $ from "jquery";

const animationEndEventName = (function (el) {
    var animations = {
        animation: 'animationend',
        OAnimation: 'oAnimationEnd',
        MozAnimation: 'mozAnimationEnd',
        WebkitAnimation: 'webkitAnimationEnd',
    };

    for (var t in animations) {
        if (el.style[t] !== undefined) {
            return animations[t];
        }
    }
})(document.createElement('div'));

export function AnimateElement(element: JQuery, animationName: string, callback?: () => void) {
    element.addClass('animated ' + animationName).one(animationEndEventName, function () {
        $(element).removeClass('animated ' + animationName);

        if (typeof callback === 'function') callback();
    });
}
