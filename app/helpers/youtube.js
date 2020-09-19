const MAX_RESULTS = 10
const YT_DATA_API = 'AIzaSyDhPy8kijXuNd2kM75qldDVAZEh0hYwwmU'

export const YT_API_SEARCH = 'https://www.googleapis.com/youtube/v3/search?part=snippet'
  + `&maxResults=${MAX_RESULTS}&key=${YT_DATA_API}&type=video&videoCategoryId=10`

export const fetchRelated = id =>
  fetch(`${YT_API_SEARCH}&relatedToVideoId=${id}&maxResults=${MAX_RESULTS}`)
  .then(r => r.json())
  .catch(console.error)

export const fetchSearchResults = (query='', token='') =>
  fetch(`${YT_API_SEARCH}&q=${query}&pageToken=${token}&maxResults=${MAX_RESULTS}`)
  .then(r => r.json())
  .catch(console.error)

export const secondsToHHMMSS = seconds => {
  const h = parseInt(seconds / 3600, 10) % 24
  const m = parseInt(seconds / 60, 10) % 60
  const s = Math.floor(seconds % 60)
  return h > 0 ?
    `${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}` :
    `${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`
}
