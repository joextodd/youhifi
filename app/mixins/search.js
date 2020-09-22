import { fetchSearchResults, fetchPopularResults } from '../helpers/youtube.js'

export const Search = () => ({
  state: {
    searchString: '',
    searchToken: '',
    searchResults: [],
  },
  events: {
    loaded: (s,a) => a.search()
  },
  actions: {
    setSearchString: (s,a,d) => ({ searchString: d || '' }),
    setSearchToken: (s,a,d) => ({ searchToken: d || '' }),
    setSearchResults: (s,a,d) => ({ searchResults: d }),
    search: (s,a,d) => {
      a.setSearchString(d)
      a.setSearchToken()
      a.fetchResults()
    },
    fetchResults: (s,a,d) => {
      const fn = s.searchString ? fetchSearchResults : fetchPopularResults
      fn(s.searchString, s.searchToken)
      .then(({ items, nextPageToken }) => {
        a.setSearchResults(s.searchToken
          ? s.searchResults.concat(items)
          : items
        )
        a.setSearchToken(nextPageToken)
      }).catch(console.log)
    },
  },
})
