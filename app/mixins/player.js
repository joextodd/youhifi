const clamp = z => (min,max) => Math.min(Math.max(z, min), max)

export const Player = () => ({
  state: {
    player: null,
    playing: false,
    error: false,
    currentTime: 0,
    webm: false,
  },
  actions: {
    setWebm: (s,a,d) => ({ webm: d }),
    setCurrentTime: (s,a,d) => ({ currentTime: d }),
    setError: (s,a,d) => ({ error: d }),
    setPlaying: (s,a,d) => ({ playing: d }),
    pause: (s,a,d) => {
      s.player && s.player.pause()
      a.setPlaying(false)
    },
    playPause: (s,a,d) => {
      s.player.paused ? s.player.play() : s.player.pause()
      a.setPlaying(!s.player.paused)
    },
    seekBy: ({player},a,d) => {
      const time = clamp(player.currentTime + d)(0, player.duration)
      player.currentTime = time
      a.setCurrentTime(time)
    },
  },
})
