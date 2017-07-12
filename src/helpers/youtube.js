const MAX_RESULTS = 10
const YT_API_KEY = "AIzaSyBKrJKFGTSo3YVPyavzo6ngIll3DYIuadQ"

export const YT_API_SEARCH = 'https://www.googleapis.com/youtube/v3/search?part=snippet'
  + `&maxResults=${MAX_RESULTS}&key=${YT_API_KEY}&type=video&videoCategoryId=10`

export const fetchRelated = id =>
  fetch(`${YT_API_SEARCH}&relatedToVideoId=${id}`)
  .then(r => r.json())

export const fetchSearchResults = (query='', token='') =>
  fetch(`${YT_API_SEARCH}&q=${query}&pageToken=${token}`)
  .then(r => r.json())
