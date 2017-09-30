import { h } from 'hyperapp'

import Search from '../components/search'
import Player from '../components/player'
import Popup from '../components/popup'

export default (s,a) =>
  h('combined-page', {}, [
    s.track.id && Player(s,a),
    Search(s,a),
    s.popupVisible && Popup(a, {
      animations: 'fadeIn fadeOut',
      iconId: '#check',
      text: 'Added to Queue'
    }),
  ])
