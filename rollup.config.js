import preroll from 'preroll'
import autoprefix from "autoprefixer"

const prod = !process.env.ROLLUP_WATCH
const dev = !!process.env.ROLLUP_WATCH

export default {
  input: 'src/index.js',
  output: {
    file: 'static/index.js',
    sourcemap: dev ? 'inline' : false,
    format: 'iife',
  },
  plugins: [ ...preroll(dev) ],
  moduleContext: {
    'node_modules/whatwg-fetch/fetch.js': 'window',
  },
}
