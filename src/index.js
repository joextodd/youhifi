import { h, app, Router } from 'hyperapp'
import { Player } from './player'
import './index.scss'
import './spinner.scss'

const url = 'https://youtube.joextodd.com'
const Use = href =>
  h('svg', {}, [
    h('use', { oncreate: e =>
    e.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'href',
      href
    )})
  ])

const homePage = (s,a) =>
  h('section', {}, [
    h('form', {}, [
      h('input', {
        type: 'text',
        placeholder: 'Enter YouTube URL...',
        oninput: e => a.decodeURL(e.target.value),
      }, ''),
    ])
  ])

const Spinner = (s,a) =>
  h('div', { class: 'spinner' },
    [1,2,3,4,5].map(x => h('div', { class: `rect${x}` }))
  )

const lostPage = (s,a) =>
  h('h1', { onclick: e => a.router.go('/') }, 'Back to {location.hostname}')

const playPage = (s,a) =>
  h('page', {}, [
    h('main', {}, [
      h('title-', {}, s.isFetching ? Spinner() : s.track.title),
      h('img', { src: s.id && `https://img.youtube.com/vi/${s.id}/hqdefault.jpg` }),
      h('audio', {
        src: s.track && s.track.url && `${url}/proxy/${s.track.url}`,
        crossorigin: 'anonymous', autoplay: 'yes',
        oncreate: e => {
          e.onended = a.nextVideo
          e.ontimeupdate = s.iOS && a.iosDuration() && a.nextVideo()
          s.player = e
        }
      }),
      s.player && h('controls-', {}, [
        h('button', {}, Use('#previous')),
        h('button', { onclick: e => a.rewind() }, Use('#rewind')),
        h('button', {
          class: s.playing ? 'pause' : 'play',
          onclick: e => a.playPause()
        },[
          Use('#play'),
          Use('#pause'),
        ]),
        h('button', { onclick: e => a.forwards() }, Use('#forwards')),
        h('button', { onclick: e => a.nextVideo() }, Use('#next')),
      ]),
    ]),
  ])

app({
  state: {
    id: '',
    isFetching: true,
    track: {},
    tracks: [],
    iOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
  },
  actions: {
    setId: (s,a,d) => ({ id: d }),
    toggleFetching: (s,a,d) => ({ isFetching: d }),
    nextVideo: (s,a,d) =>
      fetch(`${url}/video/${s.id}/next`)
      .then(r => r.json())
      .then(d => a.router.go(`/play/${d.id}`))
      .catch(console.log),
    getVideo: (s,a,d) => {
      a.toggleFetching(true)
      fetch(`${url}/video/${s.id}`)
      .then(r => r.json())
      .then(d => {
        a.setTrack(d)
        a.addTrack(d)
        a.toggleFetching(false)
      })
      .catch(console.log)
    },
    setTrack: (s,a,d) => ({ id: d.id || s.id, track: d }),
    addTrack: (s,a,d) => ({ tracks: s.tracks.concat(d) }),
    decodeURL: (s,a,d) => {
      const re = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
      const match = d.match(re);
      if (match.length > 1) a.router.go(`/play/${match[1]}`)
    }
  },
  events: {
    action: console.log,
    route: (s,a,d) => {
      if (d.match === '/play/:id') {
        a.setId(d.params.id)
        a.getVideo()
      }
    }
  },
  view: [
    ['/', homePage],
    ['/play/:id', playPage],
    ['*', lostPage],
  ],
  mixins: [Router, Player],
})
