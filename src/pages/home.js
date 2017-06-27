import { h } from 'hyperapp'
import { link, img, input, ul } from 'huy'

const ytThumb = id =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`

export default (s,a) =>
  h('search-page', {}, [
    input({
      placeholder: 'Search YouTube audio tracks..',
      action: a.search,
      debounce: 500,
    }),
    ul({
      class: 'search-results',
      infinite: a.searchNext,
    },
    s.search.map(item =>
      link(a)({ href: `/play/${item.id.videoId}` },[
        h('div', {
          style: { overflow: 'hidden' }
        },
        img({
          src: ytThumb(item.id.videoId),
          style: {
            filter: 'blur(1rem)',
            transform: 'scale(1.5)',
          },
        })),
        h('title-', {}, item.snippet.title),
      ])
    ))
  ])
