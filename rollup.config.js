import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import postcss from 'rollup-plugin-postcss'
import nested from 'postcss-nested'
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
  plugins: [
    postcss({ plugins: [
      nested(),
      autoprefix({ browsers: 'last 2 versions' }),
    ]}),
    resolve({ jsnext: true }),
    commonjs(),
    buble({ jsx: 'h' }),
    prod && uglify(),
    dev && livereload('static'),
    dev && serve({
      contentBase: ['static'],
      historyApiFallback: true,
      port: 8080,
    })
  ],
  moduleContext: {
    'node_modules/whatwg-fetch/fetch.js': 'window',
  },
  onwarn: function (message) {
    if (/Use of `eval` \(in .*\/node_modules\/firebase\/.*\) is strongly discouraged/.test(message)) {
      return
    }
  },
}
