import { h } from 'hyperapp'

import Search from './home'
import Player from './play'

export default (s,a) =>
  h('combined-page', {}, [
    Player(s,a),
    Search(s,a),
  ])
