const clamp = z => (min,max) => Math.min(Math.max(z, min), max)

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
      s.player && s.player.pause()
      return ({ playing: false })
    },
    playPause: (s,a,d) => {
      s.player.paused ? s.player.play() : s.player.pause()
      return ({ playing: !s.player.paused })
    },
    seekBy: ({player},a,d) => {
      const time = clamp(player.currentTime + d)(0, player.duration)
      player.currentTime = time
      return ({ currentTime: time })
    },
  },
})
