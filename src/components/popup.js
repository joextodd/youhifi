import { h } from 'hyperapp'
import { div, span } from '@hyperapp/html'
import { $icon } from '../helpers/element'

import Actuate from 'actuatejs'
import style from '../popup.css'

export default (a,d) =>
  div({
    class: style.popup,
    oncreate: e => {
      Actuate(d.animations)(e).then(_ => a.setPopupVisible(false))
    }
  }, [
    $icon(d.iconId),
    span(d.text),
  ])
