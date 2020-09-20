import { listenStorage, getStorageData, setStorageData } from '../helpers/chrome.js'
import { fetchRelated } from '../helpers/youtube.js'

export const History = () => ({
  state: {},
  events: {
    loaded: (s,a) => {
      console.log('history mixin loaded')
      getStorageData(['currentTrack', 'totalTracks'])
      .catch(() => {
        console.log('initialising history in storage')
        setStorageData({
          'currentTrack': -1,
          'totalTracks': 0,
        })
      })
    }
  },
  actions: {
    storeTrack: (s,a,d) => {
      getStorageData(['currentTrack', 'totalTracks'])
      .then(history => {
        if (history.currentTrack + 1 === history.totalTracks) {  // end of queue
          let update = { currentTrack: s.currentTrack + 1, totalTracks: s.totalTracks + 1 }
          update[`track${update.currentTrack}`] = track.id
          console.log('storing...')
          console.log(update)
          setStorageData(update)
          .catch(err => window.alert)
        }
      })
    },
    getPrevTrack: (s,a,d) => {
      console.log('fetching prev video')
      getStorageData('currentTrack').then(currentTrack => {
        console.log(currentTrack)
        getStorageData(`track${currentTrack - 1}`)
        .then(trackId => {
          console.log(trackId)
          setStorageData({ currentTrack: currentTrack - 1 })
          a.getVideo(trackId)
        })
        .catch(() => window.alert('No previous track'))
      })
    },
    getNextTrack: (s,a,d) => {
      console.log('fetching next video')
      getStorageData('currentTrack').then(currentTrack => {
        console.log(currentTrack)
        getStorageData(`track${currentTrack + 1}`)
        .then(trackId => {
          console.log(trackId)
          setStorageData({ currentTrack: currentTrack + 1 })
          a.getVideo(trackId)
        })
        .catch(() => {
          a.setFetching(true)
          fetchRelated(s.track.id)
            .then(data => data.items[parseInt(Math.random() * data.items.length)].id.videoId)
            .then(id => a.getVideo(id))
            .catch(console.error)
        })
      })
    },
  },
})