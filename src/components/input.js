import { h } from 'hyperapp'

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

const debounced = fn => debounce(fn, 300)

export const input = (s,a) => {
  return h('input', {
    placeholder: 'Search YouTube',
    oninput: debounced(a.search),
    onchange: e => a.setSearchString(e.target.value)
  })
}
