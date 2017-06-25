import { h } from 'hyperapp'
export const svg = href =>
  h('svg', {}, [
    h('use', { oncreate: e =>
    e.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'href',
      href
    )})
  ])
