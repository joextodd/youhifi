export const Player = () => ({
  state: {
    player: null,
    playing: false,
  },
  events: {
    loaded: (s,a,d) => ({ playing: s.iOS ? false : true })
  },
  actions: {
    playPause: (s,a,d) => {
      s.player.paused ? s.player.play() : s.player.pause()
      return ({ playing: s.player.paused })
    },
    rewind: (s,a,d) => {
      s.player.currentTime = Math.max(s.player.currentTime - 10, 0)
    },
    forwards: (s,a,d) => {
      s.player.currentTime = Math.min(s.player.currentTime + 10, s.player.duration)
    },
    iosDuration: (s,a,d) => {
      s.player ? (s.player.currentTime > s.player.duration / 2) : false
    },
  },
})
