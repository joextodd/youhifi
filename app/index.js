import h from '../lib/hyperapp/h.js'
import app from '../lib/hyperapp/app.js'
import smoothscroll from '../lib/smoothscroll.js'

import { Player } from './mixins/player.js'
import { Search } from './mixins/search.js'
import { History } from './mixins/history.js'

import playPage from './pages/play.js'

import { sendBackground, listenBackground } from './helpers/chrome.js'

smoothscroll()

/*
TODO:
- Add clear history button?
*/

app({
  state: {
    track: {},
    isFetching: false,
  },
  actions: {
    setFetching: (s,a,d) => ({ isFetching: d }),
    setTrack: (s,a,d) => ({ track: d }),
    prevVideo: (s,a,d) => a.getPrevTrack(d),
    nextVideo: (s,a,d) => a.getNextTrack(d),
    getVideo: (s,a,id) => {
      a.setError(false)
      a.setFetching(true)
      a.setPlaying(false)
      a.setTrack({ id })
      sendBackground({ videoId: id }).then(track => {
        console.log(track)
        a.setTrack(track)
        a.setPlaying(true)
        a.setFetching(false)
        a.storeTrack({ id: track.id, title: track.title })
        track.related.length && a.setSearchResults(track.related)
      })
      .catch(err => {
        console.error(err)
        s.searchResults.length && a.setSearchResults(s.searchResults.slice(1))
        a.setFetching(false)
        a.setError('UNPLAYABLE')
        console.error('UNPLAYABLE')
      })
    }
  },
  events: {
    init: (s,a) => {
      listenBackground(a)
      a.getHistory()
      sendBackground({ initPlayer: true })
      sendBackground({ getCurrentTrack: true }).then(track => {
        if (track.id) {
          a.setTrack(track)
          a.setError(false)
          a.setFetching(false)
          a.setPlaying(track.playing)
        }
      })
    }
  },
  view: playPage,
  mixins: [Player, Search, History],
})
