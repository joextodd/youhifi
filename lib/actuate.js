"use strict";!function(){var n=function(n){return function(t){return new Promise(function(e,i){var s=Array.isArray(n)?n:n.split(" "),a=function n(i){t.classList.remove("animated"),t.classList.remove(s[0]),t.removeEventListener("animationend",n),s.shift(),s.length?o():e(t)},o=function(n){t.addEventListener("animationend",a),t.classList.add("animated"),t.classList.add(s[0])};t.classList.contains("animated")?i(t):o()})}};"undefined"!=typeof module&&void 0!==module.exports?module.exports=n:window.Actuate=n}();