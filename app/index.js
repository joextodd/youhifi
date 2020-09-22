import h from '../lib/hyperapp/h.js'
import app from '../lib/hyperapp/app.js'
import smoothscroll from '../lib/smoothscroll.js'

import { Player } from './mixins/player.js'
import { Search } from './mixins/search.js'
import { History } from './mixins/history.js'

import playPage from './pages/play.js'

import { iOS, scrollToSearch } from './helpers/window.js'
import { scrapeRelated } from './helpers/youtube.js'
import { sendBackground, listenBackground } from './helpers/chrome.js'

smoothscroll()

/*
TODO:
- Separate history component from search, and tidy up
- Better error logging when adaptiveFormats not available (use popup?)
*/

app({
  state: {
    track: {},
    isFetching: true,
  },
  actions: {
    setFetching: (s,a,d) => ({ isFetching: d }),
    setTrack: (s,a,d) => ({ track: d }),
    prevVideo: (s,a,d) => a.getPrevTrack(d),
    nextVideo: (s,a,d) => a.getNextTrack(d),
    getVideo: (s,a,id) => {
      a.setError(false)
      a.setFetching(true)
      a.setPlaying(!iOS())
      sendBackground({ videoId: id }).then(track => {
        console.log(track)
        a.setTrack(track)
        a.setFetching(false)
        a.storeTrack({ id: track.id, title: track.title })
        s.searchString.length === 0 &&
          scrapeRelated(id)
          .then(({items}) => a.setSearchResults(items))
      })
      .catch(_ => {
        console.log('ERRORED')
        a.setFetching(false)
        a.setError(true)
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
