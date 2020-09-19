import { sendBackground } from '../helpers/chrome.js'

export const Player = () => ({
  state: {
    playing: false,
    error: false,
    currentTime: 0,
    duration: 0,
    webm: false,
  },
  actions: {
    setWebm: (s,a,d) => ({ webm: d }),
    setCurrentTime: (s,a,d) => ({ currentTime: d }),
    setDuration: (s,a,d) => ({ duration: d }),
    setError: (s,a,d) => ({ error: d }),
    setPlaying: (s,a,d) => ({ playing: d }),
    play: (s,a,d) => sendBackground({ play: true }),
    pause: (s,a,d) => sendBackground({ pause: true }),
    playPause: (s,a,d) => {
      !s.playing ? 
        sendBackground({ play: true }).then(() => a.setPlaying(true)) : 
          sendBackground({ pause: true }).then(() => a.setPlaying(false))
    },
    seekBy: ({player},a,d) => sendBackground({ seekBy: d }),
  },
})
