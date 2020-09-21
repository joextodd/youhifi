import { listenStorage, getStorageData, setStorageData } from '../helpers/chrome.js'
import { fetchRelated } from '../helpers/youtube.js'

export const History = () => ({
  state: {},
  events: {
    loaded: (s,a) => {
      getStorageData(['currentTrack', 'totalTracks'])
      .catch(() => {
        console.log('Initialising history in storage')
        setStorageData({ 'currentTrack': -1 })
        setStorageData({ 'totalTracks': 0 })
      })
    }
  },
  actions: {
    storeTrack: (s,a,d) => {
      getStorageData(['currentTrack', 'totalTracks'])
      .then(history => {
        console.log(`current: ${history.currentTrack}, total: ${history.totalTracks}`)
        if (history.currentTrack + 1 === history.totalTracks) {  // end of queue
          let trackKey = `track${history.currentTrack + 1}`
          setStorageData({ [trackKey]: d })
          setStorageData({ currentTrack: history.currentTrack + 1})
          setStorageData({ totalTracks: history.totalTracks + 1 })
          console.log(`${trackKey}: ${d}`)
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
          fetchRelated(s.track.id)
            .then(data => data.items[parseInt(Math.random() * data.items.length)].id.videoId)
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
  },
})