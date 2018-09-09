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

export async function AnimateElement(element: JQuery, animationName: string): Promise<JQuery> {
    return new Promise<JQuery>(resolve => {
        element.addClass('animated ' + animationName).one(animationEndEventName, function () {
            $(element).removeClass('animated ' + animationName);
            resolve(element);
        });
    });
}
