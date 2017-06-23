import { h, app, Router } from 'hyperapp'
import { Player } from './player'
import './index.scss'

const url = 'https://youtube.joextodd.com'

const homePage = (s,a) =>
  h('section', {}, '', [
    h('form', {}, '', [
      h('input', {
        type: 'text',
        placeholder: 'Enter YouTube URL...',
        oninput: e => a.decodeURL(e.target.value),
      }, ''),
    ])
  ])

const lostPage = (s,a) =>
  h('h1', { onclick: e => a.router.go('/') }, 'Back to {location.hostname}')

const controls = (id) =>
  h('svg', { class: 'icon' }, '', [
    h('use', { 'xlink:href': id })
  ])

const playPage = (s, a) =>
  h('page', {}, '', [
    h('main', {}, '', [
      h('img', { src: `https://img.youtube.com/vi/${s.id}/hqdefault.jpg` }),
      h('controls-', {}, '', [
        h('button', {}, '', [ controls('#previous') ]),
        h('button', { onclick: e => a.backwards() }, 'Back'),
        h('button', { onclick: e => a.playPause() }, 'Play'),
        h('button', { onclick: e => a.forwards() }, 'Forw'),
        h('button', { onclick: e => a.nextVideo() }, 'Next'),
      ]),
      h('title-', {}, s.track ? s.track.title : ''),
      h('audio', {
        src: s.track ? `${url}/proxy/${s.track.url}` : '',
        crossorigin: 'anonymous', //autoplay: 'yes',
        oncreate: e => {
          e.onended = a.nextVideo
          e.ontimeupdate = s.iOS && a.iosDuration() && a.nextVideo()
        }
      }, '')
    ])
  ])

app({
  state: {
    id: '',
    track: {},
    iOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
  },
  events: {
    update: console.log
  },
  actions: {
    nextVideo: (s,a,d) =>
      fetch(`${url}/video/${s.id}/next`)
      .then(r => r.json()).then(a.setTrack).then(a.getVideo)
      .catch(console.log),
    getVideo: (s,a,d) =>
      fetch(`${url}/video/${s.id}`)
      .then(r => r.json()).then(a.setTrack)
      .catch(console.log),
    setTrack: (s,a,d) => ({ id: d.id || s.id, track: d }),
    decodeURL: (s,a,d) => {
      const re = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
      const match = d.match(re);
      if (match.length > 1) a.router.go(`/play/${match[1]}`)
    }
  },
  events: {
    route: (s,a,d) => {
      if (d.match === '/play/:id') {
        s.id = d.params.id
        a.getVideo()
      }
      return s
    }
  },
  view: [
    ['/', homePage],
    ['/play/:id', playPage],
    ['*', lostPage],
  ],
  mixins: [Router, Player],
})
