import h from '../../lib/hyperapp/h.js'

const $svg = (p,c) => h("svg", p, c)

const $use = href =>
  h("use", {
    href,
    oncreate: e =>
      e.setAttributeNS("http://www.w3.org/1999/xlink", "href", href)
  })

const $img = p => h('img', p)

export const $ytThumb = id =>
    $img({ src: `https://img.youtube.com/vi/${id}/mqdefault.jpg` })

export const $icon = href => $svg({}, $use(href))

export const $spinner = () =>
  h('div', { class: 'spinner' },
    [1,2,3,4,5].map(x => h('div', { class: `rect${x}` }))
  )
