import style from '../index.css'

export const iOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
export const iOS_chrome = () => navigator.userAgent.match('CriOS')
export const scrollToSearch = () =>
  window.scroll({
    top: window.innerHeight * .8,
    left: 0,
    behavior: 'smooth',
  })

export const focusOnScrollTop = {
  oncreate: e => {
    e._fn = ev => window.scrollY === 0
      ? e.classList.add(style.focus)
      : e.classList.remove(style.focus)
    e._fn()
    window.addEventListener('scroll', e._fn)
  },
  onremove: e =>
    window.removeEventListener('scroll', e._fn),
}

export const fix100vh = {
  style: { paddingBottom: iOS() && !iOS_chrome() && '100px' }
}
