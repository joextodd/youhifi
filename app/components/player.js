import h from '../../lib/hyperapp/h.js'
import { $icon, $ytThumb, $spinner } from '../helpers/element.js'
import { secondsToHHMMSS } from '../helpers/youtube.js'
import { iOS, scrollToSearch, focusOnScrollTop, fix100vh } from '../helpers/window.js'

const $title = c => h('title-', {}, c)
const $loading = c => h('loading-', {}, c)
const $audio = p => h('audio', p)
const $button = (p,c) => h('button', p, c)

const $progress = (time, total) => {
  const cur = secondsToHHMMSS(time)
  const dur = secondsToHHMMSS(total)
  return h('time-', {}, `${cur} | ${dur}`)
}

export default (s,a) =>
  h('player-', Object.assign(fix100vh, focusOnScrollTop, { class: '.player- focus' }), [
    $ytThumb(s.track.id),
    $title(s.isFetching ? $spinner() : s.track.title),
    !s.isFetching && (
      s.error ? 
        $loading('ERROR') : 
          s.currentTime === 0 ? 
            $loading('LOADING') :
            $progress(s.currentTime, s.duration)),
    h('controls-', {},[
      $button({ onclick: a.prevVideo, disabled: !!s.isFetching }, $icon('#previous')),
      $button({ onclick: e => a.seekBy(-10), disabled: !!s.error }, $icon('#rewind')),
      $button({ onclick: a.playPause, disabled: !!s.error,
        class: s.error ? 
          'player- controls- button.error' : 
            s.playing ? 
              '.player- controls- button.pause' : 
                'player- controls- button.play',
      }, [s.error ? $icon('#error') : s.playing ? $icon('#pause') : $icon('#play')]),
      $button({ onclick: e => a.seekBy(10), disabled: !!s.error }, $icon('#forwards')),
      $button({ onclick: a.nextVideo, disabled: !!s.isFetching }, $icon('#next')),
    ]),
    $button({ class: 'player- button.search', onclick: scrollToSearch }, 'Search For Stream'),
  ])
