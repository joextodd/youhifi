import buble from "rollup-plugin-buble"
import commonjs from "rollup-plugin-commonjs"
import resolve from "rollup-plugin-node-resolve"
import uglify from "rollup-plugin-uglify"
import postcss from "rollup-plugin-postcss"
import nested from "postcss-nested"
import autoprefix from "autoprefixer"

export default {
  format: 'iife',
  sourceMap: false,
  useStrict: false,
  moduleContext: {
    'node_modules/whatwg-fetch/fetch.js': 'window',
  },
  plugins: [
    postcss({
      sourceMap: 'inline',
      extract : true,
      plugins: [
        nested(),
        autoprefix({ browsers: 'last 2 versions' }),
      ],
    }),
    commonjs(),
    resolve({ jsnext: true }),
    buble({ jsx: 'h' }),
    uglify(),
  ],
  onwarn: function (message) {
    if (/Use of `eval` \(in .*\/node_modules\/firebase\/.*\) is strongly discouraged/.test(message)) {
      return
    }
  },
}
