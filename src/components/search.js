import { h } from 'hyperapp'
import { spinner } from '../components/spinner'
import { link, img, input, ul, svg } from 'huy'

const ytThumb = id =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`

export default (s,a) =>
  h('search-page', {}, [
    h('form', {
      action: '#',
      onsubmit: e => e.preventDefault() || document.activeElement.blur()
    }, [
      input({
        placeholder: 'Search songs or artists..',
        action: a.search,
        debounce: 500,
      }),
      svg({ href: '#search' }),
    ]),
    ul({
      class: 'search-results',
      infinite: a.searchNext,
    },
    s.search.map(item =>
      h('a', {
        onclick: e =>
          e.preventDefault()
          || a.router.go(`/${item.id.videoId}`)
          || window.scrollTo(0,0)
      },[
        h('div', {
          style: { overflow: 'hidden' }
        },
        img({
          src: ytThumb(item.id.videoId),
          style: {
            // filter: 'blur(1rem)',
            // transform: 'scale(1.5)',
          },
        })),
        h('title-', {}, item.snippet.title),
      ])
    )),
    spinner()
  ])
