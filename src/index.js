import { h, app, Router } from 'hyperapp'
import { Player } from './mixins/player'
import { YouTube } from './mixins/youtube'

import homePage from './pages/home'
import playPage from './pages/play'

import 'whatwg-fetch'
import './index.scss'
import './spinner.scss'

const url = 'https://youtube.joextodd.com'

const lostPage = (s,a) =>
  h('h1', { onclick: e => a.router.go('/') }, 'Back to {location.hostname}')

app({
  state: {
    id: '',
    track: {},
    tracks: [],
    isFetching: true,
    iOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
  },
  actions: {
    setId: (s,a,d) => ({ id: d }),
    setFetching: (s,a,d) => ({ isFetching: d }),
    getVideo: (s,a,d) => {
      a.setFetching(true)
      fetch(`${url}/video/${s.id}`)
      .then(r => r.json())
      .then(d => {
        a.setTrack(d)
        a.addTrack(d)
        a.setFetching(false)
      })
      .catch(console.log)
    },
    setTrack: (s,a,d) => ({ id: d.id || s.id, track: d }),
    addTrack: (s,a,d) => ({ tracks: s.tracks.concat(d) }),
  },
  events: {
    // action: console.log,
    route: (s,a,d) => {
      if (d.match === '/play/:id') {
        a.setId(d.params.id)
        a.setPlaying(!s.iOS)
        a.getVideo()
      }
    }
  },
  view: [
    ['/', homePage],
    ['/play/:id', playPage],
    ['*', lostPage],
  ],
  mixins: [Router, Player, YouTube],
})
