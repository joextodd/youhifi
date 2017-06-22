import { h, app, Router } from 'hyperapp'
import './index.scss'

const baseUrl = 'https://youtube.joextodd.com';

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

const lostPage = (s, a) =>
  h('h1', { onclick: e => a.router.go('/') }, 'Back to {location.hostname}')

const playPage = (s, a) =>
  h('page', {}, '', [
    h('main', {}, '', [
      h('img', { src: `https://img.youtube.com/vi/${s.id}/hqdefault.jpg` }),
      h('title-', {}, s.track.title),
      h('footer', {}, '', [
        h('audio', {
          src: s.track.url ? `${baseUrl}/proxy/${s.track.url}` : '',
          controls: 'yes', crossorigin: 'anonymous', autoplay: 'yes',
          oncreate: e => {
            e.onended = a.nextVideo
            e.ontimeupdate = s.iOS && audio.currentTime > audio.duration / 2 && a.nextVideo()
          }
        }, '')
      ])
    ])
  ])

app({
  state: {
    id: '',
    track: {},
    player: document.querySelector('audio'),
    iOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
  },
  events: {
    update: console.log
  },
  actions: {
    nextVideo: (s,a,d) =>
      fetch(`${baseUrl}/video/${s.id}/next`)
      .then(response => response.json())
      .then(a.setTrack)
      .then(a.getVideo),
    getVideo: (s,a,d) =>
      fetch(`${baseUrl}/video/${s.id}`)
      .then(response => response.json())
      .then(a.setTrack)
      .catch(console.log),
    setTrack: (s,a,d) => ({ id: d.id || s.id, track: d }),
    decodeURL: (s,a,d) => {
      const re = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
      const match = d.match(re);
      if (match.length > 1) {
        s.id = match[1];
        a.router.go(`/play/${match[1]}`)
      }
    }
  },
  events: {
    route: (s,a,d) => {
      s.id = d.params.id
      fetch(`${baseUrl}/video/${s.id}`)
      .then(response => response.json())
      .then(a.setTrack)
      .catch(console.log)
      return s
    }
  },
  view: [
    ['/', homePage],
    ['/play/:id', playPage],
    ['*', lostPage],
  ],
  mixins: [Router],
})
