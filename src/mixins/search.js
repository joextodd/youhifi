const MAX_RESULTS = 10
const YT_API_KEY = "AIzaSyBKrJKFGTSo3YVPyavzo6ngIll3DYIuadQ"

const YT_API_SEARCH = 'https://www.googleapis.com/youtube/v3/search?part=snippet'
  + `&maxResults=${MAX_RESULTS}&key=${YT_API_KEY}&type=video&videoCategoryId=10`

const fetchRelated = id =>
  fetch(`${YT_API_SEARCH}&relatedToVideoId=${id}`)
  .then(r => r.json())

const fetchSearch = query =>
  fetch(`${YT_API_SEARCH}&q=${query}`)
  .then(r => r.json())

const fetchSearchNext = (query, token) =>
  fetch(`${YT_API_SEARCH}&q=${query}&pageToken=${token}`)
  .then(r => r.json())

export const Search = () => ({
  state: {
    searchString: '',
    searchToken: '',
    search: [],
  },
  events: {
    loaded: (s,a) => a.search('')
  },
  actions: {
    setSearchString: (s,a,d) => ({ searchString: d }),
    setSearchToken: (s,a,d) => ({ searchToken: d }),
    setSearchNext: (s,a,d) => ({ search: s.search.concat(d) }),
    setSearch: (s,a,d) => ({ search: d }),
    nextVideo: (s,a,d) => {
      a.pause()
      if (!s.partyId || (s.partyId && s.partyQ.length <= 1)) {
        const idx = parseInt(Math.random() * (MAX_RESULTS - 1))
        fetchRelated(s.id).then(d => {
          s.partyId
            ? a.savePartyState(d.items[idx].id.videoId)
            : a.router.go(`/${d.items[idx].id.videoId}`)
        })
        .catch(console.log)
      }
      s.partyId && a.nextQTrack()
    },
    search: (s,a,d) => {
      const query = d.target ? d.target.value : d
      a.setSearchString(query)
      fetchSearch(query)
      .then(results => {
        a.setSearch(results.items)
        a.setSearchToken(results.nextPageToken)
      }).catch(console.log)
    },
    searchNext: (s,a,d) => {
      fetchSearchNext(s.searchString, s.searchToken)
      .then(results => {
        a.setSearchNext(results.items)
        a.setSearchToken(results.nextPageToken)
      }).catch(console.log)
    },
  },
})
