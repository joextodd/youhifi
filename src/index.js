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

const url = 'https://api.joextodd.com'

app({
  state: {
    id: '',
    track: {},
    isFetching: true,
  },
  actions: {
    setId: (s,a,d) => ({ id: d }),
    setFetching: (s,a,d) => ({ isFetching: d }),
    setTrack: (s,a,d) => ({ id: d.id || s.id, track: d }),
    prevVideo: (s,a,d) => window.history.back(),
    nextVideo: (s,a,d) => {
      a.pause()
      if (!s.partyId || (s.partyId && s.partyQ.length <= 1))
        fetchRelated(s.id)
        .then(data => data.items[parseInt(Math.random() * data.items.length)].id.videoId)
        .then(id => s.partyId
          ? a.savePartyState(id)
          : a.router.go(`/${id}`)
        ).catch(console.log)
      s.partyId && a.nextQTrack()
    },
    getVideo: (s,a,d) => {
      a.setFetching(true)
      fetch(`${url}/video/${s.id}`)
      .then(r => r.json())
      .then(d => {
        a.setFetching(false)
        document.title = d.title
        a.setWebm(s.player.canPlayType('audio/webm') ? true : false)
        a.setTrack(d)
      })
      .catch(console.log)
    },
  },
  events: {
    route: (s,a,d) => {
      a.pause()
      if (d.match === '/') {
        s.id && scrollToSearch()
      }
      if (d.match === '/:id') {
        a.setError(false)
        a.setCurrentTime(0)
        a.setId(d.params.id)
        a.setPlaying(!iOS())
        a.getVideo()
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
