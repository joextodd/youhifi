import { h } from 'hyperapp'
import { link, img, input, ul } from 'huy'

const ytThumb = id =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`

export default (s,a) =>
  h('page', {}, [
    h('header', {}, input({
      placeholder: 'Search Youtube',
      action: a.search,
      debounce: 500,
    })),
    ul({
      class: 'search-results',
      infinite: a.searchNext,
    },
    s.search.map(item =>
      link(a)({ href: `/play/${item.id.videoId}` },[
        img({ src: ytThumb(item.id.videoId) }),
        h('title-', {}, item.snippet.title),
      ])
    ))
  ])
