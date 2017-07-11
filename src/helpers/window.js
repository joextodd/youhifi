export const iOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
export const iOS_chrome = () => navigator.userAgent.match('CriOS')
export const scrollToSearch = () =>
  window.scroll({
    top: window.innerHeight * .8,
    left: 0,
    behavior: 'smooth',
  })
