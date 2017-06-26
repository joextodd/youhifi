import { h } from 'hyperapp'
import { link, img, input } from 'huy'

export default (s,a) =>
  h('page', {}, [
    h('header', {}, input({
      placeholder: 'Search Youtube',
      action: a.search,
      debounce: 300,
    })),
    h('search-', {
      oncreate: e => {
        window.onscroll = () => {
          document.body.scrollTop > 0 &&
            (window.innerHeight + window.scrollY) >= document.body.scrollHeight &&
              a.searchNext()
        }
      }
    }, s.search.map(item =>
      link(a)({ href: `/play/${item.id.videoId}` },[
        img({ src: `https://img.youtube.com/vi/${item.id.videoId}/hqdefault.jpg` }),
        h('title-', {}, item.snippet.title),
      ])
    ))
  ])
