import { h } from 'hyperapp'
export const spinner = (s,a) =>
  h('div', { class: 'spinner' },
    [1,2,3,4,5].map(x => h('div', { class: `rect${x}` }))
  )
