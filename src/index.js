import { h, app, Router } from 'hyperapp'
import logger from '@hyperapp/logger'
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
import './popup.css'


// Check for any github-pages 404 redirect
history.replaceState(null, null, sessionStorage.redirect)
delete sessionStorage.redirect

// Register service worker if not on localhost
const local = window.location.host.startsWith('localhost')
if ('serviceWorker' in navigator && !local) navigator.serviceWorker.register('/sw.js')

smoothscroll.polyfill()

const url = 'https://api.audiostream.world'

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
      if (s.partyId && s.partyQ.length > 1) {
        a.nextQTrack()
      } else {
        a.setFetching(true)
        a.setTrack({ id: s.track.id })
        fetchRelated(s.track.id)
          .then(data => data.items[parseInt(Math.random() * data.items.length)].id.videoId)
          .then(id => s.partyId ? a.getVideo(id) : a.router.go(`/${id}`))
          .catch(console.log)
      }
    },
    getVideo: (s,a,id) => {
      a.setError(false)
      a.setFetching(true)
      a.setTrack({ id })
      a.setPlaying(!iOS())
      fetch(`${url}/video/${id}`)
        .then(r => r.json())
        .then(track => {
          document.title = track.title
          a.setTrack(track)
          a.setFetching(false)
          s.searchString.length === 0 &&
            fetchRelated(id)
            .then(({items}) => a.setSearchResults(items))
        })
        .catch(_ => a.setError(true))
    }
  },
  events: {
    route: (s,a,d) => {
      if (d.match === '/') s.track.id && a.search() && scrollToSearch()
      if (d.match === '/:id') {
        if (d.params.id.length === 11) {
          a.getVideo(d.params.id)
        } else {
          a.setPartyId(d.params.id)
          a.getPartyQ()
        }
      }
    },
  },
  view: [
    ['/', playPage],
    ['/:id', playPage],
    ['*', lostPage],
  ],
  mixins: [Router, Player, Search, Party],
})
