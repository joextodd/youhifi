const MAX_RESULTS = 10
const YT_DATA_API = 'AIzaSyDhPy8kijXuNd2kM75qldDVAZEh0hYwwmU'

const YT_API_SEARCH = 'https://www.googleapis.com/youtube/v3/search?part=snippet'
  + `&maxResults=${MAX_RESULTS}&key=${YT_DATA_API}&type=video&videoCategoryId=10&regionCode=GB`

const YT_API_VIDEOS = 'https://www.googleapis.com/youtube/v3/videos?part=snippet'
  + `&maxResults=${MAX_RESULTS}&key=${YT_DATA_API}&videoCategoryId=10&chart=mostPopular&regionCode=GB`

export const fetchRelated = id =>
  fetch(`${YT_API_SEARCH}&relatedToVideoId=${id}`)
  .then(r => r.json())
  .catch(console.error)

export const fetchPopularResults = (query='', token='') => 
fetch(`${YT_API_VIDEOS}&pageToken=${token}`)
.then(r => r.json())
.catch(console.error)

export const fetchSearchResults = (query='', token='') =>
  fetch(`${YT_API_SEARCH}&q=${query}&pageToken=${token}`)
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
