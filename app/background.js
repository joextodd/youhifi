import throttle from '../lib/throttle.js'
import { parseYouTubeUrl } from './helpers/parser.js'

const YT_INFO_URL = 'https://www.youtube.com/get_video_info'

const trackHistory = []
const currentTrack = null
const clamp = z => (min,max) => Math.min(Math.max(z, min), max)

const globalMediaSettings = (player, info) => {
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
            console.log('Setting playing')
            player.play()
            chrome.runtime.sendMessage({ action: 'setPlaying', params: true })
        });
        navigator.mediaSession.setActionHandler('pause', function () { 
            console.log('Setting pausing')
            player.pause()
            chrome.runtime.sendMessage({ action: 'setPlaying', params: false })
        });
        navigator.mediaSession.setActionHandler('seekbackward', function () { 
            console.log('Setting seek back')
            const time = clamp(player.currentTime + -10)(0, player.duration)
            player.currentTime = time
            chrome.runtime.sendMessage({ action: 'setCurrentTime', params: time })
        });
        navigator.mediaSession.setActionHandler('seekforward', function () { 
            console.log('Setting seek forward')
            const time = clamp(player.currentTime + 10)(0, player.duration)
            player.currentTime = time
            chrome.runtime.sendMessage({ action: 'setCurrentTime', params: time })
        });
        navigator.mediaSession.setActionHandler('previoustrack', function () {
            console.log('Setting prev track')
        });
        navigator.mediaSession.setActionHandler('nexttrack', function () {
            console.log('Setting next track')
            // chrome.runtime.sendMessage({ action: 'nextVideo' })
        });
    }
}

/**
 * Receive messages from the extension popup.
 * This allows us to play audio in the background, and fetch URLs.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const player = document.getElementById('player')
    if (message.initPlayer) {
        player.onerror = () => chrome.runtime.sendMessage({ action: 'setError', params: true })
        player.oncanplay = () => chrome.runtime.sendMessage({ action: 'setError', params: false })
        player.ontimeupdate = throttle(1000, e => {
            chrome.runtime.sendMessage({ action: 'setCurrentTime', params: player.currentTime })
            chrome.runtime.sendMessage({ action: 'setDuration', params: player.duration })
            if (player.currentTime > player.duration) {
                chrome.runtime.sendMessage({ action: 'nextVideo' })
            }
        })
        player.onended = () => chrome.runtime.sendMessage({ action: 'nextVideo' })
    }
    else if (message.videoId) {
        console.log(`Fetching audio stream for ${message.videoId}`)
        fetch(`${YT_INFO_URL}?video_id=${message.videoId}`)
        .then(r => r.text())
        .then(response => {
            let data = {}
            parseYouTubeUrl(response, data)
            let info = JSON.parse(data.player_response)
            let audio = info.streamingData.adaptiveFormats.find(x => x.audioQuality === 'AUDIO_QUALITY_HIGH')
            if (!audio) {
                audio = info.streamingData.adaptiveFormats.find(x => x.audioQuality === 'AUDIO_QUALITY_MEDIUM')
            }
            if (!audio) {
                const err = `Failed to find an audio stream for ${message.videoId}`
                sendResponse({ err })
            } else {
                player.title = info.videoDetails.title
                player.src = audio.url
                player.play()

                globalMediaSettings(player, info)
                trackHistory.push(message.videoId)

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
    }
    else if (message.getCurrentTrack) {
        sendResponse(currentTrack)
    }
    else if (message.getPreviousTrack) {
        if (trackHistory.length() > 1) {
            sendResponse(trackHistory.slice(-1)[0])
        }
    }
    else if (message.play) {
        player.play()
        chrome.runtime.sendMessage({ action: 'setPlaying', params: true })
        sendResponse({ ok: true })
        return true
    }
    else if (message.pause) {
        player.pause()
        chrome.runtime.sendMessage({ action: 'setPlaying', params: false })
        sendResponse({ ok: true })
        return true
    }
    else if (message.seekBy) {
        const time = clamp(player.currentTime + message.seekBy)(0, player.duration)
        player.currentTime = time
        chrome.runtime.sendMessage({ action: 'setCurrentTime', params: time })
        sendResponse({ time })
        return true
    }
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