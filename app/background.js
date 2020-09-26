import throttle from '../lib/throttle.js'
import { parseYouTubeUrl } from './helpers/parser.js'

const YT_INFO_URL = 'https://www.youtube.com/get_video_info'
const clamp = z => (min,max) => Math.min(Math.max(z, min), max)

/**
 * Configure Chrome's global media panel.
 */
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
      player.play()
      chrome.runtime.sendMessage({ action: 'setPlaying', params: true })
    });
    navigator.mediaSession.setActionHandler('pause', function () {
      player.pause()
      chrome.runtime.sendMessage({ action: 'setPlaying', params: false })
    });
    navigator.mediaSession.setActionHandler('seekbackward', function () {
      const time = clamp(player.currentTime + -10)(0, player.duration)
      player.currentTime = time
      chrome.runtime.sendMessage({ action: 'setCurrentTime', params: time })
    });
    navigator.mediaSession.setActionHandler('seekforward', function () {
      const time = clamp(player.currentTime + 10)(0, player.duration)
      player.currentTime = time
      chrome.runtime.sendMessage({ action: 'setCurrentTime', params: time })
    });
    navigator.mediaSession.setActionHandler('previoustrack', function () {
      chrome.runtime.sendMessage({ action: 'prevVideo' })
    });
    navigator.mediaSession.setActionHandler('nexttrack', function () {
      chrome.runtime.sendMessage({ action: 'nextVideo' })
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
    chrome.runtime.sendMessage({ action: 'setPlaying', params: !player.paused })
    sendResponse({ ok: true })
  }
  else if (message.videoId) {
    console.log(`Fetching audio stream for ${message.videoId}`)
    fetch(`${YT_INFO_URL}?video_id=${message.videoId}`)
    .then(r => r.text())
    .then(response => {
      let data = {}
      parseYouTubeUrl(response, data)
      let info = JSON.parse(data.player_response)
      console.log(info)
      if (info.streamingData) {
        let audio = info.streamingData.adaptiveFormats.find(x => x.audioQuality === 'AUDIO_QUALITY_HIGH')
        if (!audio) {
          audio = info.streamingData.adaptiveFormats.find(x => x.audioQuality === 'AUDIO_QUALITY_MEDIUM')
        }
        if (!audio) {
          const err = `Failed to find an audio stream for ${message.videoId}`
          sendResponse({ err })
        } else {
          player.videoId = message.videoId
          player.title = info.videoDetails.title
          player.src = audio.url
          player.play()

          globalMediaSettings(player, info)

          sendResponse({
            id: message.videoId,
            title: info.videoDetails.title,
            url: audio.url
          })
        }
      } else {
        sendResponse({ err: 'Audio streaming unavailable' })   
      }
    })
    .catch(err => {
      console.error(err)
      sendResponse({ err })
    })
    return true
  }
  else if (message.getCurrentTrack) {
    sendResponse({
      id: player.videoId,
      title: player.title,
      playing: !player.paused,
    })
    return true
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
 * Set a referer header for API restrictions.
 */
const extraInfoSpec = ['blocking', 'requestHeaders'];
if (chrome.webRequest.OnBeforeSendHeadersOptions.hasOwnProperty('EXTRA_HEADERS')) extraInfoSpec.push('extraHeaders');
  
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
  var newRef = "https://hifi.joextodd.com";
  var gotRef = false;
  for (var n in details.requestHeaders) {
    gotRef = details.requestHeaders[n].name.toLowerCase() == "referer";
    if (gotRef) {
      details.requestHeaders[n].value = newRef;
      break;
    }
  }
  if (!gotRef) {
    details.requestHeaders.push({ name:"Referer", value:newRef });
  }
  return {requestHeaders:details.requestHeaders};
}, {
  urls: ["https://www.googleapis.com/*"]
}, extraInfoSpec);