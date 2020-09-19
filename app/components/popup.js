import h from '../../lib/hyperapp/h.js'
import { $icon } from '../helpers/element.js'

// import Actuate from '../../lib/actuate.js'

export default (a,d) => h('div', [
  $icon(d.iconId),
  h('span', [], d.text)
], {
  class: style.popup,
  // oncreate: e => {
  //   Actuate(d.animations)(e).then(_ => a.setPopupVisible(false))
  // }
})
