import { h } from 'hyperapp'
import { spinner } from '../components/spinner'
import { svg, img, button } from 'huy'

const url = 'https://youtube.joextodd.com'

const ytThumb = id =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`

export default (s,a) =>
  h('play-page', {}, [
    img({
      src: s.id && ytThumb(s.id),
      style: {
        filter: `blur(1rem) brightness(${s.scroll.atStartY ? '0.8' : '0.4'})`,
        transition: '.6s filter ease-out, .6s -webkit-filter ease-out'
      }
    }),
    h('title-', {
        style: {
          opacity: s.scroll.atStartY ? '1' : '0.1',
          transition: 'opacity .5s'
        }
      }, s.isFetching ? spinner() : s.track.title),
      s.player && h('controls-', {
        style: {
          opacity: s.scroll.atStartY ? '1' : '0.1',
          transition: 'opacity .5s'
        }
      },[
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
        top: window.innerHeight * .75,
        left: 0,
        behavior: 'smooth',
      }),
      style: {
        opacity: s.scroll.atStartY ? '1' : '0.1',
        transition: 'opacity .5s'
      }
    }, 'Search For Music'),
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
