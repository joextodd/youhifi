import { h } from 'hyperapp'
import { div, span } from '@hyperapp/html'
import { $icon } from '../helpers/element'

import Actuate from 'actuatejs'
import animate from 'animate.css'

export default (a) =>
  div({
    class: 'popup',
    oncreate: e => {
      Actuate('fadeIn fadeOut')(e).then(_ => a.setPopupVisible(false))
    }
  }, [
    $icon('#check'),
    span('Added to Queue'),
  ])