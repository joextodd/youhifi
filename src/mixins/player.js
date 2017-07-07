export const Player = () => ({
  state: {
    player: null,
    playing: false,
    currentTime: 0,
    webm: false,
  },
  actions: {
    setWebm: (s,a,d) => ({ webm: d }),
    setCurrentTime: (s,a,d) => ({ currentTime: d }),
    setPlaying: (s,a,d) => ({ playing: d }),
    pause: (s,a,d) => {
      s.player.pause()
      return ({ playing: !s.player.paused })
    },
    playPause: (s,a,d) => {
      s.player.paused ? s.player.play() : s.player.pause()
      return ({ playing: !s.player.paused })
    },
    rewind: (s,a,d) => {
      s.player.currentTime = Math.max(s.player.currentTime - 10, 0)
    },
    forwards: (s,a,d) => {
      s.player.currentTime = Math.min(s.player.currentTime + 10, s.player.duration)
    },
  },
})
