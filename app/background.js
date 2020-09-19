const YT_INFO_URL = 'https://www.youtube.com/get_video_info'

/**
 * Taken from youtube-stream-url
 */
const parseYouTubeUrl = (str, array) => {

    let strArr = String(str).replace(/^&/, '').replace(/&$/, '').split('&');
    let sal = strArr.length;
    let i;
    let j;
    let ct;
    let p;
    let lastObj;
    let obj;
    let undef;
    let chr;
    let tmp;
    let key;
    let value;
    let postLeftBracketPos;
    let keys;
    let keysLen;

    let _fixStr = function (str) {
        return decodeURIComponent(str.replace(/\+/g, '%20'))
    };

    let $global = (typeof window !== 'undefined' ? window : global);
    $global.$locutus = $global.$locutus || {};
    let $locutus = $global.$locutus;
    $locutus.php = $locutus.php || {};

    if (!array) {
        array = $global
    }

    for (i = 0; i < sal; i++) {
        tmp = strArr[i].split('=');
        key = _fixStr(tmp[0]);
        value = (tmp.length < 2) ? '' : _fixStr(tmp[1]);

        while (key.charAt(0) === ' ') {
            key = key.slice(1)
        }
        if (key.indexOf('\x00') > -1) {
            key = key.slice(0, key.indexOf('\x00'))
        }
        if (key && key.charAt(0) !== '[') {
            keys = [];
            postLeftBracketPos = 0;
            for (j = 0; j < key.length; j++) {
                if (key.charAt(j) === '[' && !postLeftBracketPos) {
                    postLeftBracketPos = j + 1
                } else if (key.charAt(j) === ']') {
                    if (postLeftBracketPos) {
                        if (!keys.length) {
                            keys.push(key.slice(0, postLeftBracketPos - 1))
                        }
                        keys.push(key.substr(postLeftBracketPos, j - postLeftBracketPos));
                        postLeftBracketPos = 0;
                        if (key.charAt(j + 1) !== '[') {
                            break
                        }
                    }
                }
            }
            if (!keys.length) {
                keys = [key]
            }
            for (j = 0; j < keys[0].length; j++) {
                chr = keys[0].charAt(j);
                if (chr === ' ' || chr === '.' || chr === '[') {
                    keys[0] = keys[0].substr(0, j) + '_' + keys[0].substr(j + 1)
                }
                if (chr === '[') {
                    break
                }
            }

            obj = array;
            for (j = 0, keysLen = keys.length; j < keysLen; j++) {
                key = keys[j].replace(/^['"]/, '').replace(/['"]$/, '');
                lastObj = obj;
                if ((key !== '' && key !== ' ') || j === 0) {
                    if (obj[key] === undef) {
                        obj[key] = {}
                    }
                    obj = obj[key]
                } else {
                    // To insert new dimension
                    ct = -1;
                    for (p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            if (Number(p) > ct && p.match(/^\d+$/g)) {
                                ct = Number(p)
                            }
                        }
                    }
                    key = ct + 1
                }
            }
            lastObj[key] = value
        }
    }
};

const clamp = z => (min,max) => Math.min(Math.max(z, min), max)

/**
 * Receive messages from the extension popup.
 * This allows us to play audio in the background, and fetch URLs.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`Fetching audio stream for ${message.videoId}`)
    fetch(`${YT_INFO_URL}?video_id=${message.videoId}`)
    .then(r => r.text())
    .then(response => {
        let data = {}
        parseYouTubeUrl(response, data)
        let info = JSON.parse(data.player_response)
        console.log(info)
        let audio = info.streamingData.adaptiveFormats.find(x => x.audioQuality === 'AUDIO_QUALITY_HIGH')
        if (!audio) {
            audio = info.streamingData.adaptiveFormats.find(x => x.audioQuality === 'AUDIO_QUALITY_MEDIUM')
        }
        if (!audio) {
            const err = `Failed to find an audio stream for ${message.videoId}`
            console.error(err)
            sendResponse({ err })
        } else {
            const player = document.getElementById('player')
            player.src = audio.url
            player.play()

            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: info.videoDetails.title,
                    artist: info.videoDetails.author,
                    artwork: [{ 
                        sizes: '320x180',
                        src: info.videoDetails.thumbnail.thumbnails.slice(-2)[0].url,
                        type: ''
                    }]
                });
            
                navigator.mediaSession.setActionHandler('play', function () {
                    player.play() 
                });
                navigator.mediaSession.setActionHandler('pause', function () { 
                    player.pause() 
                });
                navigator.mediaSession.setActionHandler('seekbackward', function () { 
                    const time = clamp(player.currentTime - 10)(0, player.duration)
                    player.currentTime = time
                });
                navigator.mediaSession.setActionHandler('seekforward', function () { 
                    const time = clamp(player.currentTime + 10)(0, player.duration)
                    player.currentTime = time
                });
                navigator.mediaSession.setActionHandler('previoustrack', function () { });
                navigator.mediaSession.setActionHandler('nexttrack', function () { });
            }

            sendResponse({
                id: message.videoId,
                title: info.videoDetails.title,
                url: audio.url
            })
        }
    })
    .catch(err => {
        console.error(err)
        sendResponse({ err })
    })
    return true
})

/**
 * Intercept requests and set the Referer header
 * so that we can restrict the YouTube API from others
 */
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
      details.requestHeaders.push({name: 'Referer', value: 'https://hifi.joextodd.com'});
      return {requestHeaders: details.requestHeaders};
    },
    {urls: ['https://www.googleapis.com/*']},
    ['blocking', 'requestHeaders']
);