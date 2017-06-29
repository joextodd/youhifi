import { h } from 'hyperapp'

import Search from '../components/search'
import Player from '../components/player'

export default (s,a) =>
  h('combined-page', {}, [
    Player(s,a),
    Search(s,a),
  ])
