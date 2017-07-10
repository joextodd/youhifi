const between = (min,max) => z => Math.min(Math.max(z, min), max)

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
    seekBy: ({player},a,d) => {
      const time = between(0, player.duration)(player.currentTime + d)
      player.currentTime = time
      return ({ currentTime: time })
    },
  },
})
