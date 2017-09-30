import { h } from 'hyperapp'
import { div, span } from '@hyperapp/html'
import { $icon } from '../helpers/element'

import Actuate from 'actuatejs'
import animate from 'animate.css'

export default (a,d) =>
  div({
    class: 'popup',
    oncreate: e => {
      Actuate(d.animations)(e).then(_ => a.setPopupVisible(false))
    }
  }, [
    $icon(d.iconId),
    span(d.text),
  ])