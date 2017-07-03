import { h, app, Router } from 'hyperapp'
import smoothscroll from 'smoothscroll-polyfill'

smoothscroll.polyfill()

import { Player } from './mixins/player'
import { Search } from './mixins/search'

import playPage from './pages/play'

import 'whatwg-fetch'
import './index.scss'
import './spinner.scss'

const url = 'https://youtube.joextodd.com'

const lostPage = (s,a) =>
  h('h1', { onclick: e => a.router.go('/') },
    `Back to ${location.hostname}`
  )

app({
  state: {
    id: '',
    track: {},
    tracks: [],
    error: false,
    isFetching: true,
    iOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
  },
  actions: {
    setId: (s,a,d) => ({ id: d }),
    setError: (s,a,d) => ({ error: d }),
    setFetching: (s,a,d) => ({ isFetching: d }),
    prevVideo: (s,a,d) => {
      a.pause()
      window.history.back()
    },
    getVideo: (s,a,d) => {
      a.setFetching(true)
      fetch(`${url}/video/${s.id}`)
      .then(r => r.json())
      .then(d => {
        a.setFetching(false)
        document.title = d.title
        a.setTrack(d)
        a.addTrack(d)
      })
      .catch(console.log)
    },
    setTrack: (s,a,d) => ({ id: d.id || s.id, track: d }),
    addTrack: (s,a,d) => ({ tracks: s.tracks.concat(d) }),
  },
  events: {
    route: (s,a,d) => {
      if (d.match === '/') {
        s.player && s.player.pause()
        s.id &&
          window.scroll({
            top: window.innerHeight * .8,
            left: 0,
            behavior: 'smooth',
          })
      }
      if (d.match === '/:id') {
        a.setError(false)
        s.player && s.player.pause()
        a.setCurrentTime(0)
        a.setId(d.params.id)
        a.setPlaying(!s.iOS)
        a.getVideo()
      }
    },
  },
  view: [
    ['/', playPage],
    ['/:id', playPage],
    ['*', lostPage],
  ],
  mixins: [Router, Player, Search],
})
