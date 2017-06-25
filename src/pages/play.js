import { h } from 'hyperapp'
import { svg } from '../components/svg'
import { spinner } from '../components/spinner'

const url = 'https://youtube.joextodd.com'

export default (s,a) =>
  h('page', {}, [
    h('main', {}, [
      h('title-', {}, s.isFetching ? spinner() : s.track.title),
      h('img', { src: s.id && `https://img.youtube.com/vi/${s.id}/hqdefault.jpg` }),
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
        h('button', { onclick: e => a.pause() || window.history.back() }, svg('#previous')),
        h('button', { onclick: e => a.rewind() }, svg('#rewind')),
        h('button', {
          class: s.playing ? 'pause' : 'play',
          onclick: e => a.playPause()
        },[
          svg('#play'),
          svg('#pause'),
        ]),
        h('button', { onclick: e => a.forwards() }, svg('#forwards')),
        h('button', { onclick: e => a.nextVideo() }, svg('#next')),
      ]),
    ]),
  ])
