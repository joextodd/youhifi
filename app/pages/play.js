import h from '../../lib/hyperapp/h.js'

import Search from '../components/search.js'
import Player from '../components/player.js'
import Popup from '../components/popup.js'

export default (s,a) =>
  h('combined-page', {}, [
    s.track.id && Player(s,a),
    Search(s,a),
  ])
