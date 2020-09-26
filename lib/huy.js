// Version 1.1.0
import h from './hyperapp/h.js'

const noop = _ => _
const debounced = time => fn => debounce(fn, time)

const debounce = (func, wait, immediate) => {
  let timeout
  return function() {
    let [context, args] = [this, arguments]
    const later = function() {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

const onWindowBottom = fn => e =>
  document.body.scrollTop > 0 &&
  (window.innerHeight + window.scrollY) >= document.body.scrollHeight
  ? fn(e)
  : noop()

export const use = href =>
  h('use', {
    onupdate: e => e.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'href',
      href
    ),
  })

export const link = a => (p={},c=[]) =>
  h('a', Object.assign(p, {
    onclick: e => p.href[0] === '/' &&
      e.preventDefault() || a.router.go(p.href),
  }), c)

export const svg = (p={}) =>
  h('svg', Object.assign({}, p, { href: '' }), use(p.href))

export const img = (p={}) =>
  h('img', p)

export const button = (p={},c=[]) =>
  h('button', p, c)

export const input = (p={}) =>
  h('input', Object.assign(p, {
    oninput: debounced(p.debounce || 0)(p.action || noop)
  }))

export const ul = (p={},c=[]) =>
  h('ul', Object.assign(p, p.infinite ? {
    oncreate: e => {
      e._infinite = onWindowBottom(p.infinite || noop)
      window.addEventListener('scroll', e._infinite)
    },
    onremove: (e,done) => {
      window.removeEventListener('scroll', e._infinite)
      done()
    },
  } : {}), c)
