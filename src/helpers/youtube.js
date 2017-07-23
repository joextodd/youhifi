const MAX_RESULTS = 10
const YT_API_KEY = "AIzaSyBudPwcEKAS7KEyMnyDOPuHUv5pd3vSZ-U"

export const YT_API_SEARCH = 'https://www.googleapis.com/youtube/v3/search?part=snippet'
  + `&maxResults=${MAX_RESULTS}&key=${YT_API_KEY}&type=video&videoCategoryId=10`

export const fetchRelated = id =>
  fetch(`${YT_API_SEARCH}&relatedToVideoId=${id}`)
  .then(r => r.json())

export const fetchSearchResults = (query='', token='') =>
  fetch(`${YT_API_SEARCH}&q=${query}&pageToken=${token}`)
  .then(r => r.json())

export const secondsToHHMMSS = seconds => {
  const h = parseInt(seconds / 3600, 10) % 24
  const m = parseInt(seconds / 60, 10) % 60
  const s = Math.floor(seconds % 60)
  return h > 0 ?
    `${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}` :
    `${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`
}
