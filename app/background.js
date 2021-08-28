import throttle from '../lib/throttle.js'


let relatedVideos = []
const clamp = z => (min,max) => Math.min(Math.max(z, min), max)
const ytdl = window.require('ytdl-core-browser')({ proxyUrl: '' })

/**
 * Configure Chrome's global media panel.
 */
const globalMediaSettings = (player, info) => {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: info.videoDetails.title,
      artist: info.videoDetails.media.artist,
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
    if (relatedVideos.length) {
      chrome.runtime.sendMessage({ action: 'setSearchResults', params: relatedVideos })
    }
    sendResponse({ ok: true })
  }
  else if (message.videoId) {
    console.log(`Fetching audio stream for ${message.videoId}`)
    ytdl.getInfo(message.videoId).then(info => {
      console.log(info)
      let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
      let audio = audioFormats.find(x => x.audioQuality === 'AUDIO_QUALITY_HIGH')
      if (!audio) {
        audio = audioFormats.find(x => x.audioQuality === 'AUDIO_QUALITY_MEDIUM')
      }
      if (!audio) {
        const err = `Failed to find an audio stream for ${message.videoId}`
        sendResponse({ err })
      } else {
        relatedVideos = info.related_videos
        player.videoId = message.videoId
        player.title = info.videoDetails.title
        player.src = audio.url
        player.play()

        globalMediaSettings(player, info)
        sendResponse({
          id: message.videoId,
          title: info.videoDetails.title,
          url: audio.url,
          related: info.related_videos,
        })
      }
    })
    .catch(err => {
      console.error(err)
      sendResponse({ err })
    });
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
