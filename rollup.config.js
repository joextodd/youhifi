import buble from "rollup-plugin-buble"
import commonjs from "rollup-plugin-commonjs"
import resolve from "rollup-plugin-node-resolve"
import uglify from "rollup-plugin-uglify"
import scss from 'rollup-plugin-scss'

export default {
  format: 'iife',
  sourceMap: false,
  moduleContext: {
    'node_modules/whatwg-fetch/fetch.js': 'window',
  },
  plugins: [
    scss(),
    commonjs(),
    buble({ jsx: "h" }),
    resolve({ jsnext: true }),
    uglify(),
  ]
}
