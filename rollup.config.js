import preroll from 'preroll'
import { name, version } from './package.json'

const prod = !process.env.ROLLUP_WATCH
const dev = !!process.env.ROLLUP_WATCH

export default {
  input: 'src/index.js',
  output: {
    file: 'static/index.js',
    sourcemap: dev ? 'inline' : false,
    format: 'iife',
  },
  intro: `console.log('${name} version: ${version}')`,
  plugins: [ ...preroll(dev) ],
  moduleContext: {
    'node_modules/whatwg-fetch/fetch.js': 'window',
  },
}
