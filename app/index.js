import h from '../lib/hyperapp/h.js'
import app from '../lib/hyperapp/app.js'
// import smoothscroll from '../lib/smoothscroll.js'

import { Player } from './mixins/player.js'
import { Search } from './mixins/search.js'

import playPage from './pages/play.js'

import { iOS, scrollToSearch } from './helpers/window.js'
import { fetchRelated } from './helpers/youtube.js'
import { listenStorage, getStorageData, setStorageData, getUrl } from './helpers/chrome.js'

// smoothscroll.polyfill()

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
        .then(id => setStorageData({ id }))
        .catch(console.error)
    },
    getVideo: (s,a,id) => {
      a.setError(false)
      a.setFetching(true)
      a.setTrack({ id })
      a.setPlaying(!iOS())
      getUrl(id).then(track => {
        console.log(track)
        a.setTrack(track)
        a.setFetching(false)
        s.searchString.length === 0 &&
            fetchRelated(id)
            .then(({items}) => a.setSearchResults(items))
      })
    },
    storageUpdate: (s,a,d) => {
      console.log(d)
      d.id && a.getVideo(d.id)
    }
  },
  events: {
    init: (s,a) => listenStorage(a)
  },
  view: playPage,
  mixins: [Player, Search],
})
