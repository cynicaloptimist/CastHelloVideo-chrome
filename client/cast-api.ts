declare var chrome: any, cast: any;

interface Session {
    loadMedia: Function;
}

window['initializeCastApi'] = function () {
  cast.framework.CastContext.getInstance().setOptions({
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
  });
};

export const getSession = (): Session => cast.framework.CastContext.getInstance().getCurrentSession();

export const enqueueUrl = (session: Session, url: string) => {
    if (!session) {
        return;
    }

    const mediaInfo = new chrome.cast.media.MediaInfo(url, 'video/mp4');
    const request = new chrome.cast.media.LoadRequest(mediaInfo);
    
    session.loadMedia(request).then(
        function () {
            console.log('Load succeed');
        },
        function (errorCode: string) {
            console.log('Error code: ' + errorCode);
        }
    );
}