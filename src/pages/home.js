import { h } from 'hyperapp'
export default (s,a) =>
  h('section', {}, [
    h('form', {}, [
      h('input', {
        type: 'text',
        placeholder: 'Enter YouTube URL...',
        oninput: e => a.decodeURL(e.target.value),
      }),
    ])
  ])
