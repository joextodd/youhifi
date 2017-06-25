export const Player = () => ({
  state: {
    player: null,
    playing: false,
  },
  actions: {
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
