import { h } from 'hyperapp'

export default (s,a) =>
  h('h1', { onclick: e => a.router.go('/') },
    `Back to ${location.hostname}`
  )
