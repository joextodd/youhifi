import { h } from 'hyperapp'
import { link, input, ul } from 'huy'
import { $icon, $ytThumb, $spinner } from '../helpers/element'

const $title = c => h('title-', {}, c)
const $form = (p,c) => h('form', p, c)

const $searchItem = (s,a) => item =>
  h('a', {
    href: `/${item.id.videoId}`,
    onclick: e => e.preventDefault()
      || a.savePartyState(item.id.videoId)
      || (!s.partyId && a.router.go(`/${item.id.videoId}`))
      || window.scrollTo(0,0)
  },[
    $ytThumb(item.id.videoId),
    $title(item.snippet.title),
  ])

export default (s,a) =>
  h('search-page', {}, [
    $form({
      action: '#',
      onsubmit: e => e.preventDefault() || document.activeElement.blur()
    }, [
      input({
        placeholder: 'Search songs or artists..',
        action: a.search,
        debounce: 300,
      }),
      $icon('#search'),
    ]),
    ul({ class: 'search-results', infinite: a.searchNext, },
      s.search.map($searchItem(s,a))
    ),
    $spinner()
  ])
