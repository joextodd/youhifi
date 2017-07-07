# AudioStream

[![Build Status](https://travis-ci.org/joextodd/audiostream.svg?branch=master)](https://travis-ci.org/joextodd/audiostream)

Low bandwidth audio streams.

```
npm install     // Install all dependencies
npm start       // Build and watch files for changes
```

This will build the application and serve it on http://localhost:8080


## Code Features

- Very minimal config files, developer and client side dependencies
- Developer task that rebuilds app when source files change using [npm-watch](https://www.npmjs.com/package/npm-watch)
- Bundle scripts task supporting `ES6` and `JSX` transforms using [buble](https://www.npmjs.com/package/buble)
- Preprocessing and concatenating stylesheets using using [rollup-plugin-scss](https://www.npmjs.com/package/rollup-plugin-scss)
- Local static file server supporting HTML5 fallback using [http-server-spa](https://www.npmjs.com/package/http-server-spa)
- Frontend application state management and routing using [hyperapp](https://www.npmjs.com/package/hyperapp)
- PWA compliant resources; service worker, manifest and icons passing [lighthouse](https://github.com/GoogleChrome/lighthouse)
- Deploys distributed code to `gh-pages` when merged to master using [TravisCI](https://travis-ci.org/)
