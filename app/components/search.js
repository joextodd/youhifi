import h from '../../lib/hyperapp/h.js'
import { link, input, ul } from '../../lib/huy.js'
import { $icon, $ytThumb, $spinner } from '../helpers/element.js'

import { getStorageData, setStorageData } from '../helpers/chrome.js'

const $title = c => h('title-', {}, c)
const $form = (p,c) => h('form', p, c)

const $searchItem = (s,a) => item =>
  h('a', {
    href: `/${item.id.videoId}`,
    onclick: e => {
      e.preventDefault()
      setStorageData({ id: item.id.videoId })
      .then(() => window.scrollTo(0,0))
    }
  },[
    $ytThumb(item.id.videoId),
    $title(item.snippet.title),
  ])

export default (s,a) =>
  h('search-', {
    oncreate: e => {
      addEventListener('scroll', event => {
        var {
          scrollHeight,
          scrollTop,
          clientHeight,
        } = event.target.documentElement
        scrollTop = scrollTop == 0 ? document.body.scrollTop : scrollTop
        if (scrollHeight - scrollTop === clientHeight) {
          a.fetchResults()
        }
      })
    }
  }, [
    $form({
      action: '#',
      onsubmit: e => e.preventDefault() || document.activeElement.blur()
    }, [
      input({
        placeholder: 'Search songs or artists..',
        action: e => a.search(e.target.value),
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        spellcheck: 'false',
        debounce: 300,
      }),
      $icon('#search'),
    ]),
    // ul({ class: '.search- search-results', infinite: a.fetchResults, },
    //   s.searchResults.map($searchItem(s,a))
    // ),
    (s.searchString !== '' && $spinner())
  ])
