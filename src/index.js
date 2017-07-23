import { h, app, Router } from 'hyperapp'
import smoothscroll from 'smoothscroll-polyfill'

import { Player } from './mixins/player'
import { Search } from './mixins/search'
import { Party } from './mixins/party'

import playPage from './pages/play'
import lostPage from './pages/lost'

import { iOS, scrollToSearch } from './helpers/window'
import { fetchRelated } from './helpers/youtube'

import 'whatwg-fetch'
import './index.css'
import './spinner.css'

smoothscroll.polyfill()

const url = 'https://api.joextodd.com'

app({
  state: {
    track: {},
    isFetching: true,
  },
  actions: {
    setFetching: (s,a,d) => ({ isFetching: d }),
    setTrack: (s,a,d) => ({ track: d }),
    prevVideo: (s,a,d) => window.history.back(),
    nextVideo: (s,a,d) => {
      a.setFetching(true)
      a.setTrack({ id: s.track.id })
      fetchRelated(s.track.id)
      .then(data => data.items[parseInt(Math.random() * data.items.length)].id.videoId)
      .then(id => a.router.go(`/${id}`))
      .catch(console.log)
    },
  },
  events: {
    route: (s,a,d) => {
      if (d.match === '/') {
        s.id && scrollToSearch()
      }
      if (d.match === '/:id') {
        a.setError(false)
        a.setFetching(true)
        a.setTrack({ id: d.params.id })
        a.setPlaying(!iOS())
        fetch(`${url}/video/${d.params.id}`)
          .then(r => r.json())
          .then(track => {
            document.title = track.title
            a.setTrack(Object.assign({ id: d.params.id }, track))
            a.setFetching(false)
          })
          .catch(console.log)
      }
      if (d.match === '/party/:pid') {
        a.setPartyId(d.params.pid)
        a.getPartyQ()
      }
    },
  },
  view: [
    ['/', playPage],
    ['/:id', playPage],
    ['/party/:pid', playPage],
    ['*', lostPage],
  ],
  mixins: [Router, Player, Search, Party],
})
