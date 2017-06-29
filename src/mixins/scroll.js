function getScrollPercent() {
    var h = document.documentElement,
        b = document.body,
        st = 'scrollTop',
        sh = 'scrollHeight'
    return (h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight) * 100
}

export const Scroll = () => ({
  state: {
    scroll: {
      // x: 0,
      // y: 0,
      // pc: 0,
      atStartY: true,
      //atEndY: false,
    }
  },
  actions: {
    scroll: {
      update: (s,a,d) => ({ scroll: d })
    }
  },
  events: {
    //scroll: (s,a,d) => console.log(s.scroll),
    loaded: (s,a,_,e) => window.addEventListener('scroll', () => {
      const state = {
        // x: window.scrollX,
        // y: window.scrollY,
        // pc: getScrollPercent(),
        atStartY: window.scrollY === 0 ? true : false,
        // atEndY: document.body.scrollTop > 0 &&
        //   (window.innerHeight + window.scrollY) >= document.body.scrollHeight
        //   ? true
        //   : false,
      }
      a.scroll.update(state)
      // e('scroll', state)
    }),
  },
})
