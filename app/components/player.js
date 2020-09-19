import h from '../../lib/hyperapp/h.js'
import throttle from '../../lib/throttle.js'
import { $icon, $ytThumb, $spinner } from '../helpers/element.js'
import { secondsToHHMMSS } from '../helpers/youtube.js'
import { iOS, scrollToSearch, focusOnScrollTop, fix100vh } from '../helpers/window.js'

const $title = c => h('title-', {}, c)
const $loading = c => h('loading-', {}, c)
const $audio = p => h('audio', p)
const $button = (p,c) => h('button', p, c)

const $progress = (time, total) => {
  const cur = secondsToHHMMSS(time)
  const dur = secondsToHHMMSS(iOS() ? total/2 : total)
  return h('time-', {}, `${cur} | ${dur}`)
}

export default (s,a) =>
  h('player-', Object.assign(fix100vh, focusOnScrollTop, { class: '.player- focus' }), [
    $ytThumb(s.track.id),
    $title(s.isFetching ? $spinner() : s.track.title),
    !s.isFetching && (s.error
      ? $loading('ERROR')
      : s.player.currentTime === 0
        ? iOS() && s.player.paused ? $loading('PRESS PLAY') : $loading('LOADING')
        : $progress(s.player.currentTime, s.player.duration)),
    h('controls-', {},[
      $button({ onclick: a.prevVideo, disabled: !!s.isFetching }, $icon('#previous')),
      $button({ onclick: e => a.seekBy(-10), disabled: !!s.error }, $icon('#rewind')),
      $button({ onclick: a.playPause, disabled: !!s.error,
        class: s.error ? 
          'player- controls- button.error' : 
            s.playing ? 
              '.player- controls- button.pause' : 
                'player- controls- button.play',
      }, [$icon('#error'), $icon('#pause'), $icon('#play')]),
      $button({ onclick: e => a.seekBy(10), disabled: !!s.error }, $icon('#forwards')),
      $button({ onclick: a.nextVideo, disabled: !!s.isFetching }, $icon('#next')),
    ]),
    $button({ class: 'player- button.search', onclick: scrollToSearch }, 'Search For Stream'),
    // $audio({
    //   src: s.track.url ? s.track.url : '',
    //   title: s.track.title,
    //   autoplay: !iOS() && 'yes',
    //   onerror: _ => a.setError(true),
    //   oncanplay: _ => a.setError(false),
    //   onended: _ => a.nextVideo(),
    //   oncreate: e => {
    //     s.player = e
    //     s.webm = !!e.canPlayType('audio/webm')
    //   },
    //   ontimeupdate: throttle(1000, e => {
    //     a.setCurrentTime(s.player.currentTime)
    //     iOS() && (s.player.currentTime > s.player.duration / 2) && a.nextVideo()
    //   }),
    // }),
  ])
