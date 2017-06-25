export const YouTube = () => ({
  state: {
    url: 'https://www.googleapis.com/youtube/v3',
    key: 'AIzaSyBKrJKFGTSo3YVPyavzo6ngIll3DYIuadQ',
    results: 10,
    search: [],
    next: [],
  },
  events: {
  	update: console.log
  },
  actions: {
  	setSearch: (s,a,d) => ({ search: d.items }),
  	setNext: (s,a,d) => ({ next: d.items }),
    next: (s,a,d) => {
    	fetch(`${s.url}/search?part=snippet&maxResults=${s.results}&relatedToVideoId=${d}&type=video&key=${s.key}`)
    	.then(r => r.json())
    	.then(a.setNext)
    	.catch(console.log)
    },
    search: (s,a,d) => {
    	fetch(`${s.url}/search?part=snippet&maxResults=${s.results}&q=${d}&type=video&key=${s.key}`)
    	.then(r => r.json())
    	.then(a.setSearch)
    	.catch(console.log)
    },
  },
})