import { h } from 'hyperapp'
import throttle from 'throttle-debounce/throttle'
import { $icon, $ytThumb, $spinner } from '../helpers/element'
import { secondsToHHMMSS } from '../helpers/youtube'
import { iOS, iOS_chrome, scrollToSearch, focusOnScrollTop, fix100vh } from '../helpers/window'

const url = 'https://youtube.joextodd.com'

const $title = c => h('title-', {}, c)
const $loading = c => h('loading-', {}, c)
const $audio = p => h('audio', p)
const $button = (p,c) => h('button', p, c)

const $progress = player => {
  const cur = secondsToHHMMSS(player.currentTime)
  const dur = secondsToHHMMSS(iOS() ? player.duration/2 : player.duration)
  return h('time-', {}, `${cur} | ${dur}`)
}

export default (s,a) =>
  h('player-', Object.assign(fix100vh, focusOnScrollTop), [
    $ytThumb(s.id),
    $title(s.isFetching ? $spinner() : s.track.title),
    s.player && s.player.duration && !s.isFetching
      ? $progress(s.player)
      : (!s.isFetching && !s.error)
        ? iOS() && s.player.paused
          ? $loading('PRESS PLAY')
          : $loading('LOADING')
        : s.error
          ? $loading('ERROR')
          : '',
    s.player && h('controls-', {},[
      $button({ onclick: a.prevVideo }, $icon('#previous')),
      $button({ onclick: e => a.seekBy(-10), disabled: !!s.error }, $icon('#rewind')),
      $button({ onclick: a.playPause, disabled: !!s.error },
        $icon(s.error ? '#error' : s.playing ? '#pause' : '#play')
      ),
      $button({ onclick: e => a.seekBy(10), disabled: !!s.error }, $icon('#forwards')),
      $button({ onclick: a.nextVideo }, $icon('#next')),
    ]),
    $button({ class: 'search', onclick: scrollToSearch }, 'Search For Stream'),
    $audio({
      src: s.track.url && `${url}/proxy/${s.webm ? s.track.webm : s.track.url}`,
      title: s.track.title,
      crossorigin: 'anonymous',
      autoplay: !iOS() && 'yes',
      onerror: _ => a.setError(true),
      oncanplay: _ => a.setError(false),
      onended: _ => a.nextVideo(),
      oncreate: e => s.player = e,
      ontimeupdate: throttle(1000, e => {
        a.setCurrentTime(s.player.currentTime)
        iOS() && (s.player.currentTime > s.player.duration / 2)
          ? a.nextVideo()
          : null
      }),
    }),
  ])
