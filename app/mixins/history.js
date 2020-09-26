import { listenStorage, getStorageData, setStorageData } from '../helpers/chrome.js'
import { scrapeRelated } from '../helpers/youtube.js'

export const History = () => ({
  state: {
    historyFetching: true,
    historyResults: []
  },
  events: {
    loaded: (s,a) => {
      getStorageData(['currentTrack', 'totalTracks'])
      // .then(() => chrome.storage.sync.clear())
      .catch(() => {
        console.log('Initialising history in storage')
        setStorageData({ 'currentTrack': -1 })
        setStorageData({ 'totalTracks': 0 })
      })
    }
  },
  actions: {
    setHistoryFetching: (s,a,d) => ({ historyFetching: d }),
    setHistoryResults: (s,a,d) => ({ historyResults: d }),
    storeTrack: (s,a,d) => {
      getStorageData(['currentTrack', 'totalTracks'])
      .then(history => {
        console.log(`current: ${history.currentTrack}, total: ${history.totalTracks}`)
        if (history.currentTrack + 1 === history.totalTracks) {  // end of queue
          let trackKey = `track${history.currentTrack + 1}`
          setStorageData({ [trackKey]: JSON.stringify(d) })
          setStorageData({ currentTrack: history.currentTrack + 1})
          setStorageData({ totalTracks: history.totalTracks + 1 })
          console.log(`${trackKey}: ${d.id}`)
        }
      })
    },
    getPrevTrack: (s,a,d) => {
      console.log('fetching prev video')
      getStorageData(['currentTrack', 'totalTracks']).then(r => {
        console.log(`current: ${r.currentTrack}, total: ${r.totalTracks}`)
        if (r.currentTrack > 0) {
          let trackKey = `track${r.currentTrack - 1}`
          getStorageData(trackKey)
          .then(t => {
            setStorageData({ currentTrack: r.currentTrack - 1 })
            a.getVideo(t[trackKey])
          })
        } else {
          window.alert('No more previous tracks')
        }
      })
    },
    getNextTrack: (s,a,d) => {
      getStorageData(['currentTrack', 'totalTracks']).then(r => {
        console.log(`current: ${r.currentTrack}, total: ${r.totalTracks}`)
        if (r.currentTrack + 1 === r.totalTracks) {  // end of queue
          a.setFetching(true)
          scrapeRelated(s.track.id)
            .then(data => data.items[parseInt(Math.random() * data.items.length)].id)
            .then(id => a.getVideo(id))
            .catch(console.error)
        } else {
          let trackKey = `track${r.currentTrack + 1}`
          getStorageData(trackKey).then(t => {
            setStorageData({ currentTrack: r.currentTrack + 1 })
            a.getVideo(t[trackKey])
          })
        }
      })
    },
    getHistory: (s,a,d) => {
      getStorageData(null).then(r => {
        let items = []
        for (let i = r.currentTrack; i >= 0; i--) {
          let trackKey = `track${i}`
          items.push(JSON.parse(r[trackKey]))
        }
        console.log(items)
        a.setHistoryResults(items)
        a.setHistoryFetching(false)
        items.length ? 
          a.setSearchResults(items) :
            a.fetchResults()
      })
    }
  },
})