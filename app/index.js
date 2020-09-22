import h from '../lib/hyperapp/h.js'
import app from '../lib/hyperapp/app.js'
import smoothscroll from '../lib/smoothscroll.js'

import { Player } from './mixins/player.js'
import { Search } from './mixins/search.js'
import { History } from './mixins/history.js'

import playPage from './pages/play.js'

import { iOS, scrollToSearch } from './helpers/window.js'
import { fetchRelated } from './helpers/youtube.js'
import { getStorageData, setStorageData, sendBackground, listenBackground } from './helpers/chrome.js'

smoothscroll()

/*
TODO:
- If there is a history show that on the home page, otherwise show mostPopular
- Can we get the next related video without using the API?
- Can we reduce API usage at any further? Check that search is not used until scrolldown or enter press
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
        a.storeTrack(track.id)
        s.searchString.length === 0 &&
          fetchRelated(id)
          .then(({items}) => a.setSearchResults(items))
      })
      .catch(_ => {
        console.log('ERRORED')
        a.setFetching(false)
        a.setError('UNPLAYABLE')
      })
    }
  },
  events: {
    init: (s,a) => {
      listenBackground(a)
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
