export const Player = () => ({
  state: {
    player: document.querySelector('audio'),
  },
  actions: {
    playPause: (s,a,d) => {
      s.player = document.querySelector('audio')
      s.player.paused ? s.player.play() : s.player.pause()
    },
    backwards: (s,a,d) => {
      s.player = document.querySelector('audio')
      s.player.currentTime = Math.max(s.player.currentTime - 10, 0)
    },
    forwards: (s,a,d) => {
      s.player = document.querySelector('audio')
      s.player.currentTime = Math.min(s.player.currentTime + 10, s.player.duration)
    },
    iosDuration: (s,a,d) => {
      s.player = document.querySelector('audio')
      return s.player ? (s.player.currentTime > s.player.duration / 2) : false
    }
  },
})

