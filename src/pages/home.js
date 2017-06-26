import { h } from 'hyperapp'
import { input } from '../components/input'

export default (s,a) =>
  h('page', {}, [
    h('header', {}, input(s,a)),
    h('search-', {
      oncreate: e => {
        window.onscroll = () => {
          document.body.scrollTop > 0 &&
            (window.innerHeight + window.scrollY) >= document.body.scrollHeight &&
              a.searchNext()
        }
      }
    }, s.search.map((item) =>
      h('a', { href: `/play/${item.id.videoId}` }, [
        h('img', { src: `https://img.youtube.com/vi/${item.id.videoId}/hqdefault.jpg` }),
        h('title-', {}, item.snippet.title),
      ])
    ))
  ])
