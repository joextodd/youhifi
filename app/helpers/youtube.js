const MAX_RESULTS = 10
const YT_DATA_API = 'AIzaSyDhPy8kijXuNd2kM75qldDVAZEh0hYwwmU'

const YT_API_SEARCH = 'https://www.googleapis.com/youtube/v3/search?part=snippet'
  + `&maxResults=${MAX_RESULTS}&key=${YT_DATA_API}&type=video&videoCategoryId=10&regionCode=GB`

const YT_API_VIDEOS = 'https://www.googleapis.com/youtube/v3/videos?part=snippet'
  + `&maxResults=${MAX_RESULTS}&key=${YT_DATA_API}&videoCategoryId=10&chart=mostPopular&regionCode=GB`

export const secondsToHHMMSS = seconds => {
  const h = parseInt(seconds / 3600, 10) % 24
  const m = parseInt(seconds / 60, 10) % 60
  const s = Math.floor(seconds % 60)
  return h > 0 ?
    `${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}` :
    `${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`
}

export const fetchPopularResults = (query='', token='') =>
fetch(`${YT_API_VIDEOS}&pageToken=${token}`)
.then(r => r.json())
.catch(console.error)

export const fetchSearchResults = (query='', token='') =>
  fetch(`${YT_API_SEARCH}&q=${query}&pageToken=${token}`)
  .then(r => r.json())
  .catch(console.error)

const scrapeYouTube = id => new Promise((resolve, reject) => {
  fetch(`https://www.youtube.com/watch?v=${id}`)
  .then(r => r.text())
  .then(page => {
    let matches = page.match(/<script[^<]*<\/script>/g)
    let idx = matches.findIndex(el => el.includes('window["ytInitialData"]'))
    let objStr = matches[idx].replace(/\s/g, '')
                  .replace('<script>', '')
                  .replace('window["ytInitialData"]=', '')
                  .split(';')[0]
    resolve(JSON.parse(objStr))
  }).catch(reject)
})

export const scrapeRelated = id => new Promise((resolve, reject) => {
  scrapeYouTube(id)
  .then(obj => {
    let related = {'items': []}
    let results = obj.webWatchNextResponseExtensionData.relatedVideoArgs.split('iurlhq=')
    for (let i = 1; i < results.length; i++) {
      const data = results[i].split('&')
      let titleIdx = data.findIndex(el => el.includes('title='))
      let idIdx = data.findIndex(el => el.includes('id='))
      if (idIdx >= 0 && titleIdx >= 0) {
        related.items.push({
          id: data[idIdx].split('id=')[1],
          title: decodeURIComponent(data[titleIdx].split('title=')[1]).replaceAll('+', ' ')
        })
      }
    }
    console.log(related)
    resolve(related)
  }).catch(reject)
})
