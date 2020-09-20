import h from '../lib/hyperapp/h.js'
import app from '../lib/hyperapp/app.js'
import smoothscroll from '../lib/smoothscroll.js'

import { Player } from './mixins/player.js'
import { Search } from './mixins/search.js'

import playPage from './pages/play.js'

import { iOS, scrollToSearch } from './helpers/window.js'
import { fetchRelated } from './helpers/youtube.js'
import { sendBackground, listenBackground } from './helpers/chrome.js'

smoothscroll()

/*
TODO:
- Enable previous track, by storing last n items in storage and a current track pointer
- Enable next and previous videos
- Fix bug where background is trying to navigate to /undefined
- Better error logging when adaptiveFormats not available
- Fix player focus
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
      a.setFetching(true)
      fetchRelated(s.track.id)
        .then(data => data.items[parseInt(Math.random() * data.items.length)].id.videoId)
        .then(id => a.getVideo(id))
        .catch(console.error)
    },
    getVideo: (s,a,id) => {
      a.setError(false)
      a.setFetching(true)
      a.setPlaying(!iOS())
      sendBackground({ videoId: id }).then(track => {
        console.log(track)
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
    init: (s,a) => {
      console.log(s)
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
  mixins: [Player, Search],
})
