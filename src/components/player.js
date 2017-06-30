import { h } from 'hyperapp'
import { spinner } from '../components/spinner'
import { svg, img, button } from 'huy'

const url = 'https://youtube.joextodd.com'

const ytThumb = id =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`

export default (s,a) =>
  h('play-page', {
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
    s.player && h('controls-', {},[
      button({ onclick: a.prevVideo }, svg({ href: '#previous' })),
      button({ onclick: a.rewind, disabled: !!s.error }, svg({ href: '#rewind' })),
      button({ onclick: a.playPause, disabled: !!s.error },
        svg({
          style: { width: '5rem', height: '5rem' },
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
      src: s.track.url && `${url}/proxy/${s.track.url}`,
      crossorigin: 'anonymous',
      autoplay: !s.iOS ? 'yes' : '',
      onerror: _ => a.setError(true),
      oncanplay: _ => a.setError(false),
      oncreate: e => {
        e.onended = a.nextVideo
        e.ontimeupdate = () => s.iOS &&
          (s.player.currentTime > s.player.duration / 2)
          ? a.nextVideo()
          : null
        s.player = e
      },
    }),
  ])
