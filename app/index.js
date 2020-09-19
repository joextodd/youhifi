import h from '../lib/hyperapp/h.js'
import app from '../lib/hyperapp/app.js'
import smoothscroll from '../lib/smoothscroll.js'

import { Player } from './mixins/player.js'
import { Search } from './mixins/search.js'

import playPage from './pages/play.js'

import { iOS, scrollToSearch } from './helpers/window.js'
import { fetchRelated } from './helpers/youtube.js'
import { listenStorage, setStorageData, sendBackground, listenBackground } from './helpers/chrome.js'

smoothscroll()

/*
TODO:
  - Enable previous track, by storing last ten items in storage
  - Remove official videos from search
  - Final tidy ups
*/

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
      console.log('fetching next video')
      // a.setFetching(true)
      // a.setTrack({ id: s.track.id })
      // fetchRelated(s.track.id)
      //   .then(data => data.items[parseInt(Math.random() * data.items.length)].id.videoId)
      //   .then(id => setStorageData({ id }))
      //   .catch(console.error)
    },
    getVideo: (s,a,id) => {
      a.setError(false)
      a.setFetching(true)
      a.setPlaying(!iOS())
      sendBackground({ videoId: id }).then(track => {
        console.log(track)
        a.setTrack(track)
        a.setFetching(false)
        console.log(s)
        // s.searchString.length === 0 &&
        //     fetchRelated(id)
        //     .then(({items}) => a.setSearchResults(items))
      })
      .catch(_ => a.setError(true))
    },
    storageUpdate: (s,a,d) => {
      console.log(d)
      if (d.id && d.id !== s.track.id) {
        getVideo(d.id)
      }
    }
  },
  events: {
    init: (s,a) => {
      console.log('INIT')
      console.log(s)
      listenStorage(a)
      listenBackground(a)
      sendBackground({ initPlayer: true })
      sendBackground({ getCurrentTrack: true }).then(track => {
        track && a.getVideo(track.id)
      })
      a.getVideo('C35OJ81vv9g')
    }
  },
  view: playPage,
  mixins: [Player, Search],
})
