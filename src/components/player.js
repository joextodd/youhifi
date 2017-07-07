import { h } from 'hyperapp'
import throttle from 'throttle-debounce/throttle'
import { spinner } from '../components/spinner'
import { svg, img, button } from 'huy'

const url = 'https://youtube.joextodd.com'

const ytThumb = id =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`

const secondsToHHMMSS = seconds => {
  const h = parseInt(seconds / 3600, 10) % 24
  const m = parseInt(seconds / 60, 10) % 60
  const s = Math.floor(seconds % 60)
  return h > 0 ?
    `${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}` :
    `${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`
}

export default (s,a) =>
  h('play-page', {
    style: {
      paddingBottom: s.iOS && !navigator.userAgent.match('CriOS') && '100px',
    },
    oncreate: e => {
      e._fn = ev => window.scrollY === 0
        ? e.classList.add('focus')
        : e.classList.remove('focus')
      e._fn()
      window.addEventListener('scroll', e._fn)
    },
    onremove: e =>
      window.removeEventListener('scroll', e._fn)
  }, [
    img({ src: s.id && ytThumb(s.id) }),
    h('title-', {}, s.isFetching ? spinner() : s.track.title),
    s.player && s.player.duration && !s.isFetching
      ? h('time-', {}, `${secondsToHHMMSS(s.player.currentTime)} | ${ s.iOS ? secondsToHHMMSS(s.player.duration/2) : secondsToHHMMSS(s.player.duration) }`)
      : (!s.isFetching && !s.error)
      ? s.iOS && s.player.paused
        ? h('loading-', {}, 'PRESS PLAY')
        : h('loading-', {}, 'LOADING')
      : s.error ?
      h('loading-', {}, 'ERROR')
      : '',
    s.player && h('controls-', {},[
      button({ onclick: a.prevVideo }, svg({ href: '#previous' })),
      button({ onclick: a.rewind, disabled: !!s.error }, svg({ href: '#rewind' })),
      button({ onclick: a.playPause, disabled: !!s.error },
        svg({
          style: {
            width: '5rem', height: '5rem',
            transform: s.error ? `scale(0.75)` : '',
          },
          href: s.error ? '#error' : s.playing ? '#pause' : '#play',
        })
      ),
      button({ onclick: a.forwards, disabled: !!s.error }, svg({ href: '#forwards' })),
      button({ onclick: a.nextVideo }, svg({ href: '#next' })),
    ]),
    button({
      class: 'search',
      onclick: e => window.scroll({
        top: window.innerHeight * .8,
        left: 0,
        behavior: 'smooth',
      }),
    }, 'Search For Stream'),
    h('audio', {
      src: s.track.url && (s.webm ?
        `${url}/proxy/${s.track.webm}` :
        s.track.url && `${url}/proxy/${s.track.url}`),
      title: s.track.title,
      crossorigin: 'anonymous',
      autoplay: !s.iOS ? 'yes' : '',
      onerror: _ => a.setError(true),
      oncanplay: _ => a.setError(false),
      oncreate: e => {
        e.onended = a.nextVideo
        e.ontimeupdate = throttle(1000, e => {
          a.setCurrentTime(s.player.currentTime)
          s.iOS && (s.player.currentTime > s.player.duration / 2)
          ? a.nextVideo()
          : null
        })
        s.player = e
      },
    }),
  ])
