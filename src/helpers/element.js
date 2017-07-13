import { h } from 'hyperapp'

const $svg = (p,c) => h("svg", p, c)

const $use = href =>
  h("use", {
    href,
    onupdate: e =>
      e.setAttributeNS("http://www.w3.org/1999/xlink", "href", href)
  })

const $img = p => h('img', p)

export const $ytThumb = id =>
    $img({ src: `https://img.youtube.com/vi/${id}/hqdefault.jpg` })

export const $icon = href => $svg({}, $use(href))

export const $spinner = () =>
  h('div', { class: 'spinner' },
    [1,2,3,4,5].map(x => h('div', { class: `rect${x}` }))
  )
