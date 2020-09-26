import h from '../../lib/hyperapp/h.js'
import { $icon, $ytThumb, $spinner } from '../helpers/element.js'

const $title = c => h('title-', {}, c)
const $form = (p,c) => h('form', p, c)

const $searchItem = (s,a) => item =>
  h('a', {
    href: `/${item.id.videoId || item.id}`,
    onclick: e => {
      e.preventDefault()
      a.getVideo(item.id.videoId || item.id)
      window.scrollTo(0,0)
    }
  },[
    $ytThumb(item.id.videoId || item.id),
    $title(item.title || item.snippet.title),
  ])

export default (s,a) =>
  h('search-', {
    oncreate: e => {
      // addEventListener('scroll', event => {
      //   var {
      //     scrollHeight,
      //     scrollTop,
      //     clientHeight,
      //   } = event.target.documentElement
      //   scrollTop = scrollTop == 0 ? document.body.scrollTop : scrollTop
      //   if (scrollHeight - scrollTop === clientHeight) {
      //     // Reached end of scroll
      //   }
      // })
    }
  }, [
    $form({
      action: '#',
      onsubmit: e => {
        e.preventDefault()
        document.activeElement.blur()
        a.setSearchToken()
        a.fetchResults()
      }
    }, [
      h('input', {
        oninput: e => a.setSearchString(e.target.value),
        placeholder: 'Search songs or artists..',
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        spellcheck: 'false',
      }),
      $icon('#search'),
    ]),
    h('ul', { class: '.search- search-results' },
      s.searchResults.map($searchItem(s,a))
    ),
    ((s.isFetching || s.historyFetching) && $spinner())
  ])
