export const YouTube = () => ({
  state: {
    url: 'https://www.googleapis.com/youtube/v3',
    key: 'AIzaSyBKrJKFGTSo3YVPyavzo6ngIll3DYIuadQ',
    results: 10,
    searchString: '',
    searchToken: '',
    search: [],
    next: [],
  },
  actions: {
    setSearchString: (s,a,d) => ({ searchString: d }),
    setSearchToken: (s,a,d) => ({ searchToken: d.nextPageToken }),
    setSearchNext: (s,a,d) => ({ search: s.search.concat(d.items) }),
    setSearch: (s,a,d) => ({ search: d.items }),
    setNext: (s,a,d) => ({ next: d.items }),
    next: (s,a,d) => {
      fetch(`${s.url}/search` +
            '?part=snippet' +
            `&maxResults=${s.results}` +
            `&relatedToVideoId=${d}` +
            '&type=video' +
            `&key=${s.key}`)
      .then(r => r.json())
      .then(a.setNext)
      .catch(console.log)
    },
    search: (s,a,d) => {
      fetch(`${s.url}/search` +
            '?part=snippet' +
            `&maxResults=${s.results}` +
            `&q=${d.target.value}` +
            '&type=video' +
            `&key=${s.key}`)
      .then(r => r.json())
      .then(d => {
        a.setSearch(d)
        a.setSearchToken(d)
      })
      .catch(console.log)
    },
    searchNext: (s,a,d) => {
      fetch(`${s.url}/search` +
            '?part=snippet' +
            `&maxResults=${s.results}` +
            `&q=${s.searchString}` +
            '&type=video' +
            `&pageToken=${s.searchToken}` +
            `&key=${s.key}`)
      .then(r => r.json())
      .then(d => {
        a.setSearchNext(d)
        a.setSearchToken(d)
      })
      .catch(console.log)
    },
  },
})
