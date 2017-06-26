import { h } from 'hyperapp'
import { spinner } from '../components/spinner'
import { svg, img, button } from 'huy'

const url = 'https://youtube.joextodd.com'

const ytThumb = id =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`

export default (s,a) =>
  h('page', {}, [
    h('main', {}, [
      h('title-', {}, s.isFetching ? spinner() : s.track.title),
      img({ src: s.id && `https://img.youtube.com/vi/${s.id}/hqdefault.jpg` }),
      h('audio', {
        src: s.track && s.track.url && `${url}/proxy/${s.track.url}`,
        crossorigin: 'anonymous',
        autoplay: !s.iOS ? 'yes' : '',
        oncreate: e => {
          e.onended = a.nextVideo
          e.ontimeupdate = () => s.iOS &&
            (s.player.currentTime > s.player.duration / 2)
            ? a.nextVideo()
            : null
          s.player = e
        }
      }),
      s.player && h('controls-', {}, [
        button({ onclick: a.prevVideo }, svg({ href: '#previous' })),
        button({ onclick: a.rewind }, svg({ href: '#rewind' })),
        button({
          class: s.playing ? 'pause' : 'play',
          onclick: e => a.playPause()
        },[
          svg({ href: '#play' }),
          svg({ href: '#pause' }),
        ]),
        button({ onclick: a.forwards }, svg({ href: '#forwards' })),
        button({ onclick: a.nextVideo }, svg({ href: '#next' })),
      ]),
    ]),
  ])
