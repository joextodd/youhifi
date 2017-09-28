(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
(function () {
'use strict';

function __$styleInject(css, returnValue) {
  if (typeof document === 'undefined') {
    return returnValue;
  }
  css = css || '';
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  head.appendChild(style);
  
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  return returnValue;
}

var h = function(tag, data) {
  var arguments$1 = arguments;

  var node;
  var stack = [];
  var children = [];

  for (var i = arguments.length; i-- > 2; ) {
    stack[stack.length] = arguments$1[i];
  }

  while (stack.length) {
    if (Array.isArray((node = stack.pop()))) {
      for (var i = node.length; i--; ) {
        stack[stack.length] = node[i];
      }
    } else if (node != null && node !== true && node !== false) {
      if (typeof node === "number") {
        node = node + "";
      }
      children[children.length] = node;
    }
  }

  return typeof tag === "string"
    ? {
        tag: tag,
        data: data || {},
        children: children
      }
    : tag(data, children)
};

var app = function(app) {
  var state = {};
  var view = app.view;
  var actions = {};
  var events = {};
  var node;
  var element;

  for (var i = -1, mixins = app.mixins || []; i < mixins.length; i++) {
    var mixin = mixins[i] ? mixins[i](app) : app;

    if (mixin.mixins != null && mixin !== app) {
      mixins = mixins.concat(mixin.mixins);
    }

    if (mixin.state != null) {
      state = merge(state, mixin.state);
    }

    init(actions, mixin.actions);

    Object.keys(mixin.events || []).map(function(key) {
      events[key] = (events[key] || []).concat(mixin.events[key]);
    });
  }

  if (document.readyState[0] !== "l") {
    load();
  } else {
    addEventListener("DOMContentLoaded", load);
  }

  function init(namespace, children, lastName) {
    Object.keys(children || []).map(function(key) {
      var action = children[key];
      var name = lastName ? lastName + "." + key : key;

      if (typeof action === "function") {
        namespace[key] = function(data) {
          var result = action(
            state,
            actions,
            emit("action", {
              name: name,
              data: data
            }).data,
            emit
          );

          if (result == null || typeof result.then === "function") {
            return result
          }

          render((state = merge(state, emit("update", result))), view);
        };
      } else {
        init(namespace[key] || (namespace[key] = {}), action, name);
      }
    });
  }

  function load() {
    render(state, view);
    emit("loaded");
  }

  function emit(name, data) {
    (events[name] || []).map(function(cb) {
      var result = cb(state, actions, data, emit);
      if (result != null) {
        data = result;
      }
    });

    return data
  }

  function render(state, view) {
    element = patch(
      app.root || (app.root = document.body),
      element,
      node,
      (node = emit("render", view)(state, actions))
    );
  }

  function merge(a, b) {
    var obj = {};

    if (typeof b !== "object" || Array.isArray(b)) {
      return b
    }

    for (var i in a) {
      obj[i] = a[i];
    }
    for (var i in b) {
      obj[i] = b[i];
    }

    return obj
  }

  function createElementFrom(node, isSVG) {
    if (typeof node === "string") {
      var element = document.createTextNode(node);
    } else {
      var element = (isSVG = isSVG || node.tag === "svg")
        ? document.createElementNS("http://www.w3.org/2000/svg", node.tag)
        : document.createElement(node.tag);

      for (var i = 0; i < node.children.length; ) {
        element.appendChild(createElementFrom(node.children[i++], isSVG));
      }

      for (var i in node.data) {
        if (i === "oncreate") {
          node.data[i](element);
        } else {
          setElementData(element, i, node.data[i]);
        }
      }
    }

    return element
  }

  function setElementData(element, name, value, oldValue) {
    if (name === "key") {
    } else if (name === "style") {
      for (var i in merge(oldValue, (value = value || {}))) {
        element.style[i] = value[i] || "";
      }
    } else {
      try {
        element[name] = value;
      } catch (_) {}

      if (typeof value !== "function") {
        if (value) {
          element.setAttribute(name, value);
        } else {
          element.removeAttribute(name);
        }
      }
    }
  }

  function updateElementData(element, oldData, data) {
    for (var name in merge(oldData, data)) {
      var value = data[name];
      var oldValue = name === "value" || name === "checked"
        ? element[name]
        : oldData[name];

      if (name === "onupdate" && value) {
        value(element);
      } else if (value !== oldValue) {
        setElementData(element, name, value, oldValue);
      }
    }
  }

  function getKeyFrom(node) {
    if (node && (node = node.data)) {
      return node.key
    }
  }

  function removeElement(parent, element, node) {
    ((node.data && node.data.onremove) || removeChild)(element, removeChild);
    function removeChild() {
      parent.removeChild(element);
    }
  }

  function patch(parent, element, oldNode, node) {
    if (oldNode == null) {
      element = parent.insertBefore(createElementFrom(node), element);
    } else if (node.tag && node.tag === oldNode.tag) {
      updateElementData(element, oldNode.data, node.data);

      var len = node.children.length;
      var oldLen = oldNode.children.length;
      var reusableChildren = {};
      var oldElements = [];
      var newKeys = {};

      for (var i = 0; i < oldLen; i++) {
        var oldElement = element.childNodes[i];
        oldElements[i] = oldElement;

        var oldChild = oldNode.children[i];
        var oldKey = getKeyFrom(oldChild);

        if (null != oldKey) {
          reusableChildren[oldKey] = [oldElement, oldChild];
        }
      }

      var i = 0;
      var j = 0;

      while (j < len) {
        var oldElement = oldElements[i];
        var oldChild = oldNode.children[i];
        var newChild = node.children[j];

        var oldKey = getKeyFrom(oldChild);
        if (newKeys[oldKey]) {
          i++;
          continue
        }

        var newKey = getKeyFrom(newChild);

        var reusableChild = reusableChildren[newKey] || [];

        if (null == newKey) {
          if (null == oldKey) {
            patch(element, oldElement, oldChild, newChild);
            j++;
          }
          i++;
        } else {
          if (oldKey === newKey) {
            patch(element, reusableChild[0], reusableChild[1], newChild);
            i++;
          } else if (reusableChild[0]) {
            element.insertBefore(reusableChild[0], oldElement);
            patch(element, reusableChild[0], reusableChild[1], newChild);
          } else {
            patch(element, oldElement, null, newChild);
          }

          j++;
          newKeys[newKey] = newChild;
        }
      }

      while (i < oldLen) {
        var oldChild = oldNode.children[i];
        var oldKey = getKeyFrom(oldChild);
        if (null == oldKey) {
          removeElement(element, oldElements[i], oldChild);
        }
        i++;
      }

      for (var i in reusableChildren) {
        var reusableChild = reusableChildren[i];
        var reusableNode = reusableChild[1];
        if (!newKeys[reusableNode.data.key]) {
          removeElement(element, reusableChild[0], reusableNode);
        }
      }
    } else if (node !== oldNode) {
      var i = element;
      parent.replaceChild((element = createElementFrom(node)), i);
    }

    return element
  }
};

var Router = function(app, view) {
  return {
    state: {
      router: match(location.pathname)
    },
    actions: {
      router: {
        match: function(state, actions, data, emit) {
          return {
            router: emit("route", match(data))
          }
        },
        go: function(state, actions, data) {
          history.pushState({}, "", data);
          actions.router.match(data.split("?")[0]);
        }
      }
    },
    events: {
      loaded: function(state, actions) {
        match();
        addEventListener("popstate", match);

        function match() {
          actions.router.match(location.pathname);
        }
      },
      render: function() {
        return view
      }
    }
  }

  function match(data) {
    for (var match, params = {}, i = 0, len = app.view.length; i < len; i++) {
      var route = app.view[i][0];
      var keys = [];

      if (!match) {
        data.replace(
          RegExp(
            route === "*"
              ? "." + route
              : "^" +
                  route
                    .replace(/\//g, "\\/")
                    .replace(/:([\w]+)/g, function(_, key) {
                      keys.push(key);
                      return "([-\\.\\w]+)"
                    }) +
                  "/?$",
            "g"
          ),
          function() {
            var arguments$1 = arguments;

            for (var j = 1; j < arguments.length - 2; ) {
              params[keys.shift()] = arguments$1[j++];
            }
            match = route;
            view = app.view[i][1];
          }
        );
      }
    }

    return {
      match: match,
      params: params
    }
  }
};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var smoothscroll = createCommonjsModule(function (module, exports) {
/*
 * smoothscroll polyfill - v0.3.5
 * https://iamdustan.github.io/smoothscroll
 * 2016 (c) Dustan Kasten, Jeremias Menichelli - MIT License
 */

(function(w, d, undefined) {
  'use strict';

  /*
   * aliases
   * w: window global object
   * d: document
   * undefined: undefined
   */

  // polyfill
  function polyfill() {
    // return when scrollBehavior interface is supported
    if ('scrollBehavior' in d.documentElement.style) {
      return;
    }

    /*
     * globals
     */
    var Element = w.HTMLElement || w.Element;
    var SCROLL_TIME = 468;

    /*
     * object gathering original scroll methods
     */
    var original = {
      scroll: w.scroll || w.scrollTo,
      scrollBy: w.scrollBy,
      elScroll: Element.prototype.scroll || scrollElement,
      scrollIntoView: Element.prototype.scrollIntoView
    };

    /*
     * define timing method
     */
    var now = w.performance && w.performance.now
      ? w.performance.now.bind(w.performance) : Date.now;

    /**
     * changes scroll position inside an element
     * @method scrollElement
     * @param {Number} x
     * @param {Number} y
     */
    function scrollElement(x, y) {
      this.scrollLeft = x;
      this.scrollTop = y;
    }

    /**
     * returns result of applying ease math function to a number
     * @method ease
     * @param {Number} k
     * @returns {Number}
     */
    function ease(k) {
      return 0.5 * (1 - Math.cos(Math.PI * k));
    }

    /**
     * indicates if a smooth behavior should be applied
     * @method shouldBailOut
     * @param {Number|Object} x
     * @returns {Boolean}
     */
    function shouldBailOut(x) {
      if (typeof x !== 'object'
            || x === null
            || x.behavior === undefined
            || x.behavior === 'auto'
            || x.behavior === 'instant') {
        // first arg not an object/null
        // or behavior is auto, instant or undefined
        return true;
      }

      if (typeof x === 'object'
            && x.behavior === 'smooth') {
        // first argument is an object and behavior is smooth
        return false;
      }

      // throw error when behavior is not supported
      throw new TypeError('behavior not valid');
    }

    /**
     * finds scrollable parent of an element
     * @method findScrollableParent
     * @param {Node} el
     * @returns {Node} el
     */
    function findScrollableParent(el) {
      var isBody;
      var hasScrollableSpace;
      var hasVisibleOverflow;

      do {
        el = el.parentNode;

        // set condition variables
        isBody = el === d.body;
        hasScrollableSpace =
          el.clientHeight < el.scrollHeight ||
          el.clientWidth < el.scrollWidth;
        hasVisibleOverflow =
          w.getComputedStyle(el, null).overflow === 'visible';
      } while (!isBody && !(hasScrollableSpace && !hasVisibleOverflow));

      isBody = hasScrollableSpace = hasVisibleOverflow = null;

      return el;
    }

    /**
     * self invoked function that, given a context, steps through scrolling
     * @method step
     * @param {Object} context
     */
    function step(context) {
      var time = now();
      var value;
      var currentX;
      var currentY;
      var elapsed = (time - context.startTime) / SCROLL_TIME;

      // avoid elapsed times higher than one
      elapsed = elapsed > 1 ? 1 : elapsed;

      // apply easing to elapsed time
      value = ease(elapsed);

      currentX = context.startX + (context.x - context.startX) * value;
      currentY = context.startY + (context.y - context.startY) * value;

      context.method.call(context.scrollable, currentX, currentY);

      // scroll more if we have not reached our destination
      if (currentX !== context.x || currentY !== context.y) {
        w.requestAnimationFrame(step.bind(w, context));
      }
    }

    /**
     * scrolls window with a smooth behavior
     * @method smoothScroll
     * @param {Object|Node} el
     * @param {Number} x
     * @param {Number} y
     */
    function smoothScroll(el, x, y) {
      var scrollable;
      var startX;
      var startY;
      var method;
      var startTime = now();

      // define scroll context
      if (el === d.body) {
        scrollable = w;
        startX = w.scrollX || w.pageXOffset;
        startY = w.scrollY || w.pageYOffset;
        method = original.scroll;
      } else {
        scrollable = el;
        startX = el.scrollLeft;
        startY = el.scrollTop;
        method = scrollElement;
      }

      // scroll looping over a frame
      step({
        scrollable: scrollable,
        method: method,
        startTime: startTime,
        startX: startX,
        startY: startY,
        x: x,
        y: y
      });
    }

    /*
     * ORIGINAL METHODS OVERRIDES
     */

    // w.scroll and w.scrollTo
    w.scroll = w.scrollTo = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scroll.call(
          w,
          arguments[0].left || arguments[0],
          arguments[0].top || arguments[1]
        );
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        w,
        d.body,
        ~~arguments[0].left,
        ~~arguments[0].top
      );
    };

    // w.scrollBy
    w.scrollBy = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scrollBy.call(
          w,
          arguments[0].left || arguments[0],
          arguments[0].top || arguments[1]
        );
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        w,
        d.body,
        ~~arguments[0].left + (w.scrollX || w.pageXOffset),
        ~~arguments[0].top + (w.scrollY || w.pageYOffset)
      );
    };

    // Element.prototype.scroll and Element.prototype.scrollTo
    Element.prototype.scroll = Element.prototype.scrollTo = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.elScroll.call(
            this,
            arguments[0].left || arguments[0],
            arguments[0].top || arguments[1]
        );
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
          this,
          this,
          arguments[0].left,
          arguments[0].top
      );
    };

    // Element.prototype.scrollBy
    Element.prototype.scrollBy = function() {
      var arg0 = arguments[0];

      if (typeof arg0 === 'object') {
        this.scroll({
          left: arg0.left + this.scrollLeft,
          top: arg0.top + this.scrollTop,
          behavior: arg0.behavior
        });
      } else {
        this.scroll(
          this.scrollLeft + arg0,
          this.scrollTop + arguments[1]
        );
      }
    };

    // Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scrollIntoView.call(this, arguments[0] || true);
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      var scrollableParent = findScrollableParent(this);
      var parentRects = scrollableParent.getBoundingClientRect();
      var clientRects = this.getBoundingClientRect();

      if (scrollableParent !== d.body) {
        // reveal element inside parent
        smoothScroll.call(
          this,
          scrollableParent,
          scrollableParent.scrollLeft + clientRects.left - parentRects.left,
          scrollableParent.scrollTop + clientRects.top - parentRects.top
        );
        // reveal parent in viewport
        w.scrollBy({
          left: parentRects.left,
          top: parentRects.top,
          behavior: 'smooth'
        });
      } else {
        // reveal element in viewport
        w.scrollBy({
          left: clientRects.left,
          top: clientRects.top,
          behavior: 'smooth'
        });
      }
    };
  }

  {
    // commonjs
    module.exports = { polyfill: polyfill };
  }
})(window, document);
});

var clamp = function (z) { return function (min,max) { return Math.min(Math.max(z, min), max); }; };

var Player = function () { return ({
  state: {
    player: null,
    playing: false,
    error: false,
    currentTime: 0,
    webm: false,
  },
  actions: {
    setWebm: function (s,a,d) { return ({ webm: d }); },
    setCurrentTime: function (s,a,d) { return ({ currentTime: d }); },
    setError: function (s,a,d) { return ({ error: d }); },
    setPlaying: function (s,a,d) { return ({ playing: d }); },
    pause: function (s,a,d) {
      s.player && s.player.pause();
      a.setPlaying(false);
    },
    playPause: function (s,a,d) {
      s.player.paused ? s.player.play() : s.player.pause();
      a.setPlaying(!s.player.paused);
    },
    seekBy: function (ref,a,d) {
      var player = ref.player;

      var time = clamp(player.currentTime + d)(0, player.duration);
      player.currentTime = time;
      a.setCurrentTime(time);
    },
  },
}); };

var MAX_RESULTS = 10;
var YT_API_KEY = "AIzaSyBudPwcEKAS7KEyMnyDOPuHUv5pd3vSZ-U";

var YT_API_SEARCH = 'https://www.googleapis.com/youtube/v3/search?part=snippet'
  + "&maxResults=" + MAX_RESULTS + "&key=" + YT_API_KEY + "&type=video&videoCategoryId=10";

var fetchRelated = function (id) { return fetch((YT_API_SEARCH + "&relatedToVideoId=" + id))
  .then(function (r) { return r.json(); }); };

var fetchSearchResults = function (query, token) {
    if ( query === void 0 ) query='';
    if ( token === void 0 ) token='';

    return fetch((YT_API_SEARCH + "&q=" + query + "&pageToken=" + token))
  .then(function (r) { return r.json(); });
};

var secondsToHHMMSS = function (seconds) {
  var h = parseInt(seconds / 3600, 10) % 24;
  var m = parseInt(seconds / 60, 10) % 60;
  var s = Math.floor(seconds % 60);
  return h > 0 ?
    ((h < 10 ? ("0" + h) : h) + ":" + (m < 10 ? ("0" + m) : m) + ":" + (s < 10 ? ("0" + s) : s)) :
    ((m < 10 ? ("0" + m) : m) + ":" + (s < 10 ? ("0" + s) : s))
};

var Search = function () { return ({
  state: {
    searchString: '',
    searchToken: '',
    searchResults: [],
  },
  events: {
    loaded: function (s,a) { return s.router.params.id
      ? fetchRelated(s.router.params.id)
          .then(function (ref) {
            var items = ref.items;

            return a.setSearchResults(items);
      })
      : a.search(); }
  },
  actions: {
    setSearchString: function (s,a,d) { return ({ searchString: d || '' }); },
    setSearchToken: function (s,a,d) { return ({ searchToken: d || '' }); },
    setSearchResults: function (s,a,d) { return ({ searchResults: d }); },
    search: function (s,a,d) {
      a.setSearchString(d);
      a.setSearchToken();
      a.fetchResults();
    },
    fetchResults: function (s,a,d) {
      (s.searchString.length || s.searchResults.length === 0) &&
      fetchSearchResults(s.searchString, s.searchToken)
      .then(function (ref) {
        var items = ref.items;
        var nextPageToken = ref.nextPageToken;

        a.setSearchResults(s.searchToken
          ? s.searchResults.concat(items)
          : items
        );
        a.setSearchToken(nextPageToken);
      }).catch(console.log);
    },
  },
}); };

var database = firebase.database().ref('parties');

var Party = function () { return ({
  state: {
    partyQ: [],
    partyId: '',
    popupVisible: false,
  },
  actions: {
    setPartyId: function (s,a,d) { return ({ partyId: d }); },
    setPartyQ: function (s,a,d) { return ({ partyQ: d }); },
    getPartyQ: function (s,a,d) {
      s.partyId &&
        database.child(s.partyId).on('value', function (data) {
          data.val() && data.val().ids && a.updateQ(data.val().ids);
        });
    },
    updateQ: function (s,a,q) {
      a.setPartyQ(q);
      s.track.id !== q[0] && a.getVideo(q[0]);
    },
    setPopupVisible: function (s,a,d) { return ({ popupVisible: d }); },
    savePartyState: function (s,a,d) {
      if (s.partyId) {
        a.setPopupVisible(true);
        database.child(s.partyId).set({ ids: s.partyQ.concat(d) });
      }
    },
    nextQTrack: function (s,a,d) {
      s.partyId &&
        database.child(s.partyId).set({
          ids: s.track.id === s.partyQ[0] ?
            s.partyQ.splice(0, 1) && s.partyQ :
              s.partyQ
        });
    }
  }
}); };

var noop = function (_) { return _; };
var debounced = function (time) { return function (fn) { return debounce(fn, time); }; };

var debounce = function (func, wait, immediate) {
  var timeout;
  return function() {
    var ref = [this, arguments];
    var context = ref[0];
    var args = ref[1];
    var later = function() {
      timeout = null;
      if (!immediate) { func.apply(context, args); }
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) { func.apply(context, args); }
  }
};

var onWindowBottom = function (fn) { return function (e) { return document.body.scrollTop > 0 &&
  (window.innerHeight + window.scrollY) >= document.body.scrollHeight
  ? fn(e)
  : noop(); }; };











var input = function (p) {
    if ( p === void 0 ) p={};

    return h('input', Object.assign(p, {
    oninput: debounced(p.debounce || 0)(p.action || noop)
  }));
};

var ul = function (p,c) {
    if ( p === void 0 ) p={};
    if ( c === void 0 ) c=[];

    return h('ul', Object.assign(p, p.infinite ? {
    oncreate: function (e) {
      e._infinite = onWindowBottom(p.infinite || noop);
      window.addEventListener('scroll', e._infinite);
    },
    onremove: function (e,done) {
      window.removeEventListener('scroll', e._infinite);
      done();
    },
  } : {}), c);
};

var $svg = function (p,c) { return h("svg", p, c); };

var $use = function (href) { return h("use", {
    href: href,
    oncreate: function (e) { return e.setAttributeNS("http://www.w3.org/1999/xlink", "href", href); }
  }); };

var $img = function (p) { return h('img', p); };

var $ytThumb = function (id) { return $img({ src: ("https://img.youtube.com/vi/" + id + "/hqdefault.jpg") }); };

var $icon = function (href) { return $svg({}, $use(href)); };

var $spinner = function () { return h('div', { class: 'spinner' },
    [1,2,3,4,5].map(function (x) { return h('div', { class: ("rect" + x) }); })
  ); };

var $title = function (c) { return h('title-', {}, c); };
var $form = function (p,c) { return h('form', p, c); };

var $searchItem = function (s,a) { return function (item) { return h('a', {
    href: ("/" + (item.id.videoId)),
    onclick: function (e) { return e.preventDefault()
      || a.savePartyState(item.id.videoId)
      || (!s.partyId && a.router.go(("/" + (item.id.videoId))))
      || window.scrollTo(0,0); }
  },[
    $ytThumb(item.id.videoId),
    $title(item.snippet.title) ]); }; };

var Search$1 = function (s,a) { return h('search-', {}, [
    $form({
      action: '#',
      onsubmit: function (e) { return e.preventDefault() || document.activeElement.blur(); }
    }, [
      input({
        placeholder: 'Search songs or artists..',
        action: function (e) { return a.search(e.target.value); },
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        spellcheck: 'false',
        debounce: 300,
      }),
      $icon('#search') ]),
    ul({ class: 'search-results', infinite: a.fetchResults, },
      s.searchResults.map($searchItem(s,a))
    ),
    (s.searchString !== '' && $spinner())
  ]); };

/* eslint-disable no-undefined,no-param-reassign,no-shadow */

/**
 * Throttle execution of a function. Especially useful for rate limiting
 * execution of handlers on events like resize and scroll.
 *
 * @param  {Number}    delay          A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
 * @param  {Boolean}   noTrailing     Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds while the
 *                                    throttled-function is being called. If noTrailing is false or unspecified, callback will be executed one final time
 *                                    after the last throttled-function call. (After the throttled-function has not been called for `delay` milliseconds,
 *                                    the internal counter is reset)
 * @param  {Function}  callback       A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
 *                                    to `callback` when the throttled-function is executed.
 * @param  {Boolean}   debounceMode   If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is false (at end),
 *                                    schedule `callback` to execute after `delay` ms.
 *
 * @return {Function}  A new, throttled, function.
 */
var throttle = function ( delay, noTrailing, callback, debounceMode ) {

	// After wrapper has stopped being called, this timeout ensures that
	// `callback` is executed at the proper times in `throttle` and `end`
	// debounce modes.
	var timeoutID;

	// Keep track of the last time `callback` was executed.
	var lastExec = 0;

	// `noTrailing` defaults to falsy.
	if ( typeof noTrailing !== 'boolean' ) {
		debounceMode = callback;
		callback = noTrailing;
		noTrailing = undefined;
	}

	// The `wrapper` function encapsulates all of the throttling / debouncing
	// functionality and when executed will limit the rate at which `callback`
	// is executed.
	function wrapper () {

		var self = this;
		var elapsed = Number(new Date()) - lastExec;
		var args = arguments;

		// Execute `callback` and update the `lastExec` timestamp.
		function exec () {
			lastExec = Number(new Date());
			callback.apply(self, args);
		}

		// If `debounceMode` is true (at begin) this is used to clear the flag
		// to allow future `callback` executions.
		function clear () {
			timeoutID = undefined;
		}

		if ( debounceMode && !timeoutID ) {
			// Since `wrapper` is being called for the first time and
			// `debounceMode` is true (at begin), execute `callback`.
			exec();
		}

		// Clear any existing timeout.
		if ( timeoutID ) {
			clearTimeout(timeoutID);
		}

		if ( debounceMode === undefined && elapsed > delay ) {
			// In throttle mode, if `delay` time has been exceeded, execute
			// `callback`.
			exec();

		} else if ( noTrailing !== true ) {
			// In trailing throttle mode, since `delay` time has not been
			// exceeded, schedule `callback` to execute `delay` ms after most
			// recent execution.
			//
			// If `debounceMode` is true (at begin), schedule `clear` to execute
			// after `delay` ms.
			//
			// If `debounceMode` is false (at end), schedule `callback` to
			// execute after `delay` ms.
			timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === undefined ? delay - elapsed : delay);
		}

	}

	// Return the wrapper function.
	return wrapper;

};

var iOS = function () { return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream; };
var iOS_chrome = function () { return navigator.userAgent.match('CriOS'); };
var scrollToSearch = function () { return window.scroll({
    top: window.innerHeight * .8,
    left: 0,
    behavior: 'smooth',
  }); };

var focusOnScrollTop = {
  oncreate: function (e) {
    e._fn = function (ev) { return window.scrollY === 0
      ? e.classList.add('focus')
      : e.classList.remove('focus'); };
    e._fn();
    window.addEventListener('scroll', e._fn);
  },
  onremove: function (e) { return window.removeEventListener('scroll', e._fn); },
};

var fix100vh = {
  style: { paddingBottom: iOS() && !iOS_chrome() && '100px' }
};

var url$1 = 'https://api.joextodd.com';

var $title$1 = function (c) { return h('title-', {}, c); };
var $loading = function (c) { return h('loading-', {}, c); };
var $audio = function (p) { return h('audio', p); };
var $button = function (p,c) { return h('button', p, c); };

var $progress = function (time, total) {
  var cur = secondsToHHMMSS(time);
  var dur = secondsToHHMMSS(iOS() ? total/2 : total);
  return h('time-', {}, (cur + " | " + dur))
};

var Player$1 = function (s,a) { return h('player-', Object.assign(fix100vh, focusOnScrollTop), [
    $ytThumb(s.track.id),
    $title$1(s.isFetching ? $spinner() : s.track.title),
    !s.isFetching && (s.error
      ? $loading('ERROR')
      : s.player.currentTime === 0
        ? iOS() && s.player.paused ? $loading('PRESS PLAY') : $loading('LOADING')
        : $progress(s.player.currentTime, s.player.duration)),
    h('controls-', {},[
      $button({ onclick: a.prevVideo, disabled: !!s.isFetching }, $icon('#previous')),
      $button({ onclick: function (e) { return a.seekBy(-10); }, disabled: !!s.error }, $icon('#rewind')),
      $button({ onclick: a.playPause, disabled: !!s.error,
        class: s.error ? 'error' : s.playing ? 'pause' : 'play',
      }, [$icon('#error'), $icon('#pause'), $icon('#play')]),
      $button({ onclick: function (e) { return a.seekBy(10); }, disabled: !!s.error }, $icon('#forwards')),
      $button({ onclick: a.nextVideo, disabled: !!s.isFetching }, $icon('#next')) ]),
    $button({ class: 'search', onclick: scrollToSearch }, 'Search For Stream'),
    $audio({
      src: s.track.url ? (url$1 + "/proxy/" + ((s.webm && s.track.webm) || s.track.url)) : '',
      title: s.track.title,
      crossorigin: 'anonymous',
      autoplay: !iOS() && 'yes',
      onerror: function (_) { return a.setError(true); },
      oncanplay: function (_) { return a.setError(false); },
      onended: function (_) { return a.nextVideo(); },
      oncreate: function (e) {
        s.player = e;
        s.webm = !!e.canPlayType('audio/webm');
      },
      ontimeupdate: throttle(1000, function (e) {
        a.setCurrentTime(s.player.currentTime);
        iOS() && (s.player.currentTime > s.player.duration / 2) && a.nextVideo();
      }),
    }) ]); };

var i$1;
var stack = [];

function h$1(tag, data) {
  var arguments$1 = arguments;

  var node;
  var children = [];

  for (i$1 = arguments.length; i$1-- > 2; ) {
    stack.push(arguments$1[i$1]);
  }

  while (stack.length) {
    if (Array.isArray((node = stack.pop()))) {
      for (i$1 = node.length; i$1--; ) {
        stack.push(node[i$1]);
      }
    } else if (node != null && node !== true && node !== false) {
      if (typeof node === "number") {
        node = node + "";
      }
      children.push(node);
    }
  }

  return typeof tag === "string"
    ? {
        tag: tag,
        data: data || {},
        children: children
      }
    : tag(data, children)
}

function vnode(tag) {
  return function (props, children) {
    return typeof props === "object" && !Array.isArray(props)
      ? h$1(tag, props, children)
      : h$1(tag, {}, props)
  }
}






















































function div(props, children) {
  return vnode("div")(props, children)
}









































































































function span(props, children) {
  return vnode("span")(props, children)
}

var index_min = createCommonjsModule(function (module) {
"use strict";!function(){var n={animation:"animationend",MSAnimation:"MSAnimationEnd",WebkitAnimation:"webkitAnimationEnd"},t=n[Object.keys(n).filter(function(n){return document.body.style.hasOwnProperty(n)})[0]],i=function(n){return function(i){return new Promise(function(e,o){var a=Array.isArray(n)?n:n.split(" "),r=function n(o){i.classList.remove("animated",a[0]),i.removeEventListener(t,n),a.shift(),a.length?s():e(i);},s=function(n){i.addEventListener(t,r),i.classList.add("animated",a[0]);};i.classList.contains("animated")?o(i):s();})}};"undefined"!='object'&&void 0!==module.exports?module.exports=i:window.Actuate=i;}();
});

__$styleInject("@charset \"UTF-8\";\n\n/*!\n * animate.css -http://daneden.me/animate\n * Version - 3.5.1\n * Licensed under the MIT license - http://opensource.org/licenses/MIT\n *\n * Copyright (c) 2016 Daniel Eden\n */\n\n.animated {\n  -webkit-animation-duration: 1s;\n  animation-duration: 1s;\n  -webkit-animation-fill-mode: both;\n  animation-fill-mode: both;\n}\n\n.animated.infinite {\n  -webkit-animation-iteration-count: infinite;\n  animation-iteration-count: infinite;\n}\n\n.animated.hinge {\n  -webkit-animation-duration: 2s;\n  animation-duration: 2s;\n}\n\n.animated.flipOutX,\n.animated.flipOutY,\n.animated.bounceIn,\n.animated.bounceOut {\n  -webkit-animation-duration: .75s;\n  animation-duration: .75s;\n}\n\n@-webkit-keyframes bounce {\n  from, 20%, 53%, 80%, to {\n    -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n    -webkit-transform: translate3d(0,0,0);\n    transform: translate3d(0,0,0);\n  }\n\n  40%, 43% {\n    -webkit-animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);\n    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);\n    -webkit-transform: translate3d(0, -30px, 0);\n    transform: translate3d(0, -30px, 0);\n  }\n\n  70% {\n    -webkit-animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);\n    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);\n    -webkit-transform: translate3d(0, -15px, 0);\n    transform: translate3d(0, -15px, 0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(0,-4px,0);\n    transform: translate3d(0,-4px,0);\n  }\n}\n\n@keyframes bounce {\n  from, 20%, 53%, 80%, to {\n    -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n    -webkit-transform: translate3d(0,0,0);\n    transform: translate3d(0,0,0);\n  }\n\n  40%, 43% {\n    -webkit-animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);\n    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);\n    -webkit-transform: translate3d(0, -30px, 0);\n    transform: translate3d(0, -30px, 0);\n  }\n\n  70% {\n    -webkit-animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);\n    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);\n    -webkit-transform: translate3d(0, -15px, 0);\n    transform: translate3d(0, -15px, 0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(0,-4px,0);\n    transform: translate3d(0,-4px,0);\n  }\n}\n\n.bounce {\n  -webkit-animation-name: bounce;\n  animation-name: bounce;\n  -webkit-transform-origin: center bottom;\n  transform-origin: center bottom;\n}\n\n@-webkit-keyframes flash {\n  from, 50%, to {\n    opacity: 1;\n  }\n\n  25%, 75% {\n    opacity: 0;\n  }\n}\n\n@keyframes flash {\n  from, 50%, to {\n    opacity: 1;\n  }\n\n  25%, 75% {\n    opacity: 0;\n  }\n}\n\n.flash {\n  -webkit-animation-name: flash;\n  animation-name: flash;\n}\n\n/* originally authored by Nick Pettit - https://github.com/nickpettit/glide */\n\n@-webkit-keyframes pulse {\n  from {\n    -webkit-transform: scale3d(1, 1, 1);\n    transform: scale3d(1, 1, 1);\n  }\n\n  50% {\n    -webkit-transform: scale3d(1.05, 1.05, 1.05);\n    transform: scale3d(1.05, 1.05, 1.05);\n  }\n\n  to {\n    -webkit-transform: scale3d(1, 1, 1);\n    transform: scale3d(1, 1, 1);\n  }\n}\n\n@keyframes pulse {\n  from {\n    -webkit-transform: scale3d(1, 1, 1);\n    transform: scale3d(1, 1, 1);\n  }\n\n  50% {\n    -webkit-transform: scale3d(1.05, 1.05, 1.05);\n    transform: scale3d(1.05, 1.05, 1.05);\n  }\n\n  to {\n    -webkit-transform: scale3d(1, 1, 1);\n    transform: scale3d(1, 1, 1);\n  }\n}\n\n.pulse {\n  -webkit-animation-name: pulse;\n  animation-name: pulse;\n}\n\n@-webkit-keyframes rubberBand {\n  from {\n    -webkit-transform: scale3d(1, 1, 1);\n    transform: scale3d(1, 1, 1);\n  }\n\n  30% {\n    -webkit-transform: scale3d(1.25, 0.75, 1);\n    transform: scale3d(1.25, 0.75, 1);\n  }\n\n  40% {\n    -webkit-transform: scale3d(0.75, 1.25, 1);\n    transform: scale3d(0.75, 1.25, 1);\n  }\n\n  50% {\n    -webkit-transform: scale3d(1.15, 0.85, 1);\n    transform: scale3d(1.15, 0.85, 1);\n  }\n\n  65% {\n    -webkit-transform: scale3d(.95, 1.05, 1);\n    transform: scale3d(.95, 1.05, 1);\n  }\n\n  75% {\n    -webkit-transform: scale3d(1.05, .95, 1);\n    transform: scale3d(1.05, .95, 1);\n  }\n\n  to {\n    -webkit-transform: scale3d(1, 1, 1);\n    transform: scale3d(1, 1, 1);\n  }\n}\n\n@keyframes rubberBand {\n  from {\n    -webkit-transform: scale3d(1, 1, 1);\n    transform: scale3d(1, 1, 1);\n  }\n\n  30% {\n    -webkit-transform: scale3d(1.25, 0.75, 1);\n    transform: scale3d(1.25, 0.75, 1);\n  }\n\n  40% {\n    -webkit-transform: scale3d(0.75, 1.25, 1);\n    transform: scale3d(0.75, 1.25, 1);\n  }\n\n  50% {\n    -webkit-transform: scale3d(1.15, 0.85, 1);\n    transform: scale3d(1.15, 0.85, 1);\n  }\n\n  65% {\n    -webkit-transform: scale3d(.95, 1.05, 1);\n    transform: scale3d(.95, 1.05, 1);\n  }\n\n  75% {\n    -webkit-transform: scale3d(1.05, .95, 1);\n    transform: scale3d(1.05, .95, 1);\n  }\n\n  to {\n    -webkit-transform: scale3d(1, 1, 1);\n    transform: scale3d(1, 1, 1);\n  }\n}\n\n.rubberBand {\n  -webkit-animation-name: rubberBand;\n  animation-name: rubberBand;\n}\n\n@-webkit-keyframes shake {\n  from, to {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n\n  10%, 30%, 50%, 70%, 90% {\n    -webkit-transform: translate3d(-10px, 0, 0);\n    transform: translate3d(-10px, 0, 0);\n  }\n\n  20%, 40%, 60%, 80% {\n    -webkit-transform: translate3d(10px, 0, 0);\n    transform: translate3d(10px, 0, 0);\n  }\n}\n\n@keyframes shake {\n  from, to {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n\n  10%, 30%, 50%, 70%, 90% {\n    -webkit-transform: translate3d(-10px, 0, 0);\n    transform: translate3d(-10px, 0, 0);\n  }\n\n  20%, 40%, 60%, 80% {\n    -webkit-transform: translate3d(10px, 0, 0);\n    transform: translate3d(10px, 0, 0);\n  }\n}\n\n.shake {\n  -webkit-animation-name: shake;\n  animation-name: shake;\n}\n\n@-webkit-keyframes headShake {\n  0% {\n    -webkit-transform: translateX(0);\n    transform: translateX(0);\n  }\n\n  6.5% {\n    -webkit-transform: translateX(-6px) rotateY(-9deg);\n    transform: translateX(-6px) rotateY(-9deg);\n  }\n\n  18.5% {\n    -webkit-transform: translateX(5px) rotateY(7deg);\n    transform: translateX(5px) rotateY(7deg);\n  }\n\n  31.5% {\n    -webkit-transform: translateX(-3px) rotateY(-5deg);\n    transform: translateX(-3px) rotateY(-5deg);\n  }\n\n  43.5% {\n    -webkit-transform: translateX(2px) rotateY(3deg);\n    transform: translateX(2px) rotateY(3deg);\n  }\n\n  50% {\n    -webkit-transform: translateX(0);\n    transform: translateX(0);\n  }\n}\n\n@keyframes headShake {\n  0% {\n    -webkit-transform: translateX(0);\n    transform: translateX(0);\n  }\n\n  6.5% {\n    -webkit-transform: translateX(-6px) rotateY(-9deg);\n    transform: translateX(-6px) rotateY(-9deg);\n  }\n\n  18.5% {\n    -webkit-transform: translateX(5px) rotateY(7deg);\n    transform: translateX(5px) rotateY(7deg);\n  }\n\n  31.5% {\n    -webkit-transform: translateX(-3px) rotateY(-5deg);\n    transform: translateX(-3px) rotateY(-5deg);\n  }\n\n  43.5% {\n    -webkit-transform: translateX(2px) rotateY(3deg);\n    transform: translateX(2px) rotateY(3deg);\n  }\n\n  50% {\n    -webkit-transform: translateX(0);\n    transform: translateX(0);\n  }\n}\n\n.headShake {\n  -webkit-animation-timing-function: ease-in-out;\n  animation-timing-function: ease-in-out;\n  -webkit-animation-name: headShake;\n  animation-name: headShake;\n}\n\n@-webkit-keyframes swing {\n  20% {\n    -webkit-transform: rotate3d(0, 0, 1, 15deg);\n    transform: rotate3d(0, 0, 1, 15deg);\n  }\n\n  40% {\n    -webkit-transform: rotate3d(0, 0, 1, -10deg);\n    transform: rotate3d(0, 0, 1, -10deg);\n  }\n\n  60% {\n    -webkit-transform: rotate3d(0, 0, 1, 5deg);\n    transform: rotate3d(0, 0, 1, 5deg);\n  }\n\n  80% {\n    -webkit-transform: rotate3d(0, 0, 1, -5deg);\n    transform: rotate3d(0, 0, 1, -5deg);\n  }\n\n  to {\n    -webkit-transform: rotate3d(0, 0, 1, 0deg);\n    transform: rotate3d(0, 0, 1, 0deg);\n  }\n}\n\n@keyframes swing {\n  20% {\n    -webkit-transform: rotate3d(0, 0, 1, 15deg);\n    transform: rotate3d(0, 0, 1, 15deg);\n  }\n\n  40% {\n    -webkit-transform: rotate3d(0, 0, 1, -10deg);\n    transform: rotate3d(0, 0, 1, -10deg);\n  }\n\n  60% {\n    -webkit-transform: rotate3d(0, 0, 1, 5deg);\n    transform: rotate3d(0, 0, 1, 5deg);\n  }\n\n  80% {\n    -webkit-transform: rotate3d(0, 0, 1, -5deg);\n    transform: rotate3d(0, 0, 1, -5deg);\n  }\n\n  to {\n    -webkit-transform: rotate3d(0, 0, 1, 0deg);\n    transform: rotate3d(0, 0, 1, 0deg);\n  }\n}\n\n.swing {\n  -webkit-transform-origin: top center;\n  transform-origin: top center;\n  -webkit-animation-name: swing;\n  animation-name: swing;\n}\n\n@-webkit-keyframes tada {\n  from {\n    -webkit-transform: scale3d(1, 1, 1);\n    transform: scale3d(1, 1, 1);\n  }\n\n  10%, 20% {\n    -webkit-transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg);\n    transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg);\n  }\n\n  30%, 50%, 70%, 90% {\n    -webkit-transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);\n    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);\n  }\n\n  40%, 60%, 80% {\n    -webkit-transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);\n    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);\n  }\n\n  to {\n    -webkit-transform: scale3d(1, 1, 1);\n    transform: scale3d(1, 1, 1);\n  }\n}\n\n@keyframes tada {\n  from {\n    -webkit-transform: scale3d(1, 1, 1);\n    transform: scale3d(1, 1, 1);\n  }\n\n  10%, 20% {\n    -webkit-transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg);\n    transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg);\n  }\n\n  30%, 50%, 70%, 90% {\n    -webkit-transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);\n    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);\n  }\n\n  40%, 60%, 80% {\n    -webkit-transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);\n    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);\n  }\n\n  to {\n    -webkit-transform: scale3d(1, 1, 1);\n    transform: scale3d(1, 1, 1);\n  }\n}\n\n.tada {\n  -webkit-animation-name: tada;\n  animation-name: tada;\n}\n\n/* originally authored by Nick Pettit - https://github.com/nickpettit/glide */\n\n@-webkit-keyframes wobble {\n  from {\n    -webkit-transform: none;\n    transform: none;\n  }\n\n  15% {\n    -webkit-transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg);\n    transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg);\n  }\n\n  30% {\n    -webkit-transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg);\n    transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg);\n  }\n\n  45% {\n    -webkit-transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg);\n    transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg);\n  }\n\n  60% {\n    -webkit-transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg);\n    transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg);\n  }\n\n  75% {\n    -webkit-transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg);\n    transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg);\n  }\n\n  to {\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n@keyframes wobble {\n  from {\n    -webkit-transform: none;\n    transform: none;\n  }\n\n  15% {\n    -webkit-transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg);\n    transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg);\n  }\n\n  30% {\n    -webkit-transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg);\n    transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg);\n  }\n\n  45% {\n    -webkit-transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg);\n    transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg);\n  }\n\n  60% {\n    -webkit-transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg);\n    transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg);\n  }\n\n  75% {\n    -webkit-transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg);\n    transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg);\n  }\n\n  to {\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n.wobble {\n  -webkit-animation-name: wobble;\n  animation-name: wobble;\n}\n\n@-webkit-keyframes jello {\n  from, 11.1%, to {\n    -webkit-transform: none;\n    transform: none;\n  }\n\n  22.2% {\n    -webkit-transform: skewX(-12.5deg) skewY(-12.5deg);\n    transform: skewX(-12.5deg) skewY(-12.5deg);\n  }\n\n  33.3% {\n    -webkit-transform: skewX(6.25deg) skewY(6.25deg);\n    transform: skewX(6.25deg) skewY(6.25deg);\n  }\n\n  44.4% {\n    -webkit-transform: skewX(-3.125deg) skewY(-3.125deg);\n    transform: skewX(-3.125deg) skewY(-3.125deg);\n  }\n\n  55.5% {\n    -webkit-transform: skewX(1.5625deg) skewY(1.5625deg);\n    transform: skewX(1.5625deg) skewY(1.5625deg);\n  }\n\n  66.6% {\n    -webkit-transform: skewX(-0.78125deg) skewY(-0.78125deg);\n    transform: skewX(-0.78125deg) skewY(-0.78125deg);\n  }\n\n  77.7% {\n    -webkit-transform: skewX(0.390625deg) skewY(0.390625deg);\n    transform: skewX(0.390625deg) skewY(0.390625deg);\n  }\n\n  88.8% {\n    -webkit-transform: skewX(-0.1953125deg) skewY(-0.1953125deg);\n    transform: skewX(-0.1953125deg) skewY(-0.1953125deg);\n  }\n}\n\n@keyframes jello {\n  from, 11.1%, to {\n    -webkit-transform: none;\n    transform: none;\n  }\n\n  22.2% {\n    -webkit-transform: skewX(-12.5deg) skewY(-12.5deg);\n    transform: skewX(-12.5deg) skewY(-12.5deg);\n  }\n\n  33.3% {\n    -webkit-transform: skewX(6.25deg) skewY(6.25deg);\n    transform: skewX(6.25deg) skewY(6.25deg);\n  }\n\n  44.4% {\n    -webkit-transform: skewX(-3.125deg) skewY(-3.125deg);\n    transform: skewX(-3.125deg) skewY(-3.125deg);\n  }\n\n  55.5% {\n    -webkit-transform: skewX(1.5625deg) skewY(1.5625deg);\n    transform: skewX(1.5625deg) skewY(1.5625deg);\n  }\n\n  66.6% {\n    -webkit-transform: skewX(-0.78125deg) skewY(-0.78125deg);\n    transform: skewX(-0.78125deg) skewY(-0.78125deg);\n  }\n\n  77.7% {\n    -webkit-transform: skewX(0.390625deg) skewY(0.390625deg);\n    transform: skewX(0.390625deg) skewY(0.390625deg);\n  }\n\n  88.8% {\n    -webkit-transform: skewX(-0.1953125deg) skewY(-0.1953125deg);\n    transform: skewX(-0.1953125deg) skewY(-0.1953125deg);\n  }\n}\n\n.jello {\n  -webkit-animation-name: jello;\n  animation-name: jello;\n  -webkit-transform-origin: center;\n  transform-origin: center;\n}\n\n@-webkit-keyframes bounceIn {\n  from, 20%, 40%, 60%, 80%, to {\n    -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n  }\n\n  0% {\n    opacity: 0;\n    -webkit-transform: scale3d(.3, .3, .3);\n    transform: scale3d(.3, .3, .3);\n  }\n\n  20% {\n    -webkit-transform: scale3d(1.1, 1.1, 1.1);\n    transform: scale3d(1.1, 1.1, 1.1);\n  }\n\n  40% {\n    -webkit-transform: scale3d(.9, .9, .9);\n    transform: scale3d(.9, .9, .9);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: scale3d(1.03, 1.03, 1.03);\n    transform: scale3d(1.03, 1.03, 1.03);\n  }\n\n  80% {\n    -webkit-transform: scale3d(.97, .97, .97);\n    transform: scale3d(.97, .97, .97);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: scale3d(1, 1, 1);\n    transform: scale3d(1, 1, 1);\n  }\n}\n\n@keyframes bounceIn {\n  from, 20%, 40%, 60%, 80%, to {\n    -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n  }\n\n  0% {\n    opacity: 0;\n    -webkit-transform: scale3d(.3, .3, .3);\n    transform: scale3d(.3, .3, .3);\n  }\n\n  20% {\n    -webkit-transform: scale3d(1.1, 1.1, 1.1);\n    transform: scale3d(1.1, 1.1, 1.1);\n  }\n\n  40% {\n    -webkit-transform: scale3d(.9, .9, .9);\n    transform: scale3d(.9, .9, .9);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: scale3d(1.03, 1.03, 1.03);\n    transform: scale3d(1.03, 1.03, 1.03);\n  }\n\n  80% {\n    -webkit-transform: scale3d(.97, .97, .97);\n    transform: scale3d(.97, .97, .97);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: scale3d(1, 1, 1);\n    transform: scale3d(1, 1, 1);\n  }\n}\n\n.bounceIn {\n  -webkit-animation-name: bounceIn;\n  animation-name: bounceIn;\n}\n\n@-webkit-keyframes bounceInDown {\n  from, 60%, 75%, 90%, to {\n    -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n  }\n\n  0% {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -3000px, 0);\n    transform: translate3d(0, -3000px, 0);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: translate3d(0, 25px, 0);\n    transform: translate3d(0, 25px, 0);\n  }\n\n  75% {\n    -webkit-transform: translate3d(0, -10px, 0);\n    transform: translate3d(0, -10px, 0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(0, 5px, 0);\n    transform: translate3d(0, 5px, 0);\n  }\n\n  to {\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n@keyframes bounceInDown {\n  from, 60%, 75%, 90%, to {\n    -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n  }\n\n  0% {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -3000px, 0);\n    transform: translate3d(0, -3000px, 0);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: translate3d(0, 25px, 0);\n    transform: translate3d(0, 25px, 0);\n  }\n\n  75% {\n    -webkit-transform: translate3d(0, -10px, 0);\n    transform: translate3d(0, -10px, 0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(0, 5px, 0);\n    transform: translate3d(0, 5px, 0);\n  }\n\n  to {\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n.bounceInDown {\n  -webkit-animation-name: bounceInDown;\n  animation-name: bounceInDown;\n}\n\n@-webkit-keyframes bounceInLeft {\n  from, 60%, 75%, 90%, to {\n    -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n  }\n\n  0% {\n    opacity: 0;\n    -webkit-transform: translate3d(-3000px, 0, 0);\n    transform: translate3d(-3000px, 0, 0);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: translate3d(25px, 0, 0);\n    transform: translate3d(25px, 0, 0);\n  }\n\n  75% {\n    -webkit-transform: translate3d(-10px, 0, 0);\n    transform: translate3d(-10px, 0, 0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(5px, 0, 0);\n    transform: translate3d(5px, 0, 0);\n  }\n\n  to {\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n@keyframes bounceInLeft {\n  from, 60%, 75%, 90%, to {\n    -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n  }\n\n  0% {\n    opacity: 0;\n    -webkit-transform: translate3d(-3000px, 0, 0);\n    transform: translate3d(-3000px, 0, 0);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: translate3d(25px, 0, 0);\n    transform: translate3d(25px, 0, 0);\n  }\n\n  75% {\n    -webkit-transform: translate3d(-10px, 0, 0);\n    transform: translate3d(-10px, 0, 0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(5px, 0, 0);\n    transform: translate3d(5px, 0, 0);\n  }\n\n  to {\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n.bounceInLeft {\n  -webkit-animation-name: bounceInLeft;\n  animation-name: bounceInLeft;\n}\n\n@-webkit-keyframes bounceInRight {\n  from, 60%, 75%, 90%, to {\n    -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n  }\n\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(3000px, 0, 0);\n    transform: translate3d(3000px, 0, 0);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: translate3d(-25px, 0, 0);\n    transform: translate3d(-25px, 0, 0);\n  }\n\n  75% {\n    -webkit-transform: translate3d(10px, 0, 0);\n    transform: translate3d(10px, 0, 0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(-5px, 0, 0);\n    transform: translate3d(-5px, 0, 0);\n  }\n\n  to {\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n@keyframes bounceInRight {\n  from, 60%, 75%, 90%, to {\n    -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n  }\n\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(3000px, 0, 0);\n    transform: translate3d(3000px, 0, 0);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: translate3d(-25px, 0, 0);\n    transform: translate3d(-25px, 0, 0);\n  }\n\n  75% {\n    -webkit-transform: translate3d(10px, 0, 0);\n    transform: translate3d(10px, 0, 0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(-5px, 0, 0);\n    transform: translate3d(-5px, 0, 0);\n  }\n\n  to {\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n.bounceInRight {\n  -webkit-animation-name: bounceInRight;\n  animation-name: bounceInRight;\n}\n\n@-webkit-keyframes bounceInUp {\n  from, 60%, 75%, 90%, to {\n    -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n  }\n\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 3000px, 0);\n    transform: translate3d(0, 3000px, 0);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: translate3d(0, -20px, 0);\n    transform: translate3d(0, -20px, 0);\n  }\n\n  75% {\n    -webkit-transform: translate3d(0, 10px, 0);\n    transform: translate3d(0, 10px, 0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(0, -5px, 0);\n    transform: translate3d(0, -5px, 0);\n  }\n\n  to {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n@keyframes bounceInUp {\n  from, 60%, 75%, 90%, to {\n    -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);\n  }\n\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 3000px, 0);\n    transform: translate3d(0, 3000px, 0);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: translate3d(0, -20px, 0);\n    transform: translate3d(0, -20px, 0);\n  }\n\n  75% {\n    -webkit-transform: translate3d(0, 10px, 0);\n    transform: translate3d(0, 10px, 0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(0, -5px, 0);\n    transform: translate3d(0, -5px, 0);\n  }\n\n  to {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n.bounceInUp {\n  -webkit-animation-name: bounceInUp;\n  animation-name: bounceInUp;\n}\n\n@-webkit-keyframes bounceOut {\n  20% {\n    -webkit-transform: scale3d(.9, .9, .9);\n    transform: scale3d(.9, .9, .9);\n  }\n\n  50%, 55% {\n    opacity: 1;\n    -webkit-transform: scale3d(1.1, 1.1, 1.1);\n    transform: scale3d(1.1, 1.1, 1.1);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: scale3d(.3, .3, .3);\n    transform: scale3d(.3, .3, .3);\n  }\n}\n\n@keyframes bounceOut {\n  20% {\n    -webkit-transform: scale3d(.9, .9, .9);\n    transform: scale3d(.9, .9, .9);\n  }\n\n  50%, 55% {\n    opacity: 1;\n    -webkit-transform: scale3d(1.1, 1.1, 1.1);\n    transform: scale3d(1.1, 1.1, 1.1);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: scale3d(.3, .3, .3);\n    transform: scale3d(.3, .3, .3);\n  }\n}\n\n.bounceOut {\n  -webkit-animation-name: bounceOut;\n  animation-name: bounceOut;\n}\n\n@-webkit-keyframes bounceOutDown {\n  20% {\n    -webkit-transform: translate3d(0, 10px, 0);\n    transform: translate3d(0, 10px, 0);\n  }\n\n  40%, 45% {\n    opacity: 1;\n    -webkit-transform: translate3d(0, -20px, 0);\n    transform: translate3d(0, -20px, 0);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 2000px, 0);\n    transform: translate3d(0, 2000px, 0);\n  }\n}\n\n@keyframes bounceOutDown {\n  20% {\n    -webkit-transform: translate3d(0, 10px, 0);\n    transform: translate3d(0, 10px, 0);\n  }\n\n  40%, 45% {\n    opacity: 1;\n    -webkit-transform: translate3d(0, -20px, 0);\n    transform: translate3d(0, -20px, 0);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 2000px, 0);\n    transform: translate3d(0, 2000px, 0);\n  }\n}\n\n.bounceOutDown {\n  -webkit-animation-name: bounceOutDown;\n  animation-name: bounceOutDown;\n}\n\n@-webkit-keyframes bounceOutLeft {\n  20% {\n    opacity: 1;\n    -webkit-transform: translate3d(20px, 0, 0);\n    transform: translate3d(20px, 0, 0);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(-2000px, 0, 0);\n    transform: translate3d(-2000px, 0, 0);\n  }\n}\n\n@keyframes bounceOutLeft {\n  20% {\n    opacity: 1;\n    -webkit-transform: translate3d(20px, 0, 0);\n    transform: translate3d(20px, 0, 0);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(-2000px, 0, 0);\n    transform: translate3d(-2000px, 0, 0);\n  }\n}\n\n.bounceOutLeft {\n  -webkit-animation-name: bounceOutLeft;\n  animation-name: bounceOutLeft;\n}\n\n@-webkit-keyframes bounceOutRight {\n  20% {\n    opacity: 1;\n    -webkit-transform: translate3d(-20px, 0, 0);\n    transform: translate3d(-20px, 0, 0);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(2000px, 0, 0);\n    transform: translate3d(2000px, 0, 0);\n  }\n}\n\n@keyframes bounceOutRight {\n  20% {\n    opacity: 1;\n    -webkit-transform: translate3d(-20px, 0, 0);\n    transform: translate3d(-20px, 0, 0);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(2000px, 0, 0);\n    transform: translate3d(2000px, 0, 0);\n  }\n}\n\n.bounceOutRight {\n  -webkit-animation-name: bounceOutRight;\n  animation-name: bounceOutRight;\n}\n\n@-webkit-keyframes bounceOutUp {\n  20% {\n    -webkit-transform: translate3d(0, -10px, 0);\n    transform: translate3d(0, -10px, 0);\n  }\n\n  40%, 45% {\n    opacity: 1;\n    -webkit-transform: translate3d(0, 20px, 0);\n    transform: translate3d(0, 20px, 0);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -2000px, 0);\n    transform: translate3d(0, -2000px, 0);\n  }\n}\n\n@keyframes bounceOutUp {\n  20% {\n    -webkit-transform: translate3d(0, -10px, 0);\n    transform: translate3d(0, -10px, 0);\n  }\n\n  40%, 45% {\n    opacity: 1;\n    -webkit-transform: translate3d(0, 20px, 0);\n    transform: translate3d(0, 20px, 0);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -2000px, 0);\n    transform: translate3d(0, -2000px, 0);\n  }\n}\n\n.bounceOutUp {\n  -webkit-animation-name: bounceOutUp;\n  animation-name: bounceOutUp;\n}\n\n@-webkit-keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n\n  to {\n    opacity: 1;\n  }\n}\n\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n\n  to {\n    opacity: 1;\n  }\n}\n\n.fadeIn {\n  -webkit-animation-name: fadeIn;\n  animation-name: fadeIn;\n}\n\n@-webkit-keyframes fadeInDown {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -100%, 0);\n    transform: translate3d(0, -100%, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n@keyframes fadeInDown {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -100%, 0);\n    transform: translate3d(0, -100%, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n.fadeInDown {\n  -webkit-animation-name: fadeInDown;\n  animation-name: fadeInDown;\n}\n\n@-webkit-keyframes fadeInDownBig {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -2000px, 0);\n    transform: translate3d(0, -2000px, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n@keyframes fadeInDownBig {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -2000px, 0);\n    transform: translate3d(0, -2000px, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n.fadeInDownBig {\n  -webkit-animation-name: fadeInDownBig;\n  animation-name: fadeInDownBig;\n}\n\n@-webkit-keyframes fadeInLeft {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(-100%, 0, 0);\n    transform: translate3d(-100%, 0, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n@keyframes fadeInLeft {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(-100%, 0, 0);\n    transform: translate3d(-100%, 0, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n.fadeInLeft {\n  -webkit-animation-name: fadeInLeft;\n  animation-name: fadeInLeft;\n}\n\n@-webkit-keyframes fadeInLeftBig {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(-2000px, 0, 0);\n    transform: translate3d(-2000px, 0, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n@keyframes fadeInLeftBig {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(-2000px, 0, 0);\n    transform: translate3d(-2000px, 0, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n.fadeInLeftBig {\n  -webkit-animation-name: fadeInLeftBig;\n  animation-name: fadeInLeftBig;\n}\n\n@-webkit-keyframes fadeInRight {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n@keyframes fadeInRight {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n.fadeInRight {\n  -webkit-animation-name: fadeInRight;\n  animation-name: fadeInRight;\n}\n\n@-webkit-keyframes fadeInRightBig {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(2000px, 0, 0);\n    transform: translate3d(2000px, 0, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n@keyframes fadeInRightBig {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(2000px, 0, 0);\n    transform: translate3d(2000px, 0, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n.fadeInRightBig {\n  -webkit-animation-name: fadeInRightBig;\n  animation-name: fadeInRightBig;\n}\n\n@-webkit-keyframes fadeInUp {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 100%, 0);\n    transform: translate3d(0, 100%, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n@keyframes fadeInUp {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 100%, 0);\n    transform: translate3d(0, 100%, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n.fadeInUp {\n  -webkit-animation-name: fadeInUp;\n  animation-name: fadeInUp;\n}\n\n@-webkit-keyframes fadeInUpBig {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 2000px, 0);\n    transform: translate3d(0, 2000px, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n@keyframes fadeInUpBig {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 2000px, 0);\n    transform: translate3d(0, 2000px, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n.fadeInUpBig {\n  -webkit-animation-name: fadeInUpBig;\n  animation-name: fadeInUpBig;\n}\n\n@-webkit-keyframes fadeOut {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n  }\n}\n\n@keyframes fadeOut {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n  }\n}\n\n.fadeOut {\n  -webkit-animation-name: fadeOut;\n  animation-name: fadeOut;\n}\n\n@-webkit-keyframes fadeOutDown {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 100%, 0);\n    transform: translate3d(0, 100%, 0);\n  }\n}\n\n@keyframes fadeOutDown {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 100%, 0);\n    transform: translate3d(0, 100%, 0);\n  }\n}\n\n.fadeOutDown {\n  -webkit-animation-name: fadeOutDown;\n  animation-name: fadeOutDown;\n}\n\n@-webkit-keyframes fadeOutDownBig {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 2000px, 0);\n    transform: translate3d(0, 2000px, 0);\n  }\n}\n\n@keyframes fadeOutDownBig {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 2000px, 0);\n    transform: translate3d(0, 2000px, 0);\n  }\n}\n\n.fadeOutDownBig {\n  -webkit-animation-name: fadeOutDownBig;\n  animation-name: fadeOutDownBig;\n}\n\n@-webkit-keyframes fadeOutLeft {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(-100%, 0, 0);\n    transform: translate3d(-100%, 0, 0);\n  }\n}\n\n@keyframes fadeOutLeft {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(-100%, 0, 0);\n    transform: translate3d(-100%, 0, 0);\n  }\n}\n\n.fadeOutLeft {\n  -webkit-animation-name: fadeOutLeft;\n  animation-name: fadeOutLeft;\n}\n\n@-webkit-keyframes fadeOutLeftBig {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(-2000px, 0, 0);\n    transform: translate3d(-2000px, 0, 0);\n  }\n}\n\n@keyframes fadeOutLeftBig {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(-2000px, 0, 0);\n    transform: translate3d(-2000px, 0, 0);\n  }\n}\n\n.fadeOutLeftBig {\n  -webkit-animation-name: fadeOutLeftBig;\n  animation-name: fadeOutLeftBig;\n}\n\n@-webkit-keyframes fadeOutRight {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0);\n  }\n}\n\n@keyframes fadeOutRight {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0);\n  }\n}\n\n.fadeOutRight {\n  -webkit-animation-name: fadeOutRight;\n  animation-name: fadeOutRight;\n}\n\n@-webkit-keyframes fadeOutRightBig {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(2000px, 0, 0);\n    transform: translate3d(2000px, 0, 0);\n  }\n}\n\n@keyframes fadeOutRightBig {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(2000px, 0, 0);\n    transform: translate3d(2000px, 0, 0);\n  }\n}\n\n.fadeOutRightBig {\n  -webkit-animation-name: fadeOutRightBig;\n  animation-name: fadeOutRightBig;\n}\n\n@-webkit-keyframes fadeOutUp {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -100%, 0);\n    transform: translate3d(0, -100%, 0);\n  }\n}\n\n@keyframes fadeOutUp {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -100%, 0);\n    transform: translate3d(0, -100%, 0);\n  }\n}\n\n.fadeOutUp {\n  -webkit-animation-name: fadeOutUp;\n  animation-name: fadeOutUp;\n}\n\n@-webkit-keyframes fadeOutUpBig {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -2000px, 0);\n    transform: translate3d(0, -2000px, 0);\n  }\n}\n\n@keyframes fadeOutUpBig {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -2000px, 0);\n    transform: translate3d(0, -2000px, 0);\n  }\n}\n\n.fadeOutUpBig {\n  -webkit-animation-name: fadeOutUpBig;\n  animation-name: fadeOutUpBig;\n}\n\n@-webkit-keyframes flip {\n  from {\n    -webkit-transform: perspective(400px) rotate3d(0, 1, 0, -360deg);\n    transform: perspective(400px) rotate3d(0, 1, 0, -360deg);\n    -webkit-animation-timing-function: ease-out;\n    animation-timing-function: ease-out;\n  }\n\n  40% {\n    -webkit-transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -190deg);\n    transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -190deg);\n    -webkit-animation-timing-function: ease-out;\n    animation-timing-function: ease-out;\n  }\n\n  50% {\n    -webkit-transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -170deg);\n    transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -170deg);\n    -webkit-animation-timing-function: ease-in;\n    animation-timing-function: ease-in;\n  }\n\n  80% {\n    -webkit-transform: perspective(400px) scale3d(.95, .95, .95);\n    transform: perspective(400px) scale3d(.95, .95, .95);\n    -webkit-animation-timing-function: ease-in;\n    animation-timing-function: ease-in;\n  }\n\n  to {\n    -webkit-transform: perspective(400px);\n    transform: perspective(400px);\n    -webkit-animation-timing-function: ease-in;\n    animation-timing-function: ease-in;\n  }\n}\n\n@keyframes flip {\n  from {\n    -webkit-transform: perspective(400px) rotate3d(0, 1, 0, -360deg);\n    transform: perspective(400px) rotate3d(0, 1, 0, -360deg);\n    -webkit-animation-timing-function: ease-out;\n    animation-timing-function: ease-out;\n  }\n\n  40% {\n    -webkit-transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -190deg);\n    transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -190deg);\n    -webkit-animation-timing-function: ease-out;\n    animation-timing-function: ease-out;\n  }\n\n  50% {\n    -webkit-transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -170deg);\n    transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -170deg);\n    -webkit-animation-timing-function: ease-in;\n    animation-timing-function: ease-in;\n  }\n\n  80% {\n    -webkit-transform: perspective(400px) scale3d(.95, .95, .95);\n    transform: perspective(400px) scale3d(.95, .95, .95);\n    -webkit-animation-timing-function: ease-in;\n    animation-timing-function: ease-in;\n  }\n\n  to {\n    -webkit-transform: perspective(400px);\n    transform: perspective(400px);\n    -webkit-animation-timing-function: ease-in;\n    animation-timing-function: ease-in;\n  }\n}\n\n.animated.flip {\n  -webkit-backface-visibility: visible;\n  backface-visibility: visible;\n  -webkit-animation-name: flip;\n  animation-name: flip;\n}\n\n@-webkit-keyframes flipInX {\n  from {\n    -webkit-transform: perspective(400px) rotate3d(1, 0, 0, 90deg);\n    transform: perspective(400px) rotate3d(1, 0, 0, 90deg);\n    -webkit-animation-timing-function: ease-in;\n    animation-timing-function: ease-in;\n    opacity: 0;\n  }\n\n  40% {\n    -webkit-transform: perspective(400px) rotate3d(1, 0, 0, -20deg);\n    transform: perspective(400px) rotate3d(1, 0, 0, -20deg);\n    -webkit-animation-timing-function: ease-in;\n    animation-timing-function: ease-in;\n  }\n\n  60% {\n    -webkit-transform: perspective(400px) rotate3d(1, 0, 0, 10deg);\n    transform: perspective(400px) rotate3d(1, 0, 0, 10deg);\n    opacity: 1;\n  }\n\n  80% {\n    -webkit-transform: perspective(400px) rotate3d(1, 0, 0, -5deg);\n    transform: perspective(400px) rotate3d(1, 0, 0, -5deg);\n  }\n\n  to {\n    -webkit-transform: perspective(400px);\n    transform: perspective(400px);\n  }\n}\n\n@keyframes flipInX {\n  from {\n    -webkit-transform: perspective(400px) rotate3d(1, 0, 0, 90deg);\n    transform: perspective(400px) rotate3d(1, 0, 0, 90deg);\n    -webkit-animation-timing-function: ease-in;\n    animation-timing-function: ease-in;\n    opacity: 0;\n  }\n\n  40% {\n    -webkit-transform: perspective(400px) rotate3d(1, 0, 0, -20deg);\n    transform: perspective(400px) rotate3d(1, 0, 0, -20deg);\n    -webkit-animation-timing-function: ease-in;\n    animation-timing-function: ease-in;\n  }\n\n  60% {\n    -webkit-transform: perspective(400px) rotate3d(1, 0, 0, 10deg);\n    transform: perspective(400px) rotate3d(1, 0, 0, 10deg);\n    opacity: 1;\n  }\n\n  80% {\n    -webkit-transform: perspective(400px) rotate3d(1, 0, 0, -5deg);\n    transform: perspective(400px) rotate3d(1, 0, 0, -5deg);\n  }\n\n  to {\n    -webkit-transform: perspective(400px);\n    transform: perspective(400px);\n  }\n}\n\n.flipInX {\n  -webkit-backface-visibility: visible !important;\n  backface-visibility: visible !important;\n  -webkit-animation-name: flipInX;\n  animation-name: flipInX;\n}\n\n@-webkit-keyframes flipInY {\n  from {\n    -webkit-transform: perspective(400px) rotate3d(0, 1, 0, 90deg);\n    transform: perspective(400px) rotate3d(0, 1, 0, 90deg);\n    -webkit-animation-timing-function: ease-in;\n    animation-timing-function: ease-in;\n    opacity: 0;\n  }\n\n  40% {\n    -webkit-transform: perspective(400px) rotate3d(0, 1, 0, -20deg);\n    transform: perspective(400px) rotate3d(0, 1, 0, -20deg);\n    -webkit-animation-timing-function: ease-in;\n    animation-timing-function: ease-in;\n  }\n\n  60% {\n    -webkit-transform: perspective(400px) rotate3d(0, 1, 0, 10deg);\n    transform: perspective(400px) rotate3d(0, 1, 0, 10deg);\n    opacity: 1;\n  }\n\n  80% {\n    -webkit-transform: perspective(400px) rotate3d(0, 1, 0, -5deg);\n    transform: perspective(400px) rotate3d(0, 1, 0, -5deg);\n  }\n\n  to {\n    -webkit-transform: perspective(400px);\n    transform: perspective(400px);\n  }\n}\n\n@keyframes flipInY {\n  from {\n    -webkit-transform: perspective(400px) rotate3d(0, 1, 0, 90deg);\n    transform: perspective(400px) rotate3d(0, 1, 0, 90deg);\n    -webkit-animation-timing-function: ease-in;\n    animation-timing-function: ease-in;\n    opacity: 0;\n  }\n\n  40% {\n    -webkit-transform: perspective(400px) rotate3d(0, 1, 0, -20deg);\n    transform: perspective(400px) rotate3d(0, 1, 0, -20deg);\n    -webkit-animation-timing-function: ease-in;\n    animation-timing-function: ease-in;\n  }\n\n  60% {\n    -webkit-transform: perspective(400px) rotate3d(0, 1, 0, 10deg);\n    transform: perspective(400px) rotate3d(0, 1, 0, 10deg);\n    opacity: 1;\n  }\n\n  80% {\n    -webkit-transform: perspective(400px) rotate3d(0, 1, 0, -5deg);\n    transform: perspective(400px) rotate3d(0, 1, 0, -5deg);\n  }\n\n  to {\n    -webkit-transform: perspective(400px);\n    transform: perspective(400px);\n  }\n}\n\n.flipInY {\n  -webkit-backface-visibility: visible !important;\n  backface-visibility: visible !important;\n  -webkit-animation-name: flipInY;\n  animation-name: flipInY;\n}\n\n@-webkit-keyframes flipOutX {\n  from {\n    -webkit-transform: perspective(400px);\n    transform: perspective(400px);\n  }\n\n  30% {\n    -webkit-transform: perspective(400px) rotate3d(1, 0, 0, -20deg);\n    transform: perspective(400px) rotate3d(1, 0, 0, -20deg);\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform: perspective(400px) rotate3d(1, 0, 0, 90deg);\n    transform: perspective(400px) rotate3d(1, 0, 0, 90deg);\n    opacity: 0;\n  }\n}\n\n@keyframes flipOutX {\n  from {\n    -webkit-transform: perspective(400px);\n    transform: perspective(400px);\n  }\n\n  30% {\n    -webkit-transform: perspective(400px) rotate3d(1, 0, 0, -20deg);\n    transform: perspective(400px) rotate3d(1, 0, 0, -20deg);\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform: perspective(400px) rotate3d(1, 0, 0, 90deg);\n    transform: perspective(400px) rotate3d(1, 0, 0, 90deg);\n    opacity: 0;\n  }\n}\n\n.flipOutX {\n  -webkit-animation-name: flipOutX;\n  animation-name: flipOutX;\n  -webkit-backface-visibility: visible !important;\n  backface-visibility: visible !important;\n}\n\n@-webkit-keyframes flipOutY {\n  from {\n    -webkit-transform: perspective(400px);\n    transform: perspective(400px);\n  }\n\n  30% {\n    -webkit-transform: perspective(400px) rotate3d(0, 1, 0, -15deg);\n    transform: perspective(400px) rotate3d(0, 1, 0, -15deg);\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform: perspective(400px) rotate3d(0, 1, 0, 90deg);\n    transform: perspective(400px) rotate3d(0, 1, 0, 90deg);\n    opacity: 0;\n  }\n}\n\n@keyframes flipOutY {\n  from {\n    -webkit-transform: perspective(400px);\n    transform: perspective(400px);\n  }\n\n  30% {\n    -webkit-transform: perspective(400px) rotate3d(0, 1, 0, -15deg);\n    transform: perspective(400px) rotate3d(0, 1, 0, -15deg);\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform: perspective(400px) rotate3d(0, 1, 0, 90deg);\n    transform: perspective(400px) rotate3d(0, 1, 0, 90deg);\n    opacity: 0;\n  }\n}\n\n.flipOutY {\n  -webkit-backface-visibility: visible !important;\n  backface-visibility: visible !important;\n  -webkit-animation-name: flipOutY;\n  animation-name: flipOutY;\n}\n\n@-webkit-keyframes lightSpeedIn {\n  from {\n    -webkit-transform: translate3d(100%, 0, 0) skewX(-30deg);\n    transform: translate3d(100%, 0, 0) skewX(-30deg);\n    opacity: 0;\n  }\n\n  60% {\n    -webkit-transform: skewX(20deg);\n    transform: skewX(20deg);\n    opacity: 1;\n  }\n\n  80% {\n    -webkit-transform: skewX(-5deg);\n    transform: skewX(-5deg);\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform: none;\n    transform: none;\n    opacity: 1;\n  }\n}\n\n@keyframes lightSpeedIn {\n  from {\n    -webkit-transform: translate3d(100%, 0, 0) skewX(-30deg);\n    transform: translate3d(100%, 0, 0) skewX(-30deg);\n    opacity: 0;\n  }\n\n  60% {\n    -webkit-transform: skewX(20deg);\n    transform: skewX(20deg);\n    opacity: 1;\n  }\n\n  80% {\n    -webkit-transform: skewX(-5deg);\n    transform: skewX(-5deg);\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform: none;\n    transform: none;\n    opacity: 1;\n  }\n}\n\n.lightSpeedIn {\n  -webkit-animation-name: lightSpeedIn;\n  animation-name: lightSpeedIn;\n  -webkit-animation-timing-function: ease-out;\n  animation-timing-function: ease-out;\n}\n\n@-webkit-keyframes lightSpeedOut {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform: translate3d(100%, 0, 0) skewX(30deg);\n    transform: translate3d(100%, 0, 0) skewX(30deg);\n    opacity: 0;\n  }\n}\n\n@keyframes lightSpeedOut {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform: translate3d(100%, 0, 0) skewX(30deg);\n    transform: translate3d(100%, 0, 0) skewX(30deg);\n    opacity: 0;\n  }\n}\n\n.lightSpeedOut {\n  -webkit-animation-name: lightSpeedOut;\n  animation-name: lightSpeedOut;\n  -webkit-animation-timing-function: ease-in;\n  animation-timing-function: ease-in;\n}\n\n@-webkit-keyframes rotateIn {\n  from {\n    -webkit-transform-origin: center;\n    transform-origin: center;\n    -webkit-transform: rotate3d(0, 0, 1, -200deg);\n    transform: rotate3d(0, 0, 1, -200deg);\n    opacity: 0;\n  }\n\n  to {\n    -webkit-transform-origin: center;\n    transform-origin: center;\n    -webkit-transform: none;\n    transform: none;\n    opacity: 1;\n  }\n}\n\n@keyframes rotateIn {\n  from {\n    -webkit-transform-origin: center;\n    transform-origin: center;\n    -webkit-transform: rotate3d(0, 0, 1, -200deg);\n    transform: rotate3d(0, 0, 1, -200deg);\n    opacity: 0;\n  }\n\n  to {\n    -webkit-transform-origin: center;\n    transform-origin: center;\n    -webkit-transform: none;\n    transform: none;\n    opacity: 1;\n  }\n}\n\n.rotateIn {\n  -webkit-animation-name: rotateIn;\n  animation-name: rotateIn;\n}\n\n@-webkit-keyframes rotateInDownLeft {\n  from {\n    -webkit-transform-origin: left bottom;\n    transform-origin: left bottom;\n    -webkit-transform: rotate3d(0, 0, 1, -45deg);\n    transform: rotate3d(0, 0, 1, -45deg);\n    opacity: 0;\n  }\n\n  to {\n    -webkit-transform-origin: left bottom;\n    transform-origin: left bottom;\n    -webkit-transform: none;\n    transform: none;\n    opacity: 1;\n  }\n}\n\n@keyframes rotateInDownLeft {\n  from {\n    -webkit-transform-origin: left bottom;\n    transform-origin: left bottom;\n    -webkit-transform: rotate3d(0, 0, 1, -45deg);\n    transform: rotate3d(0, 0, 1, -45deg);\n    opacity: 0;\n  }\n\n  to {\n    -webkit-transform-origin: left bottom;\n    transform-origin: left bottom;\n    -webkit-transform: none;\n    transform: none;\n    opacity: 1;\n  }\n}\n\n.rotateInDownLeft {\n  -webkit-animation-name: rotateInDownLeft;\n  animation-name: rotateInDownLeft;\n}\n\n@-webkit-keyframes rotateInDownRight {\n  from {\n    -webkit-transform-origin: right bottom;\n    transform-origin: right bottom;\n    -webkit-transform: rotate3d(0, 0, 1, 45deg);\n    transform: rotate3d(0, 0, 1, 45deg);\n    opacity: 0;\n  }\n\n  to {\n    -webkit-transform-origin: right bottom;\n    transform-origin: right bottom;\n    -webkit-transform: none;\n    transform: none;\n    opacity: 1;\n  }\n}\n\n@keyframes rotateInDownRight {\n  from {\n    -webkit-transform-origin: right bottom;\n    transform-origin: right bottom;\n    -webkit-transform: rotate3d(0, 0, 1, 45deg);\n    transform: rotate3d(0, 0, 1, 45deg);\n    opacity: 0;\n  }\n\n  to {\n    -webkit-transform-origin: right bottom;\n    transform-origin: right bottom;\n    -webkit-transform: none;\n    transform: none;\n    opacity: 1;\n  }\n}\n\n.rotateInDownRight {\n  -webkit-animation-name: rotateInDownRight;\n  animation-name: rotateInDownRight;\n}\n\n@-webkit-keyframes rotateInUpLeft {\n  from {\n    -webkit-transform-origin: left bottom;\n    transform-origin: left bottom;\n    -webkit-transform: rotate3d(0, 0, 1, 45deg);\n    transform: rotate3d(0, 0, 1, 45deg);\n    opacity: 0;\n  }\n\n  to {\n    -webkit-transform-origin: left bottom;\n    transform-origin: left bottom;\n    -webkit-transform: none;\n    transform: none;\n    opacity: 1;\n  }\n}\n\n@keyframes rotateInUpLeft {\n  from {\n    -webkit-transform-origin: left bottom;\n    transform-origin: left bottom;\n    -webkit-transform: rotate3d(0, 0, 1, 45deg);\n    transform: rotate3d(0, 0, 1, 45deg);\n    opacity: 0;\n  }\n\n  to {\n    -webkit-transform-origin: left bottom;\n    transform-origin: left bottom;\n    -webkit-transform: none;\n    transform: none;\n    opacity: 1;\n  }\n}\n\n.rotateInUpLeft {\n  -webkit-animation-name: rotateInUpLeft;\n  animation-name: rotateInUpLeft;\n}\n\n@-webkit-keyframes rotateInUpRight {\n  from {\n    -webkit-transform-origin: right bottom;\n    transform-origin: right bottom;\n    -webkit-transform: rotate3d(0, 0, 1, -90deg);\n    transform: rotate3d(0, 0, 1, -90deg);\n    opacity: 0;\n  }\n\n  to {\n    -webkit-transform-origin: right bottom;\n    transform-origin: right bottom;\n    -webkit-transform: none;\n    transform: none;\n    opacity: 1;\n  }\n}\n\n@keyframes rotateInUpRight {\n  from {\n    -webkit-transform-origin: right bottom;\n    transform-origin: right bottom;\n    -webkit-transform: rotate3d(0, 0, 1, -90deg);\n    transform: rotate3d(0, 0, 1, -90deg);\n    opacity: 0;\n  }\n\n  to {\n    -webkit-transform-origin: right bottom;\n    transform-origin: right bottom;\n    -webkit-transform: none;\n    transform: none;\n    opacity: 1;\n  }\n}\n\n.rotateInUpRight {\n  -webkit-animation-name: rotateInUpRight;\n  animation-name: rotateInUpRight;\n}\n\n@-webkit-keyframes rotateOut {\n  from {\n    -webkit-transform-origin: center;\n    transform-origin: center;\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform-origin: center;\n    transform-origin: center;\n    -webkit-transform: rotate3d(0, 0, 1, 200deg);\n    transform: rotate3d(0, 0, 1, 200deg);\n    opacity: 0;\n  }\n}\n\n@keyframes rotateOut {\n  from {\n    -webkit-transform-origin: center;\n    transform-origin: center;\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform-origin: center;\n    transform-origin: center;\n    -webkit-transform: rotate3d(0, 0, 1, 200deg);\n    transform: rotate3d(0, 0, 1, 200deg);\n    opacity: 0;\n  }\n}\n\n.rotateOut {\n  -webkit-animation-name: rotateOut;\n  animation-name: rotateOut;\n}\n\n@-webkit-keyframes rotateOutDownLeft {\n  from {\n    -webkit-transform-origin: left bottom;\n    transform-origin: left bottom;\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform-origin: left bottom;\n    transform-origin: left bottom;\n    -webkit-transform: rotate3d(0, 0, 1, 45deg);\n    transform: rotate3d(0, 0, 1, 45deg);\n    opacity: 0;\n  }\n}\n\n@keyframes rotateOutDownLeft {\n  from {\n    -webkit-transform-origin: left bottom;\n    transform-origin: left bottom;\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform-origin: left bottom;\n    transform-origin: left bottom;\n    -webkit-transform: rotate3d(0, 0, 1, 45deg);\n    transform: rotate3d(0, 0, 1, 45deg);\n    opacity: 0;\n  }\n}\n\n.rotateOutDownLeft {\n  -webkit-animation-name: rotateOutDownLeft;\n  animation-name: rotateOutDownLeft;\n}\n\n@-webkit-keyframes rotateOutDownRight {\n  from {\n    -webkit-transform-origin: right bottom;\n    transform-origin: right bottom;\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform-origin: right bottom;\n    transform-origin: right bottom;\n    -webkit-transform: rotate3d(0, 0, 1, -45deg);\n    transform: rotate3d(0, 0, 1, -45deg);\n    opacity: 0;\n  }\n}\n\n@keyframes rotateOutDownRight {\n  from {\n    -webkit-transform-origin: right bottom;\n    transform-origin: right bottom;\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform-origin: right bottom;\n    transform-origin: right bottom;\n    -webkit-transform: rotate3d(0, 0, 1, -45deg);\n    transform: rotate3d(0, 0, 1, -45deg);\n    opacity: 0;\n  }\n}\n\n.rotateOutDownRight {\n  -webkit-animation-name: rotateOutDownRight;\n  animation-name: rotateOutDownRight;\n}\n\n@-webkit-keyframes rotateOutUpLeft {\n  from {\n    -webkit-transform-origin: left bottom;\n    transform-origin: left bottom;\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform-origin: left bottom;\n    transform-origin: left bottom;\n    -webkit-transform: rotate3d(0, 0, 1, -45deg);\n    transform: rotate3d(0, 0, 1, -45deg);\n    opacity: 0;\n  }\n}\n\n@keyframes rotateOutUpLeft {\n  from {\n    -webkit-transform-origin: left bottom;\n    transform-origin: left bottom;\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform-origin: left bottom;\n    transform-origin: left bottom;\n    -webkit-transform: rotate3d(0, 0, 1, -45deg);\n    transform: rotate3d(0, 0, 1, -45deg);\n    opacity: 0;\n  }\n}\n\n.rotateOutUpLeft {\n  -webkit-animation-name: rotateOutUpLeft;\n  animation-name: rotateOutUpLeft;\n}\n\n@-webkit-keyframes rotateOutUpRight {\n  from {\n    -webkit-transform-origin: right bottom;\n    transform-origin: right bottom;\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform-origin: right bottom;\n    transform-origin: right bottom;\n    -webkit-transform: rotate3d(0, 0, 1, 90deg);\n    transform: rotate3d(0, 0, 1, 90deg);\n    opacity: 0;\n  }\n}\n\n@keyframes rotateOutUpRight {\n  from {\n    -webkit-transform-origin: right bottom;\n    transform-origin: right bottom;\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform-origin: right bottom;\n    transform-origin: right bottom;\n    -webkit-transform: rotate3d(0, 0, 1, 90deg);\n    transform: rotate3d(0, 0, 1, 90deg);\n    opacity: 0;\n  }\n}\n\n.rotateOutUpRight {\n  -webkit-animation-name: rotateOutUpRight;\n  animation-name: rotateOutUpRight;\n}\n\n@-webkit-keyframes hinge {\n  0% {\n    -webkit-transform-origin: top left;\n    transform-origin: top left;\n    -webkit-animation-timing-function: ease-in-out;\n    animation-timing-function: ease-in-out;\n  }\n\n  20%, 60% {\n    -webkit-transform: rotate3d(0, 0, 1, 80deg);\n    transform: rotate3d(0, 0, 1, 80deg);\n    -webkit-transform-origin: top left;\n    transform-origin: top left;\n    -webkit-animation-timing-function: ease-in-out;\n    animation-timing-function: ease-in-out;\n  }\n\n  40%, 80% {\n    -webkit-transform: rotate3d(0, 0, 1, 60deg);\n    transform: rotate3d(0, 0, 1, 60deg);\n    -webkit-transform-origin: top left;\n    transform-origin: top left;\n    -webkit-animation-timing-function: ease-in-out;\n    animation-timing-function: ease-in-out;\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform: translate3d(0, 700px, 0);\n    transform: translate3d(0, 700px, 0);\n    opacity: 0;\n  }\n}\n\n@keyframes hinge {\n  0% {\n    -webkit-transform-origin: top left;\n    transform-origin: top left;\n    -webkit-animation-timing-function: ease-in-out;\n    animation-timing-function: ease-in-out;\n  }\n\n  20%, 60% {\n    -webkit-transform: rotate3d(0, 0, 1, 80deg);\n    transform: rotate3d(0, 0, 1, 80deg);\n    -webkit-transform-origin: top left;\n    transform-origin: top left;\n    -webkit-animation-timing-function: ease-in-out;\n    animation-timing-function: ease-in-out;\n  }\n\n  40%, 80% {\n    -webkit-transform: rotate3d(0, 0, 1, 60deg);\n    transform: rotate3d(0, 0, 1, 60deg);\n    -webkit-transform-origin: top left;\n    transform-origin: top left;\n    -webkit-animation-timing-function: ease-in-out;\n    animation-timing-function: ease-in-out;\n    opacity: 1;\n  }\n\n  to {\n    -webkit-transform: translate3d(0, 700px, 0);\n    transform: translate3d(0, 700px, 0);\n    opacity: 0;\n  }\n}\n\n.hinge {\n  -webkit-animation-name: hinge;\n  animation-name: hinge;\n}\n\n/* originally authored by Nick Pettit - https://github.com/nickpettit/glide */\n\n@-webkit-keyframes rollIn {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(-100%, 0, 0) rotate3d(0, 0, 1, -120deg);\n    transform: translate3d(-100%, 0, 0) rotate3d(0, 0, 1, -120deg);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n@keyframes rollIn {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(-100%, 0, 0) rotate3d(0, 0, 1, -120deg);\n    transform: translate3d(-100%, 0, 0) rotate3d(0, 0, 1, -120deg);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n\n.rollIn {\n  -webkit-animation-name: rollIn;\n  animation-name: rollIn;\n}\n\n/* originally authored by Nick Pettit - https://github.com/nickpettit/glide */\n\n@-webkit-keyframes rollOut {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(100%, 0, 0) rotate3d(0, 0, 1, 120deg);\n    transform: translate3d(100%, 0, 0) rotate3d(0, 0, 1, 120deg);\n  }\n}\n\n@keyframes rollOut {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: translate3d(100%, 0, 0) rotate3d(0, 0, 1, 120deg);\n    transform: translate3d(100%, 0, 0) rotate3d(0, 0, 1, 120deg);\n  }\n}\n\n.rollOut {\n  -webkit-animation-name: rollOut;\n  animation-name: rollOut;\n}\n\n@-webkit-keyframes zoomIn {\n  from {\n    opacity: 0;\n    -webkit-transform: scale3d(.3, .3, .3);\n    transform: scale3d(.3, .3, .3);\n  }\n\n  50% {\n    opacity: 1;\n  }\n}\n\n@keyframes zoomIn {\n  from {\n    opacity: 0;\n    -webkit-transform: scale3d(.3, .3, .3);\n    transform: scale3d(.3, .3, .3);\n  }\n\n  50% {\n    opacity: 1;\n  }\n}\n\n.zoomIn {\n  -webkit-animation-name: zoomIn;\n  animation-name: zoomIn;\n}\n\n@-webkit-keyframes zoomInDown {\n  from {\n    opacity: 0;\n    -webkit-transform: scale3d(.1, .1, .1) translate3d(0, -1000px, 0);\n    transform: scale3d(.1, .1, .1) translate3d(0, -1000px, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n    animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0);\n    transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n    animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n  }\n}\n\n@keyframes zoomInDown {\n  from {\n    opacity: 0;\n    -webkit-transform: scale3d(.1, .1, .1) translate3d(0, -1000px, 0);\n    transform: scale3d(.1, .1, .1) translate3d(0, -1000px, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n    animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0);\n    transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n    animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n  }\n}\n\n.zoomInDown {\n  -webkit-animation-name: zoomInDown;\n  animation-name: zoomInDown;\n}\n\n@-webkit-keyframes zoomInLeft {\n  from {\n    opacity: 0;\n    -webkit-transform: scale3d(.1, .1, .1) translate3d(-1000px, 0, 0);\n    transform: scale3d(.1, .1, .1) translate3d(-1000px, 0, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n    animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: scale3d(.475, .475, .475) translate3d(10px, 0, 0);\n    transform: scale3d(.475, .475, .475) translate3d(10px, 0, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n    animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n  }\n}\n\n@keyframes zoomInLeft {\n  from {\n    opacity: 0;\n    -webkit-transform: scale3d(.1, .1, .1) translate3d(-1000px, 0, 0);\n    transform: scale3d(.1, .1, .1) translate3d(-1000px, 0, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n    animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: scale3d(.475, .475, .475) translate3d(10px, 0, 0);\n    transform: scale3d(.475, .475, .475) translate3d(10px, 0, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n    animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n  }\n}\n\n.zoomInLeft {\n  -webkit-animation-name: zoomInLeft;\n  animation-name: zoomInLeft;\n}\n\n@-webkit-keyframes zoomInRight {\n  from {\n    opacity: 0;\n    -webkit-transform: scale3d(.1, .1, .1) translate3d(1000px, 0, 0);\n    transform: scale3d(.1, .1, .1) translate3d(1000px, 0, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n    animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: scale3d(.475, .475, .475) translate3d(-10px, 0, 0);\n    transform: scale3d(.475, .475, .475) translate3d(-10px, 0, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n    animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n  }\n}\n\n@keyframes zoomInRight {\n  from {\n    opacity: 0;\n    -webkit-transform: scale3d(.1, .1, .1) translate3d(1000px, 0, 0);\n    transform: scale3d(.1, .1, .1) translate3d(1000px, 0, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n    animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: scale3d(.475, .475, .475) translate3d(-10px, 0, 0);\n    transform: scale3d(.475, .475, .475) translate3d(-10px, 0, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n    animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n  }\n}\n\n.zoomInRight {\n  -webkit-animation-name: zoomInRight;\n  animation-name: zoomInRight;\n}\n\n@-webkit-keyframes zoomInUp {\n  from {\n    opacity: 0;\n    -webkit-transform: scale3d(.1, .1, .1) translate3d(0, 1000px, 0);\n    transform: scale3d(.1, .1, .1) translate3d(0, 1000px, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n    animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0);\n    transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n    animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n  }\n}\n\n@keyframes zoomInUp {\n  from {\n    opacity: 0;\n    -webkit-transform: scale3d(.1, .1, .1) translate3d(0, 1000px, 0);\n    transform: scale3d(.1, .1, .1) translate3d(0, 1000px, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n    animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0);\n    transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n    animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n  }\n}\n\n.zoomInUp {\n  -webkit-animation-name: zoomInUp;\n  animation-name: zoomInUp;\n}\n\n@-webkit-keyframes zoomOut {\n  from {\n    opacity: 1;\n  }\n\n  50% {\n    opacity: 0;\n    -webkit-transform: scale3d(.3, .3, .3);\n    transform: scale3d(.3, .3, .3);\n  }\n\n  to {\n    opacity: 0;\n  }\n}\n\n@keyframes zoomOut {\n  from {\n    opacity: 1;\n  }\n\n  50% {\n    opacity: 0;\n    -webkit-transform: scale3d(.3, .3, .3);\n    transform: scale3d(.3, .3, .3);\n  }\n\n  to {\n    opacity: 0;\n  }\n}\n\n.zoomOut {\n  -webkit-animation-name: zoomOut;\n  animation-name: zoomOut;\n}\n\n@-webkit-keyframes zoomOutDown {\n  40% {\n    opacity: 1;\n    -webkit-transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0);\n    transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n    animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: scale3d(.1, .1, .1) translate3d(0, 2000px, 0);\n    transform: scale3d(.1, .1, .1) translate3d(0, 2000px, 0);\n    -webkit-transform-origin: center bottom;\n    transform-origin: center bottom;\n    -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n    animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n  }\n}\n\n@keyframes zoomOutDown {\n  40% {\n    opacity: 1;\n    -webkit-transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0);\n    transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n    animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: scale3d(.1, .1, .1) translate3d(0, 2000px, 0);\n    transform: scale3d(.1, .1, .1) translate3d(0, 2000px, 0);\n    -webkit-transform-origin: center bottom;\n    transform-origin: center bottom;\n    -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n    animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n  }\n}\n\n.zoomOutDown {\n  -webkit-animation-name: zoomOutDown;\n  animation-name: zoomOutDown;\n}\n\n@-webkit-keyframes zoomOutLeft {\n  40% {\n    opacity: 1;\n    -webkit-transform: scale3d(.475, .475, .475) translate3d(42px, 0, 0);\n    transform: scale3d(.475, .475, .475) translate3d(42px, 0, 0);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: scale(.1) translate3d(-2000px, 0, 0);\n    transform: scale(.1) translate3d(-2000px, 0, 0);\n    -webkit-transform-origin: left center;\n    transform-origin: left center;\n  }\n}\n\n@keyframes zoomOutLeft {\n  40% {\n    opacity: 1;\n    -webkit-transform: scale3d(.475, .475, .475) translate3d(42px, 0, 0);\n    transform: scale3d(.475, .475, .475) translate3d(42px, 0, 0);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: scale(.1) translate3d(-2000px, 0, 0);\n    transform: scale(.1) translate3d(-2000px, 0, 0);\n    -webkit-transform-origin: left center;\n    transform-origin: left center;\n  }\n}\n\n.zoomOutLeft {\n  -webkit-animation-name: zoomOutLeft;\n  animation-name: zoomOutLeft;\n}\n\n@-webkit-keyframes zoomOutRight {\n  40% {\n    opacity: 1;\n    -webkit-transform: scale3d(.475, .475, .475) translate3d(-42px, 0, 0);\n    transform: scale3d(.475, .475, .475) translate3d(-42px, 0, 0);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: scale(.1) translate3d(2000px, 0, 0);\n    transform: scale(.1) translate3d(2000px, 0, 0);\n    -webkit-transform-origin: right center;\n    transform-origin: right center;\n  }\n}\n\n@keyframes zoomOutRight {\n  40% {\n    opacity: 1;\n    -webkit-transform: scale3d(.475, .475, .475) translate3d(-42px, 0, 0);\n    transform: scale3d(.475, .475, .475) translate3d(-42px, 0, 0);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: scale(.1) translate3d(2000px, 0, 0);\n    transform: scale(.1) translate3d(2000px, 0, 0);\n    -webkit-transform-origin: right center;\n    transform-origin: right center;\n  }\n}\n\n.zoomOutRight {\n  -webkit-animation-name: zoomOutRight;\n  animation-name: zoomOutRight;\n}\n\n@-webkit-keyframes zoomOutUp {\n  40% {\n    opacity: 1;\n    -webkit-transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0);\n    transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n    animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: scale3d(.1, .1, .1) translate3d(0, -2000px, 0);\n    transform: scale3d(.1, .1, .1) translate3d(0, -2000px, 0);\n    -webkit-transform-origin: center bottom;\n    transform-origin: center bottom;\n    -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n    animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n  }\n}\n\n@keyframes zoomOutUp {\n  40% {\n    opacity: 1;\n    -webkit-transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0);\n    transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0);\n    -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n    animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);\n  }\n\n  to {\n    opacity: 0;\n    -webkit-transform: scale3d(.1, .1, .1) translate3d(0, -2000px, 0);\n    transform: scale3d(.1, .1, .1) translate3d(0, -2000px, 0);\n    -webkit-transform-origin: center bottom;\n    transform-origin: center bottom;\n    -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n    animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);\n  }\n}\n\n.zoomOutUp {\n  -webkit-animation-name: zoomOutUp;\n  animation-name: zoomOutUp;\n}\n\n@-webkit-keyframes slideInDown {\n  from {\n    -webkit-transform: translate3d(0, -100%, 0);\n    transform: translate3d(0, -100%, 0);\n    visibility: visible;\n  }\n\n  to {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n@keyframes slideInDown {\n  from {\n    -webkit-transform: translate3d(0, -100%, 0);\n    transform: translate3d(0, -100%, 0);\n    visibility: visible;\n  }\n\n  to {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n.slideInDown {\n  -webkit-animation-name: slideInDown;\n  animation-name: slideInDown;\n}\n\n@-webkit-keyframes slideInLeft {\n  from {\n    -webkit-transform: translate3d(-100%, 0, 0);\n    transform: translate3d(-100%, 0, 0);\n    visibility: visible;\n  }\n\n  to {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n@keyframes slideInLeft {\n  from {\n    -webkit-transform: translate3d(-100%, 0, 0);\n    transform: translate3d(-100%, 0, 0);\n    visibility: visible;\n  }\n\n  to {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n.slideInLeft {\n  -webkit-animation-name: slideInLeft;\n  animation-name: slideInLeft;\n}\n\n@-webkit-keyframes slideInRight {\n  from {\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0);\n    visibility: visible;\n  }\n\n  to {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n@keyframes slideInRight {\n  from {\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0);\n    visibility: visible;\n  }\n\n  to {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n.slideInRight {\n  -webkit-animation-name: slideInRight;\n  animation-name: slideInRight;\n}\n\n@-webkit-keyframes slideInUp {\n  from {\n    -webkit-transform: translate3d(0, 100%, 0);\n    transform: translate3d(0, 100%, 0);\n    visibility: visible;\n  }\n\n  to {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n@keyframes slideInUp {\n  from {\n    -webkit-transform: translate3d(0, 100%, 0);\n    transform: translate3d(0, 100%, 0);\n    visibility: visible;\n  }\n\n  to {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n.slideInUp {\n  -webkit-animation-name: slideInUp;\n  animation-name: slideInUp;\n}\n\n@-webkit-keyframes slideOutDown {\n  from {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n\n  to {\n    visibility: hidden;\n    -webkit-transform: translate3d(0, 100%, 0);\n    transform: translate3d(0, 100%, 0);\n  }\n}\n\n@keyframes slideOutDown {\n  from {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n\n  to {\n    visibility: hidden;\n    -webkit-transform: translate3d(0, 100%, 0);\n    transform: translate3d(0, 100%, 0);\n  }\n}\n\n.slideOutDown {\n  -webkit-animation-name: slideOutDown;\n  animation-name: slideOutDown;\n}\n\n@-webkit-keyframes slideOutLeft {\n  from {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n\n  to {\n    visibility: hidden;\n    -webkit-transform: translate3d(-100%, 0, 0);\n    transform: translate3d(-100%, 0, 0);\n  }\n}\n\n@keyframes slideOutLeft {\n  from {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n\n  to {\n    visibility: hidden;\n    -webkit-transform: translate3d(-100%, 0, 0);\n    transform: translate3d(-100%, 0, 0);\n  }\n}\n\n.slideOutLeft {\n  -webkit-animation-name: slideOutLeft;\n  animation-name: slideOutLeft;\n}\n\n@-webkit-keyframes slideOutRight {\n  from {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n\n  to {\n    visibility: hidden;\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0);\n  }\n}\n\n@keyframes slideOutRight {\n  from {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n\n  to {\n    visibility: hidden;\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0);\n  }\n}\n\n.slideOutRight {\n  -webkit-animation-name: slideOutRight;\n  animation-name: slideOutRight;\n}\n\n@-webkit-keyframes slideOutUp {\n  from {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n\n  to {\n    visibility: hidden;\n    -webkit-transform: translate3d(0, -100%, 0);\n    transform: translate3d(0, -100%, 0);\n  }\n}\n\n@keyframes slideOutUp {\n  from {\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n\n  to {\n    visibility: hidden;\n    -webkit-transform: translate3d(0, -100%, 0);\n    transform: translate3d(0, -100%, 0);\n  }\n}\n\n.slideOutUp {\n  -webkit-animation-name: slideOutUp;\n  animation-name: slideOutUp;\n}\n",undefined);

var Popup = function (a$$1) { return div({
    class: 'popup',
    oncreate: function (e) {
      index_min('fadeIn fadeOut')(e).then(function (_) { return a$$1.setPopupVisible(false); });
    }
  }, [
    $icon('#check'),
    span('Added to Queue') ]); };

var playPage = function (s,a) { return h('combined-page', {}, [
    s.track.id && Player$1(s,a),
    Search$1(s,a),
    s.popupVisible && Popup(a) ]); };

var lostPage = function (s,a) { return h('h1', { onclick: function (e) { return a.router.go('/'); } },
    ("Back to " + (location.hostname))
  ); };

(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    };

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue+','+value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    var this$1 = this;

    for (var name in this$1.map) {
      if (this$1.map.hasOwnProperty(name)) {
        callback.call(thisArg, this$1.map[name], name, this$1);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) { items.push(name); });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) { items.push(value); });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) { items.push([name, value]); });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'omit';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  };

  function decode(body) {
    var form = new FormData();
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=');
        var name = split.shift().replace(/\+/g, ' ');
        var value = split.join('=').replace(/\+/g, ' ');
        form.append(decodeURIComponent(name), decodeURIComponent(value));
      }
    });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    rawHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = 'status' in options ? options.status : 200;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);
      var xhr = new XMLHttpRequest();

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  };
  self.fetch.polyfill = true;
})(typeof self !== 'undefined' ? self : window);

__$styleInject("html {\n  font-family: sans-serif;\n  font-size: calc(10px + 2vmin);\n  background: #121212;\n}\n\nbody,\nbody * {\n  display: block;\n  background: none;\n  -webkit-box-sizing: border-box;\n          box-sizing: border-box;\n  margin: 0;\n  border: 0;\n  padding: 0;\n  outline: 0;\n}\n\nbody,\nnoscript {\n  height: 100vh;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n}\n\nnoscript {\n  width: 100vw;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  font-weight: bold;\n}\n\n.hidden {\n  display: none;\n}\n\nbutton {\n  -ms-touch-action: manipulation;\n      touch-action: manipulation;\n}\n\nsearch- form {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    border: 1px solid rgba(255, 255, 255, 0.25);\n    border-radius: 1rem;\n    margin-bottom: .5rem;\n  }\n\nsearch- input {\n    position: relative;\n    border: 0;\n    padding: 1rem;\n    font-size: 1rem;\n    width: 100%;\n    color: rgba(255,255,255,.8);\n    text-shadow: 0 0 1px rgba(0, 0, 0, 0.25);\n    font-weight: lighter;\n    letter-spacing: .05rem;\n  }\n\nsearch- input::-webkit-input-placeholder {\n      color: rgba(255,255,255,.4);\n    }\n\nsearch- input:-ms-input-placeholder {\n      color: rgba(255,255,255,.4);\n    }\n\nsearch- input::placeholder {\n      color: rgba(255,255,255,.4);\n    }\n\nsearch- svg {\n    fill: rgba(255, 255, 255, 0.4);\n    width: 2rem;\n    height: 2rem;\n    margin-right: 1rem;\n  }\n\nsearch- input:focus + svg,\n  search- input:hover + svg {\n    fill: rgba(255, 255, 255, 0.5);\n  }\n\nsearch- .search-results {\n    padding: 1rem;\n  }\n\nsearch- .search-results > *+* { margin-top: 1rem; }\n\nsearch- .search-results:empty {\n      min-height: 90vh;\n    }\n\nsearch- .search-results a {\n      position: relative;\n      height: 10rem;\n      overflow: hidden;\n      background: #000;\n      cursor: pointer;\n    }\n\nsearch- .search-results a:hover img {\n        -webkit-transform: scale(2.2);\n                transform: scale(2.2);\n      }\n\nsearch- .search-results a img {\n        width: 100%;\n        height: 100%;\n        -o-object-fit: cover;\n           object-fit: cover;\n        opacity: 0.2;\n        -webkit-transform: scale(2);\n                transform: scale(2);\n        -webkit-transition: -webkit-transform 10s ease-out;\n        transition: -webkit-transform 10s ease-out;\n        transition: transform 10s ease-out;\n        transition: transform 10s ease-out, -webkit-transform 10s ease-out;\n      }\n\nsearch- .search-results a title- {\n        position: absolute;;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        padding: 2rem;\n        display: -webkit-box;\n        display: -ms-flexbox;\n        display: flex;\n        -webkit-box-align: center;\n            -ms-flex-align: center;\n                align-items: center;\n        -webkit-box-pack: center;\n            -ms-flex-pack: center;\n                justify-content: center;\n        text-align: center;\n        text-transform: uppercase;\n        font-size: .75rem;\n        font-weight: lighter;\n        letter-spacing: .1rem;\n        line-height: 150%;\n        word-break: break-word;\n        color: rgba(255,255,255,.5);\n      }\n\nsearch- .spinner {\n    margin-top: 2rem;\n    opacity: 0.25;\n  }\n\nplayer- {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  width: 100%;\n  height: 100vh;\n  padding: 2rem;\n  overflow: hidden;\n}\n\nplayer- progress- {\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n  }\n\nplayer- progress- bar- {\n      width: 100vw;\n      height: 1rem;\n      background: rgba(255,255,255, 0.025);\n    }\n\nplayer- img {\n    position: fixed;\n    width: 100%;\n    height: 100%;\n    top: 0;\n    left: 0;\n    -o-object-fit: cover;\n       object-fit: cover;\n    -webkit-filter: blur(1rem) brightness(0.3);\n            filter: blur(1rem) brightness(0.3);\n    -webkit-transform: scale(2);\n            transform: scale(2);\n    -webkit-transition: -webkit-filter 1s, -webkit-transform 4s ease-out;\n    transition: -webkit-filter 1s, -webkit-transform 4s ease-out;\n    transition: filter 1s, transform 4s ease-out;\n    transition: filter 1s, transform 4s ease-out, -webkit-filter 1s, -webkit-transform 4s ease-out;\n  }\n\nplayer- title-,\n  player- controls-,\n  player- time-,\n  player- loading-,\n  player- .search {\n    opacity: 0;\n    -webkit-transition: opacity .4s;\n    transition: opacity .4s;\n  }\n\nplayer- time-,\n  player- loading- {\n    position: relative;\n    text-align: center;\n    color: rgba(255,255,255,.25);\n    letter-spacing: .1rem;\n    font-weight: lighter;\n  }\n\n@media (max-height: 370px) {\n\nplayer- time-,\n  player- loading- {\n      display: none\n  }\n    }\n\nplayer-.focus loading- {\n    -webkit-animation: blink 1s infinite;\n            animation: blink 1s infinite;\n  }\n\nplayer-.focus img {\n      -webkit-filter: blur(1rem) brightness(0.7);\n              filter: blur(1rem) brightness(0.7);\n      -webkit-transform: scale(2.5);\n              transform: scale(2.5);\n    }\n\nplayer-.focus title-,\n    player-.focus controls-,\n    player-.focus time-,\n    player-.focus loading-,\n    player-.focus .search { opacity: 1; }\n\nplayer- title- {\n    -webkit-transition: opacity .5s;\n    transition: opacity .5s;\n    position: relative;\n    text-align: center;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    margin: auto;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    color: rgba(255, 255, 255, 0.5);\n    text-align: center;\n    text-transform: uppercase;\n    font-size: 1.38rem;\n    font-weight: lighter;\n    letter-spacing: .162rem;\n    line-height: 162%;\n    word-break: break-word;\n    max-width: 38ex;\n  }\n\nplayer- controls- {\n    width: 100%;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    margin-top: 1rem;\n\n  }\n\n@media (max-height: 370px) {\n\nplayer- controls- {\n      margin-top: 0\n\n  }\n    }\n\nplayer- controls- button {\n      opacity: .5;\n    }\n\nplayer- controls- button[disabled] { opacity: .25; }\n\nplayer- controls- button.error svg:nth-child(2),\n        player- controls- button.error svg:nth-child(3) {\n          display: none;\n        }\n\nplayer- controls- button.pause svg:nth-child(1),\n        player- controls- button.pause svg:nth-child(3) {\n          display: none;\n        }\n\nplayer- controls- button.play svg:nth-child(1),\n        player- controls- button.play svg:nth-child(2) {\n          display: none;\n        }\n\nplayer- controls- button:not([disabled]):hover {\n        opacity: .75;\n        -webkit-transform: scale(1.1);\n                transform: scale(1.1);\n      }\n\nplayer- controls- button:nth-child(3) svg {\n        width: 5rem;\n        height: 5rem;\n      }\n\nplayer- controls- button svg {\n        fill: white;\n        width: 2.5rem;\n        height: 2.5rem;\n      }\n\nplayer- .spinner {\n    opacity: .25;\n  }\n\nplayer- button.search {\n    position: relative;\n    width: 15rem;\n    font-size: .75rem;\n    color: rgba(255,255,255,.25);\n    text-transform: uppercase;\n    border: 1px solid rgba(255,255,255,.25);\n    padding: .5rem 2rem;\n    margin: 1rem auto 0;\n    border-radius: 3rem;\n  }\n\nplayer- button.search:hover {\n      color: rgba(255,255,255,.5);\n      border: 1px solid rgba(255,255,255,.5);\n    }\n\n@media (max-height: 480px) {\n\nplayer- button.search {\n      display: none\n  }\n    }\n\ncombined-page {\n  position: relative;\n  width: 100%;\n}\n\ncombined-page search- {\n    position: relative;\n    margin-top: 25vh;\n    max-width: 25rem;\n    margin-left: auto;\n    margin-right: auto;\n    padding: 1rem;\n    margin-bottom: 1rem;\n  }\n\ncombined-page player- + search- {\n    margin-top: 100vh;\n  }\n\ncombined-page player- {\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100vh;\n    -webkit-transition: height .3s;\n    transition: height .3s;\n  }\n\n\naudio {\n  width: 100%;\n  bottom: 0;\n  left: 0;\n  position: fixed;\n  padding-top: 25px;\n}\n\nsvg#sheet {\n  display: none;\n}\n\n@-webkit-keyframes blink {\n  0% { opacity: 0 }\n  50% { opacity: 1 }\n  100% { opacity: 0 }\n}\n\n@keyframes blink {\n  0% { opacity: 0 }\n  50% { opacity: 1 }\n  100% { opacity: 0 }\n}\n",undefined);

__$styleInject(".spinner {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  margin: 0 auto;\n  width: 5rem;\n  height: 3rem;\n  text-align: center;\n  font-size: 1rem;\n}\n\n.spinner > *+* {\n  margin-left: 2px;\n}\n\n.spinner > div {\n  background-color: rgba(255,255,255,.5);\n  height: 100%;\n  width: 16%;\n  display: inline-block;\n\n  -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;\n  animation: sk-stretchdelay 1.2s infinite ease-in-out;\n}\n\n.spinner .rect2 {\n  -webkit-animation-delay: -1.1s;\n  animation-delay: -1.1s;\n}\n\n.spinner .rect3 {\n  -webkit-animation-delay: -1.0s;\n  animation-delay: -1.0s;\n}\n\n.spinner .rect4 {\n  -webkit-animation-delay: -0.9s;\n  animation-delay: -0.9s;\n}\n\n.spinner .rect5 {\n  -webkit-animation-delay: -0.8s;\n  animation-delay: -0.8s;\n}\n\n@-webkit-keyframes sk-stretchdelay {\n  0%, 40%, 100% { -webkit-transform: scaleY(0.4) }\n  20% { -webkit-transform: scaleY(1.0) }\n}\n\n@keyframes sk-stretchdelay {\n  0%, 40%, 100% {\n    transform: scaleY(0.4);\n    -webkit-transform: scaleY(0.4);\n  }  20% {\n    transform: scaleY(1.0);\n    -webkit-transform: scaleY(1.0);\n  }\n}\n",undefined);

__$styleInject(".popup {\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  -webkit-transform: translate(-50%, -50%);\n          transform: translate(-50%, -50%);\n  background: rgba(0, 0, 0, 0.62);\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  width: 10rem;\n  height: 10rem;\n  border-radius: 2rem;\n}\n\n  .popup * {\n    pointer-events: none;\n  }\n\n  .popup svg {\n    height: 5rem;\n    width: 5rem;\n    fill: rgba(255, 255, 255, .8)\n  }\n\n  .popup span {\n    margin-top: .5rem;\n    color: rgba(255, 255, 255, 0.8);\n  }",undefined);

// Check for any github-pages 404 redirect
history.replaceState(null, null, sessionStorage.redirect);
delete sessionStorage.redirect;

// Register service worker if not on localhost
var local = window.location.host.startsWith('localhost');
if ('serviceWorker' in navigator && !local) { navigator.serviceWorker.register('/sw.js'); }

smoothscroll.polyfill();

var url = 'https://api.joextodd.com';

app({
  state: {
    track: {},
    isFetching: true,
  },
  actions: {
    setFetching: function (s,a,d) { return ({ isFetching: d }); },
    setTrack: function (s,a,d) { return ({ track: d }); },
    prevVideo: function (s,a,d) { return window.history.back(); },
    nextVideo: function (s,a,d) {
      if (s.partyId) {
        a.nextQTrack();
      } else {
        a.setFetching(true);
        a.setTrack({ id: s.track.id });
        fetchRelated(s.track.id)
          .then(function (data) { return data.items[parseInt(Math.random() * data.items.length)].id.videoId; })
          .then(function (id) { return a.router.go(("/" + id)); })
          .catch(console.log);
      }
    },
    getVideo: function (s,a,id) {
      a.setError(false);
      a.setFetching(true);
      a.setTrack({ id: id });
      a.setPlaying(!iOS());
      fetch((url + "/video/" + id))
        .then(function (r) { return r.json(); })
        .then(function (track) {
          document.title = track.title;
          a.setTrack(track);
          a.setFetching(false);
        })
        .catch(console.log);
    }
  },
  events: {
    route: function (s,a,d) {
      if (d.match === '/') { s.track.id && scrollToSearch(); }
      if (d.match === '/:id') { a.getVideo(d.params.id); }
      if (d.match === '/party/:pid') {
        a.setPartyId(d.params.pid);
        a.getPartyQ();
      }
    },
  },
  view: [
    ['/', playPage],
    ['/:id', playPage],
    ['/party/:pid', playPage],
    ['*', lostPage] ],
  mixins: [Router, Player, Search, Party],
});

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9oeXBlcmFwcC9zcmMvaC5qcyIsIi4uL25vZGVfbW9kdWxlcy9oeXBlcmFwcC9zcmMvYXBwLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2h5cGVyYXBwL3NyYy9yb3V0ZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvc21vb3Roc2Nyb2xsLXBvbHlmaWxsL2Rpc3Qvc21vb3Roc2Nyb2xsLmpzIiwiLi4vc3JjL21peGlucy9wbGF5ZXIuanMiLCIuLi9zcmMvaGVscGVycy95b3V0dWJlLmpzIiwiLi4vc3JjL21peGlucy9zZWFyY2guanMiLCIuLi9zcmMvbWl4aW5zL3BhcnR5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2h1eS9pbmRleC5qcyIsIi4uL3NyYy9oZWxwZXJzL2VsZW1lbnQuanMiLCIuLi9zcmMvY29tcG9uZW50cy9zZWFyY2guanMiLCIuLi9ub2RlX21vZHVsZXMvdGhyb3R0bGUtZGVib3VuY2UvdGhyb3R0bGUuanMiLCIuLi9zcmMvaGVscGVycy93aW5kb3cuanMiLCIuLi9zcmMvY29tcG9uZW50cy9wbGF5ZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvQGh5cGVyYXBwL2h0bWwvbm9kZV9tb2R1bGVzL2h5cGVyYXBwL3NyYy9oLmpzIiwiLi4vbm9kZV9tb2R1bGVzL0BoeXBlcmFwcC9odG1sL2Rpc3QvaHRtbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9hY3R1YXRlanMvaW5kZXgubWluLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvcG9wdXAuanMiLCIuLi9zcmMvcGFnZXMvcGxheS5qcyIsIi4uL3NyYy9wYWdlcy9sb3N0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0YWcsIGRhdGEpIHtcbiAgdmFyIG5vZGVcbiAgdmFyIHN0YWNrID0gW11cbiAgdmFyIGNoaWxkcmVuID0gW11cblxuICBmb3IgKHZhciBpID0gYXJndW1lbnRzLmxlbmd0aDsgaS0tID4gMjsgKSB7XG4gICAgc3RhY2tbc3RhY2subGVuZ3RoXSA9IGFyZ3VtZW50c1tpXVxuICB9XG5cbiAgd2hpbGUgKHN0YWNrLmxlbmd0aCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KChub2RlID0gc3RhY2sucG9wKCkpKSkge1xuICAgICAgZm9yICh2YXIgaSA9IG5vZGUubGVuZ3RoOyBpLS07ICkge1xuICAgICAgICBzdGFja1tzdGFjay5sZW5ndGhdID0gbm9kZVtpXVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobm9kZSAhPSBudWxsICYmIG5vZGUgIT09IHRydWUgJiYgbm9kZSAhPT0gZmFsc2UpIHtcbiAgICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICBub2RlID0gbm9kZSArIFwiXCJcbiAgICAgIH1cbiAgICAgIGNoaWxkcmVuW2NoaWxkcmVuLmxlbmd0aF0gPSBub2RlXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHR5cGVvZiB0YWcgPT09IFwic3RyaW5nXCJcbiAgICA/IHtcbiAgICAgICAgdGFnOiB0YWcsXG4gICAgICAgIGRhdGE6IGRhdGEgfHwge30sXG4gICAgICAgIGNoaWxkcmVuOiBjaGlsZHJlblxuICAgICAgfVxuICAgIDogdGFnKGRhdGEsIGNoaWxkcmVuKVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYXBwKSB7XG4gIHZhciBzdGF0ZSA9IHt9XG4gIHZhciB2aWV3ID0gYXBwLnZpZXdcbiAgdmFyIGFjdGlvbnMgPSB7fVxuICB2YXIgZXZlbnRzID0ge31cbiAgdmFyIG5vZGVcbiAgdmFyIGVsZW1lbnRcblxuICBmb3IgKHZhciBpID0gLTEsIG1peGlucyA9IGFwcC5taXhpbnMgfHwgW107IGkgPCBtaXhpbnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbWl4aW4gPSBtaXhpbnNbaV0gPyBtaXhpbnNbaV0oYXBwKSA6IGFwcFxuXG4gICAgaWYgKG1peGluLm1peGlucyAhPSBudWxsICYmIG1peGluICE9PSBhcHApIHtcbiAgICAgIG1peGlucyA9IG1peGlucy5jb25jYXQobWl4aW4ubWl4aW5zKVxuICAgIH1cblxuICAgIGlmIChtaXhpbi5zdGF0ZSAhPSBudWxsKSB7XG4gICAgICBzdGF0ZSA9IG1lcmdlKHN0YXRlLCBtaXhpbi5zdGF0ZSlcbiAgICB9XG5cbiAgICBpbml0KGFjdGlvbnMsIG1peGluLmFjdGlvbnMpXG5cbiAgICBPYmplY3Qua2V5cyhtaXhpbi5ldmVudHMgfHwgW10pLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIGV2ZW50c1trZXldID0gKGV2ZW50c1trZXldIHx8IFtdKS5jb25jYXQobWl4aW4uZXZlbnRzW2tleV0pXG4gICAgfSlcbiAgfVxuXG4gIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlWzBdICE9PSBcImxcIikge1xuICAgIGxvYWQoKVxuICB9IGVsc2Uge1xuICAgIGFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGxvYWQpXG4gIH1cblxuICBmdW5jdGlvbiBpbml0KG5hbWVzcGFjZSwgY2hpbGRyZW4sIGxhc3ROYW1lKSB7XG4gICAgT2JqZWN0LmtleXMoY2hpbGRyZW4gfHwgW10pLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHZhciBhY3Rpb24gPSBjaGlsZHJlbltrZXldXG4gICAgICB2YXIgbmFtZSA9IGxhc3ROYW1lID8gbGFzdE5hbWUgKyBcIi5cIiArIGtleSA6IGtleVxuXG4gICAgICBpZiAodHlwZW9mIGFjdGlvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIG5hbWVzcGFjZVtrZXldID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSBhY3Rpb24oXG4gICAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgICAgIGFjdGlvbnMsXG4gICAgICAgICAgICBlbWl0KFwiYWN0aW9uXCIsIHtcbiAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgfSkuZGF0YSxcbiAgICAgICAgICAgIGVtaXRcbiAgICAgICAgICApXG5cbiAgICAgICAgICBpZiAocmVzdWx0ID09IG51bGwgfHwgdHlwZW9mIHJlc3VsdC50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZW5kZXIoKHN0YXRlID0gbWVyZ2Uoc3RhdGUsIGVtaXQoXCJ1cGRhdGVcIiwgcmVzdWx0KSkpLCB2aWV3KVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbml0KG5hbWVzcGFjZVtrZXldIHx8IChuYW1lc3BhY2Vba2V5XSA9IHt9KSwgYWN0aW9uLCBuYW1lKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBsb2FkKCkge1xuICAgIHJlbmRlcihzdGF0ZSwgdmlldylcbiAgICBlbWl0KFwibG9hZGVkXCIpXG4gIH1cblxuICBmdW5jdGlvbiBlbWl0KG5hbWUsIGRhdGEpIHtcbiAgICA7KGV2ZW50c1tuYW1lXSB8fCBbXSkubWFwKGZ1bmN0aW9uKGNiKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gY2Ioc3RhdGUsIGFjdGlvbnMsIGRhdGEsIGVtaXQpXG4gICAgICBpZiAocmVzdWx0ICE9IG51bGwpIHtcbiAgICAgICAgZGF0YSA9IHJlc3VsdFxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gZGF0YVxuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyKHN0YXRlLCB2aWV3KSB7XG4gICAgZWxlbWVudCA9IHBhdGNoKFxuICAgICAgYXBwLnJvb3QgfHwgKGFwcC5yb290ID0gZG9jdW1lbnQuYm9keSksXG4gICAgICBlbGVtZW50LFxuICAgICAgbm9kZSxcbiAgICAgIChub2RlID0gZW1pdChcInJlbmRlclwiLCB2aWV3KShzdGF0ZSwgYWN0aW9ucykpXG4gICAgKVxuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2UoYSwgYikge1xuICAgIHZhciBvYmogPSB7fVxuXG4gICAgaWYgKHR5cGVvZiBiICE9PSBcIm9iamVjdFwiIHx8IEFycmF5LmlzQXJyYXkoYikpIHtcbiAgICAgIHJldHVybiBiXG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSBpbiBhKSB7XG4gICAgICBvYmpbaV0gPSBhW2ldXG4gICAgfVxuICAgIGZvciAodmFyIGkgaW4gYikge1xuICAgICAgb2JqW2ldID0gYltpXVxuICAgIH1cblxuICAgIHJldHVybiBvYmpcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRGcm9tKG5vZGUsIGlzU1ZHKSB7XG4gICAgaWYgKHR5cGVvZiBub2RlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBlbGVtZW50ID0gKGlzU1ZHID0gaXNTVkcgfHwgbm9kZS50YWcgPT09IFwic3ZnXCIpXG4gICAgICAgID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgbm9kZS50YWcpXG4gICAgICAgIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudChub2RlLnRhZylcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgKSB7XG4gICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlRWxlbWVudEZyb20obm9kZS5jaGlsZHJlbltpKytdLCBpc1NWRykpXG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgaW4gbm9kZS5kYXRhKSB7XG4gICAgICAgIGlmIChpID09PSBcIm9uY3JlYXRlXCIpIHtcbiAgICAgICAgICBub2RlLmRhdGFbaV0oZWxlbWVudClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXRFbGVtZW50RGF0YShlbGVtZW50LCBpLCBub2RlLmRhdGFbaV0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZWxlbWVudFxuICB9XG5cbiAgZnVuY3Rpb24gc2V0RWxlbWVudERhdGEoZWxlbWVudCwgbmFtZSwgdmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgaWYgKG5hbWUgPT09IFwia2V5XCIpIHtcbiAgICB9IGVsc2UgaWYgKG5hbWUgPT09IFwic3R5bGVcIikge1xuICAgICAgZm9yICh2YXIgaSBpbiBtZXJnZShvbGRWYWx1ZSwgKHZhbHVlID0gdmFsdWUgfHwge30pKSkge1xuICAgICAgICBlbGVtZW50LnN0eWxlW2ldID0gdmFsdWVbaV0gfHwgXCJcIlxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0cnkge1xuICAgICAgICBlbGVtZW50W25hbWVdID0gdmFsdWVcbiAgICAgIH0gY2F0Y2ggKF8pIHt9XG5cbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShuYW1lKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlRWxlbWVudERhdGEoZWxlbWVudCwgb2xkRGF0YSwgZGF0YSkge1xuICAgIGZvciAodmFyIG5hbWUgaW4gbWVyZ2Uob2xkRGF0YSwgZGF0YSkpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGRhdGFbbmFtZV1cbiAgICAgIHZhciBvbGRWYWx1ZSA9IG5hbWUgPT09IFwidmFsdWVcIiB8fCBuYW1lID09PSBcImNoZWNrZWRcIlxuICAgICAgICA/IGVsZW1lbnRbbmFtZV1cbiAgICAgICAgOiBvbGREYXRhW25hbWVdXG5cbiAgICAgIGlmIChuYW1lID09PSBcIm9udXBkYXRlXCIgJiYgdmFsdWUpIHtcbiAgICAgICAgdmFsdWUoZWxlbWVudClcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUgIT09IG9sZFZhbHVlKSB7XG4gICAgICAgIHNldEVsZW1lbnREYXRhKGVsZW1lbnQsIG5hbWUsIHZhbHVlLCBvbGRWYWx1ZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZXRLZXlGcm9tKG5vZGUpIHtcbiAgICBpZiAobm9kZSAmJiAobm9kZSA9IG5vZGUuZGF0YSkpIHtcbiAgICAgIHJldHVybiBub2RlLmtleVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZUVsZW1lbnQocGFyZW50LCBlbGVtZW50LCBub2RlKSB7XG4gICAgOygobm9kZS5kYXRhICYmIG5vZGUuZGF0YS5vbnJlbW92ZSkgfHwgcmVtb3ZlQ2hpbGQpKGVsZW1lbnQsIHJlbW92ZUNoaWxkKVxuICAgIGZ1bmN0aW9uIHJlbW92ZUNoaWxkKCkge1xuICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGF0Y2gocGFyZW50LCBlbGVtZW50LCBvbGROb2RlLCBub2RlKSB7XG4gICAgaWYgKG9sZE5vZGUgPT0gbnVsbCkge1xuICAgICAgZWxlbWVudCA9IHBhcmVudC5pbnNlcnRCZWZvcmUoY3JlYXRlRWxlbWVudEZyb20obm9kZSksIGVsZW1lbnQpXG4gICAgfSBlbHNlIGlmIChub2RlLnRhZyAmJiBub2RlLnRhZyA9PT0gb2xkTm9kZS50YWcpIHtcbiAgICAgIHVwZGF0ZUVsZW1lbnREYXRhKGVsZW1lbnQsIG9sZE5vZGUuZGF0YSwgbm9kZS5kYXRhKVxuXG4gICAgICB2YXIgbGVuID0gbm9kZS5jaGlsZHJlbi5sZW5ndGhcbiAgICAgIHZhciBvbGRMZW4gPSBvbGROb2RlLmNoaWxkcmVuLmxlbmd0aFxuICAgICAgdmFyIHJldXNhYmxlQ2hpbGRyZW4gPSB7fVxuICAgICAgdmFyIG9sZEVsZW1lbnRzID0gW11cbiAgICAgIHZhciBuZXdLZXlzID0ge31cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvbGRMZW47IGkrKykge1xuICAgICAgICB2YXIgb2xkRWxlbWVudCA9IGVsZW1lbnQuY2hpbGROb2Rlc1tpXVxuICAgICAgICBvbGRFbGVtZW50c1tpXSA9IG9sZEVsZW1lbnRcblxuICAgICAgICB2YXIgb2xkQ2hpbGQgPSBvbGROb2RlLmNoaWxkcmVuW2ldXG4gICAgICAgIHZhciBvbGRLZXkgPSBnZXRLZXlGcm9tKG9sZENoaWxkKVxuXG4gICAgICAgIGlmIChudWxsICE9IG9sZEtleSkge1xuICAgICAgICAgIHJldXNhYmxlQ2hpbGRyZW5bb2xkS2V5XSA9IFtvbGRFbGVtZW50LCBvbGRDaGlsZF1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgaSA9IDBcbiAgICAgIHZhciBqID0gMFxuXG4gICAgICB3aGlsZSAoaiA8IGxlbikge1xuICAgICAgICB2YXIgb2xkRWxlbWVudCA9IG9sZEVsZW1lbnRzW2ldXG4gICAgICAgIHZhciBvbGRDaGlsZCA9IG9sZE5vZGUuY2hpbGRyZW5baV1cbiAgICAgICAgdmFyIG5ld0NoaWxkID0gbm9kZS5jaGlsZHJlbltqXVxuXG4gICAgICAgIHZhciBvbGRLZXkgPSBnZXRLZXlGcm9tKG9sZENoaWxkKVxuICAgICAgICBpZiAobmV3S2V5c1tvbGRLZXldKSB7XG4gICAgICAgICAgaSsrXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBuZXdLZXkgPSBnZXRLZXlGcm9tKG5ld0NoaWxkKVxuXG4gICAgICAgIHZhciByZXVzYWJsZUNoaWxkID0gcmV1c2FibGVDaGlsZHJlbltuZXdLZXldIHx8IFtdXG5cbiAgICAgICAgaWYgKG51bGwgPT0gbmV3S2V5KSB7XG4gICAgICAgICAgaWYgKG51bGwgPT0gb2xkS2V5KSB7XG4gICAgICAgICAgICBwYXRjaChlbGVtZW50LCBvbGRFbGVtZW50LCBvbGRDaGlsZCwgbmV3Q2hpbGQpXG4gICAgICAgICAgICBqKytcbiAgICAgICAgICB9XG4gICAgICAgICAgaSsrXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKG9sZEtleSA9PT0gbmV3S2V5KSB7XG4gICAgICAgICAgICBwYXRjaChlbGVtZW50LCByZXVzYWJsZUNoaWxkWzBdLCByZXVzYWJsZUNoaWxkWzFdLCBuZXdDaGlsZClcbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgIH0gZWxzZSBpZiAocmV1c2FibGVDaGlsZFswXSkge1xuICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUocmV1c2FibGVDaGlsZFswXSwgb2xkRWxlbWVudClcbiAgICAgICAgICAgIHBhdGNoKGVsZW1lbnQsIHJldXNhYmxlQ2hpbGRbMF0sIHJldXNhYmxlQ2hpbGRbMV0sIG5ld0NoaWxkKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXRjaChlbGVtZW50LCBvbGRFbGVtZW50LCBudWxsLCBuZXdDaGlsZClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBqKytcbiAgICAgICAgICBuZXdLZXlzW25ld0tleV0gPSBuZXdDaGlsZFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChpIDwgb2xkTGVuKSB7XG4gICAgICAgIHZhciBvbGRDaGlsZCA9IG9sZE5vZGUuY2hpbGRyZW5baV1cbiAgICAgICAgdmFyIG9sZEtleSA9IGdldEtleUZyb20ob2xkQ2hpbGQpXG4gICAgICAgIGlmIChudWxsID09IG9sZEtleSkge1xuICAgICAgICAgIHJlbW92ZUVsZW1lbnQoZWxlbWVudCwgb2xkRWxlbWVudHNbaV0sIG9sZENoaWxkKVxuICAgICAgICB9XG4gICAgICAgIGkrK1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpIGluIHJldXNhYmxlQ2hpbGRyZW4pIHtcbiAgICAgICAgdmFyIHJldXNhYmxlQ2hpbGQgPSByZXVzYWJsZUNoaWxkcmVuW2ldXG4gICAgICAgIHZhciByZXVzYWJsZU5vZGUgPSByZXVzYWJsZUNoaWxkWzFdXG4gICAgICAgIGlmICghbmV3S2V5c1tyZXVzYWJsZU5vZGUuZGF0YS5rZXldKSB7XG4gICAgICAgICAgcmVtb3ZlRWxlbWVudChlbGVtZW50LCByZXVzYWJsZUNoaWxkWzBdLCByZXVzYWJsZU5vZGUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5vZGUgIT09IG9sZE5vZGUpIHtcbiAgICAgIHZhciBpID0gZWxlbWVudFxuICAgICAgcGFyZW50LnJlcGxhY2VDaGlsZCgoZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnRGcm9tKG5vZGUpKSwgaSlcbiAgICB9XG5cbiAgICByZXR1cm4gZWxlbWVudFxuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhcHAsIHZpZXcpIHtcbiAgcmV0dXJuIHtcbiAgICBzdGF0ZToge1xuICAgICAgcm91dGVyOiBtYXRjaChsb2NhdGlvbi5wYXRobmFtZSlcbiAgICB9LFxuICAgIGFjdGlvbnM6IHtcbiAgICAgIHJvdXRlcjoge1xuICAgICAgICBtYXRjaDogZnVuY3Rpb24oc3RhdGUsIGFjdGlvbnMsIGRhdGEsIGVtaXQpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcm91dGVyOiBlbWl0KFwicm91dGVcIiwgbWF0Y2goZGF0YSkpXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBnbzogZnVuY3Rpb24oc3RhdGUsIGFjdGlvbnMsIGRhdGEpIHtcbiAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgXCJcIiwgZGF0YSlcbiAgICAgICAgICBhY3Rpb25zLnJvdXRlci5tYXRjaChkYXRhLnNwbGl0KFwiP1wiKVswXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgZXZlbnRzOiB7XG4gICAgICBsb2FkZWQ6IGZ1bmN0aW9uKHN0YXRlLCBhY3Rpb25zKSB7XG4gICAgICAgIG1hdGNoKClcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIG1hdGNoKVxuXG4gICAgICAgIGZ1bmN0aW9uIG1hdGNoKCkge1xuICAgICAgICAgIGFjdGlvbnMucm91dGVyLm1hdGNoKGxvY2F0aW9uLnBhdGhuYW1lKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHZpZXdcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtYXRjaChkYXRhKSB7XG4gICAgZm9yICh2YXIgbWF0Y2gsIHBhcmFtcyA9IHt9LCBpID0gMCwgbGVuID0gYXBwLnZpZXcubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHZhciByb3V0ZSA9IGFwcC52aWV3W2ldWzBdXG4gICAgICB2YXIga2V5cyA9IFtdXG5cbiAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgZGF0YS5yZXBsYWNlKFxuICAgICAgICAgIFJlZ0V4cChcbiAgICAgICAgICAgIHJvdXRlID09PSBcIipcIlxuICAgICAgICAgICAgICA/IFwiLlwiICsgcm91dGVcbiAgICAgICAgICAgICAgOiBcIl5cIiArXG4gICAgICAgICAgICAgICAgICByb3V0ZVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwvL2csIFwiXFxcXC9cIilcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzooW1xcd10rKS9nLCBmdW5jdGlvbihfLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICBrZXlzLnB1c2goa2V5KVxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcIihbLVxcXFwuXFxcXHddKylcIlxuICAgICAgICAgICAgICAgICAgICB9KSArXG4gICAgICAgICAgICAgICAgICBcIi8/JFwiLFxuICAgICAgICAgICAgXCJnXCJcbiAgICAgICAgICApLFxuICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCBhcmd1bWVudHMubGVuZ3RoIC0gMjsgKSB7XG4gICAgICAgICAgICAgIHBhcmFtc1trZXlzLnNoaWZ0KCldID0gYXJndW1lbnRzW2orK11cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1hdGNoID0gcm91dGVcbiAgICAgICAgICAgIHZpZXcgPSBhcHAudmlld1tpXVsxXVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBtYXRjaDogbWF0Y2gsXG4gICAgICBwYXJhbXM6IHBhcmFtc1xuICAgIH1cbiAgfVxufVxuIiwiLypcbiAqIHNtb290aHNjcm9sbCBwb2x5ZmlsbCAtIHYwLjMuNVxuICogaHR0cHM6Ly9pYW1kdXN0YW4uZ2l0aHViLmlvL3Ntb290aHNjcm9sbFxuICogMjAxNiAoYykgRHVzdGFuIEthc3RlbiwgSmVyZW1pYXMgTWVuaWNoZWxsaSAtIE1JVCBMaWNlbnNlXG4gKi9cblxuKGZ1bmN0aW9uKHcsIGQsIHVuZGVmaW5lZCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLypcbiAgICogYWxpYXNlc1xuICAgKiB3OiB3aW5kb3cgZ2xvYmFsIG9iamVjdFxuICAgKiBkOiBkb2N1bWVudFxuICAgKiB1bmRlZmluZWQ6IHVuZGVmaW5lZFxuICAgKi9cblxuICAvLyBwb2x5ZmlsbFxuICBmdW5jdGlvbiBwb2x5ZmlsbCgpIHtcbiAgICAvLyByZXR1cm4gd2hlbiBzY3JvbGxCZWhhdmlvciBpbnRlcmZhY2UgaXMgc3VwcG9ydGVkXG4gICAgaWYgKCdzY3JvbGxCZWhhdmlvcicgaW4gZC5kb2N1bWVudEVsZW1lbnQuc3R5bGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIGdsb2JhbHNcbiAgICAgKi9cbiAgICB2YXIgRWxlbWVudCA9IHcuSFRNTEVsZW1lbnQgfHwgdy5FbGVtZW50O1xuICAgIHZhciBTQ1JPTExfVElNRSA9IDQ2ODtcblxuICAgIC8qXG4gICAgICogb2JqZWN0IGdhdGhlcmluZyBvcmlnaW5hbCBzY3JvbGwgbWV0aG9kc1xuICAgICAqL1xuICAgIHZhciBvcmlnaW5hbCA9IHtcbiAgICAgIHNjcm9sbDogdy5zY3JvbGwgfHwgdy5zY3JvbGxUbyxcbiAgICAgIHNjcm9sbEJ5OiB3LnNjcm9sbEJ5LFxuICAgICAgZWxTY3JvbGw6IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbCB8fCBzY3JvbGxFbGVtZW50LFxuICAgICAgc2Nyb2xsSW50b1ZpZXc6IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogZGVmaW5lIHRpbWluZyBtZXRob2RcbiAgICAgKi9cbiAgICB2YXIgbm93ID0gdy5wZXJmb3JtYW5jZSAmJiB3LnBlcmZvcm1hbmNlLm5vd1xuICAgICAgPyB3LnBlcmZvcm1hbmNlLm5vdy5iaW5kKHcucGVyZm9ybWFuY2UpIDogRGF0ZS5ub3c7XG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2VzIHNjcm9sbCBwb3NpdGlvbiBpbnNpZGUgYW4gZWxlbWVudFxuICAgICAqIEBtZXRob2Qgc2Nyb2xsRWxlbWVudFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzY3JvbGxFbGVtZW50KHgsIHkpIHtcbiAgICAgIHRoaXMuc2Nyb2xsTGVmdCA9IHg7XG4gICAgICB0aGlzLnNjcm9sbFRvcCA9IHk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyByZXN1bHQgb2YgYXBwbHlpbmcgZWFzZSBtYXRoIGZ1bmN0aW9uIHRvIGEgbnVtYmVyXG4gICAgICogQG1ldGhvZCBlYXNlXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGtcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVhc2Uoaykge1xuICAgICAgcmV0dXJuIDAuNSAqICgxIC0gTWF0aC5jb3MoTWF0aC5QSSAqIGspKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpbmRpY2F0ZXMgaWYgYSBzbW9vdGggYmVoYXZpb3Igc2hvdWxkIGJlIGFwcGxpZWRcbiAgICAgKiBAbWV0aG9kIHNob3VsZEJhaWxPdXRcbiAgICAgKiBAcGFyYW0ge051bWJlcnxPYmplY3R9IHhcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzaG91bGRCYWlsT3V0KHgpIHtcbiAgICAgIGlmICh0eXBlb2YgeCAhPT0gJ29iamVjdCdcbiAgICAgICAgICAgIHx8IHggPT09IG51bGxcbiAgICAgICAgICAgIHx8IHguYmVoYXZpb3IgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgfHwgeC5iZWhhdmlvciA9PT0gJ2F1dG8nXG4gICAgICAgICAgICB8fCB4LmJlaGF2aW9yID09PSAnaW5zdGFudCcpIHtcbiAgICAgICAgLy8gZmlyc3QgYXJnIG5vdCBhbiBvYmplY3QvbnVsbFxuICAgICAgICAvLyBvciBiZWhhdmlvciBpcyBhdXRvLCBpbnN0YW50IG9yIHVuZGVmaW5lZFxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiB4ID09PSAnb2JqZWN0J1xuICAgICAgICAgICAgJiYgeC5iZWhhdmlvciA9PT0gJ3Ntb290aCcpIHtcbiAgICAgICAgLy8gZmlyc3QgYXJndW1lbnQgaXMgYW4gb2JqZWN0IGFuZCBiZWhhdmlvciBpcyBzbW9vdGhcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyB0aHJvdyBlcnJvciB3aGVuIGJlaGF2aW9yIGlzIG5vdCBzdXBwb3J0ZWRcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2JlaGF2aW9yIG5vdCB2YWxpZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGZpbmRzIHNjcm9sbGFibGUgcGFyZW50IG9mIGFuIGVsZW1lbnRcbiAgICAgKiBAbWV0aG9kIGZpbmRTY3JvbGxhYmxlUGFyZW50XG4gICAgICogQHBhcmFtIHtOb2RlfSBlbFxuICAgICAqIEByZXR1cm5zIHtOb2RlfSBlbFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZpbmRTY3JvbGxhYmxlUGFyZW50KGVsKSB7XG4gICAgICB2YXIgaXNCb2R5O1xuICAgICAgdmFyIGhhc1Njcm9sbGFibGVTcGFjZTtcbiAgICAgIHZhciBoYXNWaXNpYmxlT3ZlcmZsb3c7XG5cbiAgICAgIGRvIHtcbiAgICAgICAgZWwgPSBlbC5wYXJlbnROb2RlO1xuXG4gICAgICAgIC8vIHNldCBjb25kaXRpb24gdmFyaWFibGVzXG4gICAgICAgIGlzQm9keSA9IGVsID09PSBkLmJvZHk7XG4gICAgICAgIGhhc1Njcm9sbGFibGVTcGFjZSA9XG4gICAgICAgICAgZWwuY2xpZW50SGVpZ2h0IDwgZWwuc2Nyb2xsSGVpZ2h0IHx8XG4gICAgICAgICAgZWwuY2xpZW50V2lkdGggPCBlbC5zY3JvbGxXaWR0aDtcbiAgICAgICAgaGFzVmlzaWJsZU92ZXJmbG93ID1cbiAgICAgICAgICB3LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpLm92ZXJmbG93ID09PSAndmlzaWJsZSc7XG4gICAgICB9IHdoaWxlICghaXNCb2R5ICYmICEoaGFzU2Nyb2xsYWJsZVNwYWNlICYmICFoYXNWaXNpYmxlT3ZlcmZsb3cpKTtcblxuICAgICAgaXNCb2R5ID0gaGFzU2Nyb2xsYWJsZVNwYWNlID0gaGFzVmlzaWJsZU92ZXJmbG93ID0gbnVsbDtcblxuICAgICAgcmV0dXJuIGVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNlbGYgaW52b2tlZCBmdW5jdGlvbiB0aGF0LCBnaXZlbiBhIGNvbnRleHQsIHN0ZXBzIHRocm91Z2ggc2Nyb2xsaW5nXG4gICAgICogQG1ldGhvZCBzdGVwXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzdGVwKGNvbnRleHQpIHtcbiAgICAgIHZhciB0aW1lID0gbm93KCk7XG4gICAgICB2YXIgdmFsdWU7XG4gICAgICB2YXIgY3VycmVudFg7XG4gICAgICB2YXIgY3VycmVudFk7XG4gICAgICB2YXIgZWxhcHNlZCA9ICh0aW1lIC0gY29udGV4dC5zdGFydFRpbWUpIC8gU0NST0xMX1RJTUU7XG5cbiAgICAgIC8vIGF2b2lkIGVsYXBzZWQgdGltZXMgaGlnaGVyIHRoYW4gb25lXG4gICAgICBlbGFwc2VkID0gZWxhcHNlZCA+IDEgPyAxIDogZWxhcHNlZDtcblxuICAgICAgLy8gYXBwbHkgZWFzaW5nIHRvIGVsYXBzZWQgdGltZVxuICAgICAgdmFsdWUgPSBlYXNlKGVsYXBzZWQpO1xuXG4gICAgICBjdXJyZW50WCA9IGNvbnRleHQuc3RhcnRYICsgKGNvbnRleHQueCAtIGNvbnRleHQuc3RhcnRYKSAqIHZhbHVlO1xuICAgICAgY3VycmVudFkgPSBjb250ZXh0LnN0YXJ0WSArIChjb250ZXh0LnkgLSBjb250ZXh0LnN0YXJ0WSkgKiB2YWx1ZTtcblxuICAgICAgY29udGV4dC5tZXRob2QuY2FsbChjb250ZXh0LnNjcm9sbGFibGUsIGN1cnJlbnRYLCBjdXJyZW50WSk7XG5cbiAgICAgIC8vIHNjcm9sbCBtb3JlIGlmIHdlIGhhdmUgbm90IHJlYWNoZWQgb3VyIGRlc3RpbmF0aW9uXG4gICAgICBpZiAoY3VycmVudFggIT09IGNvbnRleHQueCB8fCBjdXJyZW50WSAhPT0gY29udGV4dC55KSB7XG4gICAgICAgIHcucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXAuYmluZCh3LCBjb250ZXh0KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2Nyb2xscyB3aW5kb3cgd2l0aCBhIHNtb290aCBiZWhhdmlvclxuICAgICAqIEBtZXRob2Qgc21vb3RoU2Nyb2xsXG4gICAgICogQHBhcmFtIHtPYmplY3R8Tm9kZX0gZWxcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICovXG4gICAgZnVuY3Rpb24gc21vb3RoU2Nyb2xsKGVsLCB4LCB5KSB7XG4gICAgICB2YXIgc2Nyb2xsYWJsZTtcbiAgICAgIHZhciBzdGFydFg7XG4gICAgICB2YXIgc3RhcnRZO1xuICAgICAgdmFyIG1ldGhvZDtcbiAgICAgIHZhciBzdGFydFRpbWUgPSBub3coKTtcblxuICAgICAgLy8gZGVmaW5lIHNjcm9sbCBjb250ZXh0XG4gICAgICBpZiAoZWwgPT09IGQuYm9keSkge1xuICAgICAgICBzY3JvbGxhYmxlID0gdztcbiAgICAgICAgc3RhcnRYID0gdy5zY3JvbGxYIHx8IHcucGFnZVhPZmZzZXQ7XG4gICAgICAgIHN0YXJ0WSA9IHcuc2Nyb2xsWSB8fCB3LnBhZ2VZT2Zmc2V0O1xuICAgICAgICBtZXRob2QgPSBvcmlnaW5hbC5zY3JvbGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzY3JvbGxhYmxlID0gZWw7XG4gICAgICAgIHN0YXJ0WCA9IGVsLnNjcm9sbExlZnQ7XG4gICAgICAgIHN0YXJ0WSA9IGVsLnNjcm9sbFRvcDtcbiAgICAgICAgbWV0aG9kID0gc2Nyb2xsRWxlbWVudDtcbiAgICAgIH1cblxuICAgICAgLy8gc2Nyb2xsIGxvb3Bpbmcgb3ZlciBhIGZyYW1lXG4gICAgICBzdGVwKHtcbiAgICAgICAgc2Nyb2xsYWJsZTogc2Nyb2xsYWJsZSxcbiAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgIHN0YXJ0VGltZTogc3RhcnRUaW1lLFxuICAgICAgICBzdGFydFg6IHN0YXJ0WCxcbiAgICAgICAgc3RhcnRZOiBzdGFydFksXG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogT1JJR0lOQUwgTUVUSE9EUyBPVkVSUklERVNcbiAgICAgKi9cblxuICAgIC8vIHcuc2Nyb2xsIGFuZCB3LnNjcm9sbFRvXG4gICAgdy5zY3JvbGwgPSB3LnNjcm9sbFRvID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG9yaWdpbmFsLnNjcm9sbC5jYWxsKFxuICAgICAgICAgIHcsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQgfHwgYXJndW1lbnRzWzBdLFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgfHwgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgIHcsXG4gICAgICAgIGQuYm9keSxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0ubGVmdCxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0udG9wXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyB3LnNjcm9sbEJ5XG4gICAgdy5zY3JvbGxCeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgc21vb3RoIGJlaGF2aW9yIGlmIG5vdCByZXF1aXJlZFxuICAgICAgaWYgKHNob3VsZEJhaWxPdXQoYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBvcmlnaW5hbC5zY3JvbGxCeS5jYWxsKFxuICAgICAgICAgIHcsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQgfHwgYXJndW1lbnRzWzBdLFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgfHwgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgIHcsXG4gICAgICAgIGQuYm9keSxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0ubGVmdCArICh3LnNjcm9sbFggfHwgdy5wYWdlWE9mZnNldCksXG4gICAgICAgIH5+YXJndW1lbnRzWzBdLnRvcCArICh3LnNjcm9sbFkgfHwgdy5wYWdlWU9mZnNldClcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbCBhbmQgRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsVG9cbiAgICBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGwgPSBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxUbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgc21vb3RoIGJlaGF2aW9yIGlmIG5vdCByZXF1aXJlZFxuICAgICAgaWYgKHNob3VsZEJhaWxPdXQoYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBvcmlnaW5hbC5lbFNjcm9sbC5jYWxsKFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXS5sZWZ0IHx8IGFyZ3VtZW50c1swXSxcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgfHwgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgIGFyZ3VtZW50c1swXS5sZWZ0LFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3BcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEJ5XG4gICAgRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsQnkgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmcwID0gYXJndW1lbnRzWzBdO1xuXG4gICAgICBpZiAodHlwZW9mIGFyZzAgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsKHtcbiAgICAgICAgICBsZWZ0OiBhcmcwLmxlZnQgKyB0aGlzLnNjcm9sbExlZnQsXG4gICAgICAgICAgdG9wOiBhcmcwLnRvcCArIHRoaXMuc2Nyb2xsVG9wLFxuICAgICAgICAgIGJlaGF2aW9yOiBhcmcwLmJlaGF2aW9yXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zY3JvbGwoXG4gICAgICAgICAgdGhpcy5zY3JvbGxMZWZ0ICsgYXJnMCxcbiAgICAgICAgICB0aGlzLnNjcm9sbFRvcCArIGFyZ3VtZW50c1sxXVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxJbnRvVmlld1xuICAgIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3ID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG9yaWdpbmFsLnNjcm9sbEludG9WaWV3LmNhbGwodGhpcywgYXJndW1lbnRzWzBdIHx8IHRydWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIExFVCBUSEUgU01PT1RITkVTUyBCRUdJTiFcbiAgICAgIHZhciBzY3JvbGxhYmxlUGFyZW50ID0gZmluZFNjcm9sbGFibGVQYXJlbnQodGhpcyk7XG4gICAgICB2YXIgcGFyZW50UmVjdHMgPSBzY3JvbGxhYmxlUGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgdmFyIGNsaWVudFJlY3RzID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgaWYgKHNjcm9sbGFibGVQYXJlbnQgIT09IGQuYm9keSkge1xuICAgICAgICAvLyByZXZlYWwgZWxlbWVudCBpbnNpZGUgcGFyZW50XG4gICAgICAgIHNtb290aFNjcm9sbC5jYWxsKFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgc2Nyb2xsYWJsZVBhcmVudCxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LnNjcm9sbExlZnQgKyBjbGllbnRSZWN0cy5sZWZ0IC0gcGFyZW50UmVjdHMubGVmdCxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LnNjcm9sbFRvcCArIGNsaWVudFJlY3RzLnRvcCAtIHBhcmVudFJlY3RzLnRvcFxuICAgICAgICApO1xuICAgICAgICAvLyByZXZlYWwgcGFyZW50IGluIHZpZXdwb3J0XG4gICAgICAgIHcuc2Nyb2xsQnkoe1xuICAgICAgICAgIGxlZnQ6IHBhcmVudFJlY3RzLmxlZnQsXG4gICAgICAgICAgdG9wOiBwYXJlbnRSZWN0cy50b3AsXG4gICAgICAgICAgYmVoYXZpb3I6ICdzbW9vdGgnXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmV2ZWFsIGVsZW1lbnQgaW4gdmlld3BvcnRcbiAgICAgICAgdy5zY3JvbGxCeSh7XG4gICAgICAgICAgbGVmdDogY2xpZW50UmVjdHMubGVmdCxcbiAgICAgICAgICB0b3A6IGNsaWVudFJlY3RzLnRvcCxcbiAgICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBjb21tb25qc1xuICAgIG1vZHVsZS5leHBvcnRzID0geyBwb2x5ZmlsbDogcG9seWZpbGwgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBnbG9iYWxcbiAgICBwb2x5ZmlsbCgpO1xuICB9XG59KSh3aW5kb3csIGRvY3VtZW50KTtcbiIsImNvbnN0IGNsYW1wID0geiA9PiAobWluLG1heCkgPT4gTWF0aC5taW4oTWF0aC5tYXgoeiwgbWluKSwgbWF4KVxuXG5leHBvcnQgY29uc3QgUGxheWVyID0gKCkgPT4gKHtcbiAgc3RhdGU6IHtcbiAgICBwbGF5ZXI6IG51bGwsXG4gICAgcGxheWluZzogZmFsc2UsXG4gICAgZXJyb3I6IGZhbHNlLFxuICAgIGN1cnJlbnRUaW1lOiAwLFxuICAgIHdlYm06IGZhbHNlLFxuICB9LFxuICBhY3Rpb25zOiB7XG4gICAgc2V0V2VibTogKHMsYSxkKSA9PiAoeyB3ZWJtOiBkIH0pLFxuICAgIHNldEN1cnJlbnRUaW1lOiAocyxhLGQpID0+ICh7IGN1cnJlbnRUaW1lOiBkIH0pLFxuICAgIHNldEVycm9yOiAocyxhLGQpID0+ICh7IGVycm9yOiBkIH0pLFxuICAgIHNldFBsYXlpbmc6IChzLGEsZCkgPT4gKHsgcGxheWluZzogZCB9KSxcbiAgICBwYXVzZTogKHMsYSxkKSA9PiB7XG4gICAgICBzLnBsYXllciAmJiBzLnBsYXllci5wYXVzZSgpXG4gICAgICBhLnNldFBsYXlpbmcoZmFsc2UpXG4gICAgfSxcbiAgICBwbGF5UGF1c2U6IChzLGEsZCkgPT4ge1xuICAgICAgcy5wbGF5ZXIucGF1c2VkID8gcy5wbGF5ZXIucGxheSgpIDogcy5wbGF5ZXIucGF1c2UoKVxuICAgICAgYS5zZXRQbGF5aW5nKCFzLnBsYXllci5wYXVzZWQpXG4gICAgfSxcbiAgICBzZWVrQnk6ICh7cGxheWVyfSxhLGQpID0+IHtcbiAgICAgIGNvbnN0IHRpbWUgPSBjbGFtcChwbGF5ZXIuY3VycmVudFRpbWUgKyBkKSgwLCBwbGF5ZXIuZHVyYXRpb24pXG4gICAgICBwbGF5ZXIuY3VycmVudFRpbWUgPSB0aW1lXG4gICAgICBhLnNldEN1cnJlbnRUaW1lKHRpbWUpXG4gICAgfSxcbiAgfSxcbn0pXG4iLCJjb25zdCBNQVhfUkVTVUxUUyA9IDEwXG5jb25zdCBZVF9BUElfS0VZID0gXCJBSXphU3lCdWRQd2NFS0FTN0tFeU1ueURPUHVIVXY1cGQzdlNaLVVcIlxuXG5leHBvcnQgY29uc3QgWVRfQVBJX1NFQVJDSCA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS95b3V0dWJlL3YzL3NlYXJjaD9wYXJ0PXNuaXBwZXQnXG4gICsgYCZtYXhSZXN1bHRzPSR7TUFYX1JFU1VMVFN9JmtleT0ke1lUX0FQSV9LRVl9JnR5cGU9dmlkZW8mdmlkZW9DYXRlZ29yeUlkPTEwYFxuXG5leHBvcnQgY29uc3QgZmV0Y2hSZWxhdGVkID0gaWQgPT5cbiAgZmV0Y2goYCR7WVRfQVBJX1NFQVJDSH0mcmVsYXRlZFRvVmlkZW9JZD0ke2lkfWApXG4gIC50aGVuKHIgPT4gci5qc29uKCkpXG5cbmV4cG9ydCBjb25zdCBmZXRjaFNlYXJjaFJlc3VsdHMgPSAocXVlcnk9JycsIHRva2VuPScnKSA9PlxuICBmZXRjaChgJHtZVF9BUElfU0VBUkNIfSZxPSR7cXVlcnl9JnBhZ2VUb2tlbj0ke3Rva2VufWApXG4gIC50aGVuKHIgPT4gci5qc29uKCkpXG5cbmV4cG9ydCBjb25zdCBzZWNvbmRzVG9ISE1NU1MgPSBzZWNvbmRzID0+IHtcbiAgY29uc3QgaCA9IHBhcnNlSW50KHNlY29uZHMgLyAzNjAwLCAxMCkgJSAyNFxuICBjb25zdCBtID0gcGFyc2VJbnQoc2Vjb25kcyAvIDYwLCAxMCkgJSA2MFxuICBjb25zdCBzID0gTWF0aC5mbG9vcihzZWNvbmRzICUgNjApXG4gIHJldHVybiBoID4gMCA/XG4gICAgYCR7aCA8IDEwID8gYDAke2h9YCA6IGh9OiR7bSA8IDEwID8gYDAke219YCA6IG19OiR7cyA8IDEwID8gYDAke3N9YCA6IHN9YCA6XG4gICAgYCR7bSA8IDEwID8gYDAke219YCA6IG19OiR7cyA8IDEwID8gYDAke3N9YCA6IHN9YFxufVxuIiwiaW1wb3J0IHsgZmV0Y2hTZWFyY2hSZXN1bHRzLCBmZXRjaFJlbGF0ZWQgfSBmcm9tICcuLi9oZWxwZXJzL3lvdXR1YmUnXG5cbmV4cG9ydCBjb25zdCBTZWFyY2ggPSAoKSA9PiAoe1xuICBzdGF0ZToge1xuICAgIHNlYXJjaFN0cmluZzogJycsXG4gICAgc2VhcmNoVG9rZW46ICcnLFxuICAgIHNlYXJjaFJlc3VsdHM6IFtdLFxuICB9LFxuICBldmVudHM6IHtcbiAgICBsb2FkZWQ6IChzLGEpID0+IHMucm91dGVyLnBhcmFtcy5pZFxuICAgICAgPyBmZXRjaFJlbGF0ZWQocy5yb3V0ZXIucGFyYW1zLmlkKVxuICAgICAgICAgIC50aGVuKCh7aXRlbXN9KSA9PiBhLnNldFNlYXJjaFJlc3VsdHMoaXRlbXMpKVxuICAgICAgOiBhLnNlYXJjaCgpXG4gIH0sXG4gIGFjdGlvbnM6IHtcbiAgICBzZXRTZWFyY2hTdHJpbmc6IChzLGEsZCkgPT4gKHsgc2VhcmNoU3RyaW5nOiBkIHx8ICcnIH0pLFxuICAgIHNldFNlYXJjaFRva2VuOiAocyxhLGQpID0+ICh7IHNlYXJjaFRva2VuOiBkIHx8ICcnIH0pLFxuICAgIHNldFNlYXJjaFJlc3VsdHM6IChzLGEsZCkgPT4gKHsgc2VhcmNoUmVzdWx0czogZCB9KSxcbiAgICBzZWFyY2g6IChzLGEsZCkgPT4ge1xuICAgICAgYS5zZXRTZWFyY2hTdHJpbmcoZClcbiAgICAgIGEuc2V0U2VhcmNoVG9rZW4oKVxuICAgICAgYS5mZXRjaFJlc3VsdHMoKVxuICAgIH0sXG4gICAgZmV0Y2hSZXN1bHRzOiAocyxhLGQpID0+IHtcbiAgICAgIChzLnNlYXJjaFN0cmluZy5sZW5ndGggfHwgcy5zZWFyY2hSZXN1bHRzLmxlbmd0aCA9PT0gMCkgJiZcbiAgICAgIGZldGNoU2VhcmNoUmVzdWx0cyhzLnNlYXJjaFN0cmluZywgcy5zZWFyY2hUb2tlbilcbiAgICAgIC50aGVuKCh7IGl0ZW1zLCBuZXh0UGFnZVRva2VuIH0pID0+IHtcbiAgICAgICAgYS5zZXRTZWFyY2hSZXN1bHRzKHMuc2VhcmNoVG9rZW5cbiAgICAgICAgICA/IHMuc2VhcmNoUmVzdWx0cy5jb25jYXQoaXRlbXMpXG4gICAgICAgICAgOiBpdGVtc1xuICAgICAgICApXG4gICAgICAgIGEuc2V0U2VhcmNoVG9rZW4obmV4dFBhZ2VUb2tlbilcbiAgICAgIH0pLmNhdGNoKGNvbnNvbGUubG9nKVxuICAgIH0sXG4gIH0sXG59KVxuIiwiY29uc3QgZGF0YWJhc2UgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigncGFydGllcycpXG5cbmV4cG9ydCBjb25zdCBQYXJ0eSA9ICgpID0+ICh7XG4gIHN0YXRlOiB7XG4gICAgcGFydHlROiBbXSxcbiAgICBwYXJ0eUlkOiAnJyxcbiAgICBwb3B1cFZpc2libGU6IGZhbHNlLFxuICB9LFxuICBhY3Rpb25zOiB7XG4gICAgc2V0UGFydHlJZDogKHMsYSxkKSA9PiAoeyBwYXJ0eUlkOiBkIH0pLFxuICAgIHNldFBhcnR5UTogKHMsYSxkKSA9PiAoeyBwYXJ0eVE6IGQgfSksXG4gICAgZ2V0UGFydHlROiAocyxhLGQpID0+IHtcbiAgICAgIHMucGFydHlJZCAmJlxuICAgICAgICBkYXRhYmFzZS5jaGlsZChzLnBhcnR5SWQpLm9uKCd2YWx1ZScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgZGF0YS52YWwoKSAmJiBkYXRhLnZhbCgpLmlkcyAmJiBhLnVwZGF0ZVEoZGF0YS52YWwoKS5pZHMpXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICB1cGRhdGVROiAocyxhLHEpID0+IHtcbiAgICAgIGEuc2V0UGFydHlRKHEpXG4gICAgICBzLnRyYWNrLmlkICE9PSBxWzBdICYmIGEuZ2V0VmlkZW8ocVswXSlcbiAgICB9LFxuICAgIHNldFBvcHVwVmlzaWJsZTogKHMsYSxkKSA9PiAoeyBwb3B1cFZpc2libGU6IGQgfSksXG4gICAgc2F2ZVBhcnR5U3RhdGU6IChzLGEsZCkgPT4ge1xuICAgICAgaWYgKHMucGFydHlJZCkge1xuICAgICAgICBhLnNldFBvcHVwVmlzaWJsZSh0cnVlKVxuICAgICAgICBkYXRhYmFzZS5jaGlsZChzLnBhcnR5SWQpLnNldCh7IGlkczogcy5wYXJ0eVEuY29uY2F0KGQpIH0pXG4gICAgICB9XG4gICAgfSxcbiAgICBuZXh0UVRyYWNrOiAocyxhLGQpID0+IHtcbiAgICAgIHMucGFydHlJZCAmJlxuICAgICAgICBkYXRhYmFzZS5jaGlsZChzLnBhcnR5SWQpLnNldCh7XG4gICAgICAgICAgaWRzOiBzLnRyYWNrLmlkID09PSBzLnBhcnR5UVswXSA/XG4gICAgICAgICAgICBzLnBhcnR5US5zcGxpY2UoMCwgMSkgJiYgcy5wYXJ0eVEgOlxuICAgICAgICAgICAgICBzLnBhcnR5UVxuICAgICAgICB9KVxuICAgIH1cbiAgfVxufSlcbiIsImltcG9ydCB7IGggfSBmcm9tICdoeXBlcmFwcCdcblxuY29uc3Qgbm9vcCA9IF8gPT4gX1xuY29uc3QgZGVib3VuY2VkID0gdGltZSA9PiBmbiA9PiBkZWJvdW5jZShmbiwgdGltZSlcblxuY29uc3QgZGVib3VuY2UgPSAoZnVuYywgd2FpdCwgaW1tZWRpYXRlKSA9PiB7XG4gIGxldCB0aW1lb3V0XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBsZXQgW2NvbnRleHQsIGFyZ3NdID0gW3RoaXMsIGFyZ3VtZW50c11cbiAgICBjb25zdCBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGltZW91dCA9IG51bGxcbiAgICAgIGlmICghaW1tZWRpYXRlKSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXG4gICAgfVxuICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpXG4gICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpXG4gICAgaWYgKGNhbGxOb3cpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncylcbiAgfVxufVxuXG5jb25zdCBvbldpbmRvd0JvdHRvbSA9IGZuID0+IGUgPT5cbiAgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgPiAwICYmXG4gICh3aW5kb3cuaW5uZXJIZWlnaHQgKyB3aW5kb3cuc2Nyb2xsWSkgPj0gZG9jdW1lbnQuYm9keS5zY3JvbGxIZWlnaHRcbiAgPyBmbihlKVxuICA6IG5vb3AoKVxuXG5leHBvcnQgY29uc3QgdXNlID0gaHJlZiA9PlxuICBoKCd1c2UnLCB7XG4gICAgb251cGRhdGU6IGUgPT4gZS5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyxcbiAgICAgICdocmVmJyxcbiAgICAgIGhyZWZcbiAgICApLFxuICB9KVxuXG5leHBvcnQgY29uc3QgbGluayA9IGEgPT4gKHA9e30sYz1bXSkgPT5cbiAgaCgnYScsIE9iamVjdC5hc3NpZ24ocCwge1xuICAgIG9uY2xpY2s6IGUgPT4gcC5ocmVmWzBdID09PSAnLycgJiZcbiAgICAgIGUucHJldmVudERlZmF1bHQoKSB8fCBhLnJvdXRlci5nbyhwLmhyZWYpLFxuICB9KSwgYylcblxuZXhwb3J0IGNvbnN0IHN2ZyA9IChwPXt9KSA9PlxuICBoKCdzdmcnLCBPYmplY3QuYXNzaWduKHt9LCBwLCB7IGhyZWY6ICcnIH0pLCB1c2UocC5ocmVmKSlcblxuZXhwb3J0IGNvbnN0IGltZyA9IChwPXt9KSA9PlxuICBoKCdpbWcnLCBwKVxuXG5leHBvcnQgY29uc3QgYnV0dG9uID0gKHA9e30sYz1bXSkgPT5cbiAgaCgnYnV0dG9uJywgcCwgYylcblxuZXhwb3J0IGNvbnN0IGlucHV0ID0gKHA9e30pID0+XG4gIGgoJ2lucHV0JywgT2JqZWN0LmFzc2lnbihwLCB7XG4gICAgb25pbnB1dDogZGVib3VuY2VkKHAuZGVib3VuY2UgfHwgMCkocC5hY3Rpb24gfHwgbm9vcClcbiAgfSkpXG5cbmV4cG9ydCBjb25zdCB1bCA9IChwPXt9LGM9W10pID0+XG4gIGgoJ3VsJywgT2JqZWN0LmFzc2lnbihwLCBwLmluZmluaXRlID8ge1xuICAgIG9uY3JlYXRlOiBlID0+IHtcbiAgICAgIGUuX2luZmluaXRlID0gb25XaW5kb3dCb3R0b20ocC5pbmZpbml0ZSB8fCBub29wKVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGUuX2luZmluaXRlKVxuICAgIH0sXG4gICAgb25yZW1vdmU6IChlLGRvbmUpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBlLl9pbmZpbml0ZSlcbiAgICAgIGRvbmUoKVxuICAgIH0sXG4gIH0gOiB7fSksIGMpXG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnaHlwZXJhcHAnXG5cbmNvbnN0ICRzdmcgPSAocCxjKSA9PiBoKFwic3ZnXCIsIHAsIGMpXG5cbmNvbnN0ICR1c2UgPSBocmVmID0+XG4gIGgoXCJ1c2VcIiwge1xuICAgIGhyZWYsXG4gICAgb25jcmVhdGU6IGUgPT5cbiAgICAgIGUuc2V0QXR0cmlidXRlTlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsIFwiaHJlZlwiLCBocmVmKVxuICB9KVxuXG5jb25zdCAkaW1nID0gcCA9PiBoKCdpbWcnLCBwKVxuXG5leHBvcnQgY29uc3QgJHl0VGh1bWIgPSBpZCA9PlxuICAgICRpbWcoeyBzcmM6IGBodHRwczovL2ltZy55b3V0dWJlLmNvbS92aS8ke2lkfS9ocWRlZmF1bHQuanBnYCB9KVxuXG5leHBvcnQgY29uc3QgJGljb24gPSBocmVmID0+ICRzdmcoe30sICR1c2UoaHJlZikpXG5cbmV4cG9ydCBjb25zdCAkc3Bpbm5lciA9ICgpID0+XG4gIGgoJ2RpdicsIHsgY2xhc3M6ICdzcGlubmVyJyB9LFxuICAgIFsxLDIsMyw0LDVdLm1hcCh4ID0+IGgoJ2RpdicsIHsgY2xhc3M6IGByZWN0JHt4fWAgfSkpXG4gIClcbiIsImltcG9ydCB7IGggfSBmcm9tICdoeXBlcmFwcCdcbmltcG9ydCB7IGxpbmssIGlucHV0LCB1bCB9IGZyb20gJ2h1eSdcbmltcG9ydCB7ICRpY29uLCAkeXRUaHVtYiwgJHNwaW5uZXIgfSBmcm9tICcuLi9oZWxwZXJzL2VsZW1lbnQnXG5cbmNvbnN0ICR0aXRsZSA9IGMgPT4gaCgndGl0bGUtJywge30sIGMpXG5jb25zdCAkZm9ybSA9IChwLGMpID0+IGgoJ2Zvcm0nLCBwLCBjKVxuXG5jb25zdCAkc2VhcmNoSXRlbSA9IChzLGEpID0+IGl0ZW0gPT5cbiAgaCgnYScsIHtcbiAgICBocmVmOiBgLyR7aXRlbS5pZC52aWRlb0lkfWAsXG4gICAgb25jbGljazogZSA9PiBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHx8IGEuc2F2ZVBhcnR5U3RhdGUoaXRlbS5pZC52aWRlb0lkKVxuICAgICAgfHwgKCFzLnBhcnR5SWQgJiYgYS5yb3V0ZXIuZ28oYC8ke2l0ZW0uaWQudmlkZW9JZH1gKSlcbiAgICAgIHx8IHdpbmRvdy5zY3JvbGxUbygwLDApXG4gIH0sW1xuICAgICR5dFRodW1iKGl0ZW0uaWQudmlkZW9JZCksXG4gICAgJHRpdGxlKGl0ZW0uc25pcHBldC50aXRsZSksXG4gIF0pXG5cbmV4cG9ydCBkZWZhdWx0IChzLGEpID0+XG4gIGgoJ3NlYXJjaC0nLCB7fSwgW1xuICAgICRmb3JtKHtcbiAgICAgIGFjdGlvbjogJyMnLFxuICAgICAgb25zdWJtaXQ6IGUgPT4gZS5wcmV2ZW50RGVmYXVsdCgpIHx8IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpXG4gICAgfSwgW1xuICAgICAgaW5wdXQoe1xuICAgICAgICBwbGFjZWhvbGRlcjogJ1NlYXJjaCBzb25ncyBvciBhcnRpc3RzLi4nLFxuICAgICAgICBhY3Rpb246IGUgPT4gYS5zZWFyY2goZS50YXJnZXQudmFsdWUpLFxuICAgICAgICBhdXRvY29tcGxldGU6ICdvZmYnLFxuICAgICAgICBhdXRvY29ycmVjdDogJ29mZicsXG4gICAgICAgIGF1dG9jYXBpdGFsaXplOiAnb2ZmJyxcbiAgICAgICAgc3BlbGxjaGVjazogJ2ZhbHNlJyxcbiAgICAgICAgZGVib3VuY2U6IDMwMCxcbiAgICAgIH0pLFxuICAgICAgJGljb24oJyNzZWFyY2gnKSxcbiAgICBdKSxcbiAgICB1bCh7IGNsYXNzOiAnc2VhcmNoLXJlc3VsdHMnLCBpbmZpbml0ZTogYS5mZXRjaFJlc3VsdHMsIH0sXG4gICAgICBzLnNlYXJjaFJlc3VsdHMubWFwKCRzZWFyY2hJdGVtKHMsYSkpXG4gICAgKSxcbiAgICAocy5zZWFyY2hTdHJpbmcgIT09ICcnICYmICRzcGlubmVyKCkpXG4gIF0pXG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZmluZWQsbm8tcGFyYW0tcmVhc3NpZ24sbm8tc2hhZG93ICovXG5cbi8qKlxuICogVGhyb3R0bGUgZXhlY3V0aW9uIG9mIGEgZnVuY3Rpb24uIEVzcGVjaWFsbHkgdXNlZnVsIGZvciByYXRlIGxpbWl0aW5nXG4gKiBleGVjdXRpb24gb2YgaGFuZGxlcnMgb24gZXZlbnRzIGxpa2UgcmVzaXplIGFuZCBzY3JvbGwuXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSAgICBkZWxheSAgICAgICAgICBBIHplcm8tb3ItZ3JlYXRlciBkZWxheSBpbiBtaWxsaXNlY29uZHMuIEZvciBldmVudCBjYWxsYmFja3MsIHZhbHVlcyBhcm91bmQgMTAwIG9yIDI1MCAob3IgZXZlbiBoaWdoZXIpIGFyZSBtb3N0IHVzZWZ1bC5cbiAqIEBwYXJhbSAge0Jvb2xlYW59ICAgbm9UcmFpbGluZyAgICAgT3B0aW9uYWwsIGRlZmF1bHRzIHRvIGZhbHNlLiBJZiBub1RyYWlsaW5nIGlzIHRydWUsIGNhbGxiYWNrIHdpbGwgb25seSBleGVjdXRlIGV2ZXJ5IGBkZWxheWAgbWlsbGlzZWNvbmRzIHdoaWxlIHRoZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdHRsZWQtZnVuY3Rpb24gaXMgYmVpbmcgY2FsbGVkLiBJZiBub1RyYWlsaW5nIGlzIGZhbHNlIG9yIHVuc3BlY2lmaWVkLCBjYWxsYmFjayB3aWxsIGJlIGV4ZWN1dGVkIG9uZSBmaW5hbCB0aW1lXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFmdGVyIHRoZSBsYXN0IHRocm90dGxlZC1mdW5jdGlvbiBjYWxsLiAoQWZ0ZXIgdGhlIHRocm90dGxlZC1mdW5jdGlvbiBoYXMgbm90IGJlZW4gY2FsbGVkIGZvciBgZGVsYXlgIG1pbGxpc2Vjb25kcyxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGludGVybmFsIGNvdW50ZXIgaXMgcmVzZXQpXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gIGNhbGxiYWNrICAgICAgIEEgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgYWZ0ZXIgZGVsYXkgbWlsbGlzZWNvbmRzLiBUaGUgYHRoaXNgIGNvbnRleHQgYW5kIGFsbCBhcmd1bWVudHMgYXJlIHBhc3NlZCB0aHJvdWdoLCBhcy1pcyxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gYGNhbGxiYWNrYCB3aGVuIHRoZSB0aHJvdHRsZWQtZnVuY3Rpb24gaXMgZXhlY3V0ZWQuXG4gKiBAcGFyYW0gIHtCb29sZWFufSAgIGRlYm91bmNlTW9kZSAgIElmIGBkZWJvdW5jZU1vZGVgIGlzIHRydWUgKGF0IGJlZ2luKSwgc2NoZWR1bGUgYGNsZWFyYCB0byBleGVjdXRlIGFmdGVyIGBkZWxheWAgbXMuIElmIGBkZWJvdW5jZU1vZGVgIGlzIGZhbHNlIChhdCBlbmQpLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY2hlZHVsZSBgY2FsbGJhY2tgIHRvIGV4ZWN1dGUgYWZ0ZXIgYGRlbGF5YCBtcy5cbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gIEEgbmV3LCB0aHJvdHRsZWQsIGZ1bmN0aW9uLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICggZGVsYXksIG5vVHJhaWxpbmcsIGNhbGxiYWNrLCBkZWJvdW5jZU1vZGUgKSB7XG5cblx0Ly8gQWZ0ZXIgd3JhcHBlciBoYXMgc3RvcHBlZCBiZWluZyBjYWxsZWQsIHRoaXMgdGltZW91dCBlbnN1cmVzIHRoYXRcblx0Ly8gYGNhbGxiYWNrYCBpcyBleGVjdXRlZCBhdCB0aGUgcHJvcGVyIHRpbWVzIGluIGB0aHJvdHRsZWAgYW5kIGBlbmRgXG5cdC8vIGRlYm91bmNlIG1vZGVzLlxuXHR2YXIgdGltZW91dElEO1xuXG5cdC8vIEtlZXAgdHJhY2sgb2YgdGhlIGxhc3QgdGltZSBgY2FsbGJhY2tgIHdhcyBleGVjdXRlZC5cblx0dmFyIGxhc3RFeGVjID0gMDtcblxuXHQvLyBgbm9UcmFpbGluZ2AgZGVmYXVsdHMgdG8gZmFsc3kuXG5cdGlmICggdHlwZW9mIG5vVHJhaWxpbmcgIT09ICdib29sZWFuJyApIHtcblx0XHRkZWJvdW5jZU1vZGUgPSBjYWxsYmFjaztcblx0XHRjYWxsYmFjayA9IG5vVHJhaWxpbmc7XG5cdFx0bm9UcmFpbGluZyA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdC8vIFRoZSBgd3JhcHBlcmAgZnVuY3Rpb24gZW5jYXBzdWxhdGVzIGFsbCBvZiB0aGUgdGhyb3R0bGluZyAvIGRlYm91bmNpbmdcblx0Ly8gZnVuY3Rpb25hbGl0eSBhbmQgd2hlbiBleGVjdXRlZCB3aWxsIGxpbWl0IHRoZSByYXRlIGF0IHdoaWNoIGBjYWxsYmFja2Bcblx0Ly8gaXMgZXhlY3V0ZWQuXG5cdGZ1bmN0aW9uIHdyYXBwZXIgKCkge1xuXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHZhciBlbGFwc2VkID0gTnVtYmVyKG5ldyBEYXRlKCkpIC0gbGFzdEV4ZWM7XG5cdFx0dmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cblx0XHQvLyBFeGVjdXRlIGBjYWxsYmFja2AgYW5kIHVwZGF0ZSB0aGUgYGxhc3RFeGVjYCB0aW1lc3RhbXAuXG5cdFx0ZnVuY3Rpb24gZXhlYyAoKSB7XG5cdFx0XHRsYXN0RXhlYyA9IE51bWJlcihuZXcgRGF0ZSgpKTtcblx0XHRcdGNhbGxiYWNrLmFwcGx5KHNlbGYsIGFyZ3MpO1xuXHRcdH1cblxuXHRcdC8vIElmIGBkZWJvdW5jZU1vZGVgIGlzIHRydWUgKGF0IGJlZ2luKSB0aGlzIGlzIHVzZWQgdG8gY2xlYXIgdGhlIGZsYWdcblx0XHQvLyB0byBhbGxvdyBmdXR1cmUgYGNhbGxiYWNrYCBleGVjdXRpb25zLlxuXHRcdGZ1bmN0aW9uIGNsZWFyICgpIHtcblx0XHRcdHRpbWVvdXRJRCA9IHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHRpZiAoIGRlYm91bmNlTW9kZSAmJiAhdGltZW91dElEICkge1xuXHRcdFx0Ly8gU2luY2UgYHdyYXBwZXJgIGlzIGJlaW5nIGNhbGxlZCBmb3IgdGhlIGZpcnN0IHRpbWUgYW5kXG5cdFx0XHQvLyBgZGVib3VuY2VNb2RlYCBpcyB0cnVlIChhdCBiZWdpbiksIGV4ZWN1dGUgYGNhbGxiYWNrYC5cblx0XHRcdGV4ZWMoKTtcblx0XHR9XG5cblx0XHQvLyBDbGVhciBhbnkgZXhpc3RpbmcgdGltZW91dC5cblx0XHRpZiAoIHRpbWVvdXRJRCApIHtcblx0XHRcdGNsZWFyVGltZW91dCh0aW1lb3V0SUQpO1xuXHRcdH1cblxuXHRcdGlmICggZGVib3VuY2VNb2RlID09PSB1bmRlZmluZWQgJiYgZWxhcHNlZCA+IGRlbGF5ICkge1xuXHRcdFx0Ly8gSW4gdGhyb3R0bGUgbW9kZSwgaWYgYGRlbGF5YCB0aW1lIGhhcyBiZWVuIGV4Y2VlZGVkLCBleGVjdXRlXG5cdFx0XHQvLyBgY2FsbGJhY2tgLlxuXHRcdFx0ZXhlYygpO1xuXG5cdFx0fSBlbHNlIGlmICggbm9UcmFpbGluZyAhPT0gdHJ1ZSApIHtcblx0XHRcdC8vIEluIHRyYWlsaW5nIHRocm90dGxlIG1vZGUsIHNpbmNlIGBkZWxheWAgdGltZSBoYXMgbm90IGJlZW5cblx0XHRcdC8vIGV4Y2VlZGVkLCBzY2hlZHVsZSBgY2FsbGJhY2tgIHRvIGV4ZWN1dGUgYGRlbGF5YCBtcyBhZnRlciBtb3N0XG5cdFx0XHQvLyByZWNlbnQgZXhlY3V0aW9uLlxuXHRcdFx0Ly9cblx0XHRcdC8vIElmIGBkZWJvdW5jZU1vZGVgIGlzIHRydWUgKGF0IGJlZ2luKSwgc2NoZWR1bGUgYGNsZWFyYCB0byBleGVjdXRlXG5cdFx0XHQvLyBhZnRlciBgZGVsYXlgIG1zLlxuXHRcdFx0Ly9cblx0XHRcdC8vIElmIGBkZWJvdW5jZU1vZGVgIGlzIGZhbHNlIChhdCBlbmQpLCBzY2hlZHVsZSBgY2FsbGJhY2tgIHRvXG5cdFx0XHQvLyBleGVjdXRlIGFmdGVyIGBkZWxheWAgbXMuXG5cdFx0XHR0aW1lb3V0SUQgPSBzZXRUaW1lb3V0KGRlYm91bmNlTW9kZSA/IGNsZWFyIDogZXhlYywgZGVib3VuY2VNb2RlID09PSB1bmRlZmluZWQgPyBkZWxheSAtIGVsYXBzZWQgOiBkZWxheSk7XG5cdFx0fVxuXG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIHdyYXBwZXIgZnVuY3Rpb24uXG5cdHJldHVybiB3cmFwcGVyO1xuXG59O1xuIiwiZXhwb3J0IGNvbnN0IGlPUyA9ICgpID0+IC9pUGFkfGlQaG9uZXxpUG9kLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmICF3aW5kb3cuTVNTdHJlYW1cbmV4cG9ydCBjb25zdCBpT1NfY2hyb21lID0gKCkgPT4gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgnQ3JpT1MnKVxuZXhwb3J0IGNvbnN0IHNjcm9sbFRvU2VhcmNoID0gKCkgPT5cbiAgd2luZG93LnNjcm9sbCh7XG4gICAgdG9wOiB3aW5kb3cuaW5uZXJIZWlnaHQgKiAuOCxcbiAgICBsZWZ0OiAwLFxuICAgIGJlaGF2aW9yOiAnc21vb3RoJyxcbiAgfSlcblxuZXhwb3J0IGNvbnN0IGZvY3VzT25TY3JvbGxUb3AgPSB7XG4gIG9uY3JlYXRlOiBlID0+IHtcbiAgICBlLl9mbiA9IGV2ID0+IHdpbmRvdy5zY3JvbGxZID09PSAwXG4gICAgICA/IGUuY2xhc3NMaXN0LmFkZCgnZm9jdXMnKVxuICAgICAgOiBlLmNsYXNzTGlzdC5yZW1vdmUoJ2ZvY3VzJylcbiAgICBlLl9mbigpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGUuX2ZuKVxuICB9LFxuICBvbnJlbW92ZTogZSA9PlxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBlLl9mbiksXG59XG5cbmV4cG9ydCBjb25zdCBmaXgxMDB2aCA9IHtcbiAgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogaU9TKCkgJiYgIWlPU19jaHJvbWUoKSAmJiAnMTAwcHgnIH1cbn1cbiIsImltcG9ydCB7IGggfSBmcm9tICdoeXBlcmFwcCdcbmltcG9ydCB0aHJvdHRsZSBmcm9tICd0aHJvdHRsZS1kZWJvdW5jZS90aHJvdHRsZSdcbmltcG9ydCB7ICRpY29uLCAkeXRUaHVtYiwgJHNwaW5uZXIgfSBmcm9tICcuLi9oZWxwZXJzL2VsZW1lbnQnXG5pbXBvcnQgeyBzZWNvbmRzVG9ISE1NU1MgfSBmcm9tICcuLi9oZWxwZXJzL3lvdXR1YmUnXG5pbXBvcnQgeyBpT1MsIGlPU19jaHJvbWUsIHNjcm9sbFRvU2VhcmNoLCBmb2N1c09uU2Nyb2xsVG9wLCBmaXgxMDB2aCB9IGZyb20gJy4uL2hlbHBlcnMvd2luZG93J1xuXG5jb25zdCB1cmwgPSAnaHR0cHM6Ly9hcGkuam9leHRvZGQuY29tJ1xuXG5jb25zdCAkdGl0bGUgPSBjID0+IGgoJ3RpdGxlLScsIHt9LCBjKVxuY29uc3QgJGxvYWRpbmcgPSBjID0+IGgoJ2xvYWRpbmctJywge30sIGMpXG5jb25zdCAkYXVkaW8gPSBwID0+IGgoJ2F1ZGlvJywgcClcbmNvbnN0ICRidXR0b24gPSAocCxjKSA9PiBoKCdidXR0b24nLCBwLCBjKVxuXG5jb25zdCAkcHJvZ3Jlc3MgPSAodGltZSwgdG90YWwpID0+IHtcbiAgY29uc3QgY3VyID0gc2Vjb25kc1RvSEhNTVNTKHRpbWUpXG4gIGNvbnN0IGR1ciA9IHNlY29uZHNUb0hITU1TUyhpT1MoKSA/IHRvdGFsLzIgOiB0b3RhbClcbiAgcmV0dXJuIGgoJ3RpbWUtJywge30sIGAke2N1cn0gfCAke2R1cn1gKVxufVxuXG5leHBvcnQgZGVmYXVsdCAocyxhKSA9PlxuICBoKCdwbGF5ZXItJywgT2JqZWN0LmFzc2lnbihmaXgxMDB2aCwgZm9jdXNPblNjcm9sbFRvcCksIFtcbiAgICAkeXRUaHVtYihzLnRyYWNrLmlkKSxcbiAgICAkdGl0bGUocy5pc0ZldGNoaW5nID8gJHNwaW5uZXIoKSA6IHMudHJhY2sudGl0bGUpLFxuICAgICFzLmlzRmV0Y2hpbmcgJiYgKHMuZXJyb3JcbiAgICAgID8gJGxvYWRpbmcoJ0VSUk9SJylcbiAgICAgIDogcy5wbGF5ZXIuY3VycmVudFRpbWUgPT09IDBcbiAgICAgICAgPyBpT1MoKSAmJiBzLnBsYXllci5wYXVzZWQgPyAkbG9hZGluZygnUFJFU1MgUExBWScpIDogJGxvYWRpbmcoJ0xPQURJTkcnKVxuICAgICAgICA6ICRwcm9ncmVzcyhzLnBsYXllci5jdXJyZW50VGltZSwgcy5wbGF5ZXIuZHVyYXRpb24pKSxcbiAgICBoKCdjb250cm9scy0nLCB7fSxbXG4gICAgICAkYnV0dG9uKHsgb25jbGljazogYS5wcmV2VmlkZW8sIGRpc2FibGVkOiAhIXMuaXNGZXRjaGluZyB9LCAkaWNvbignI3ByZXZpb3VzJykpLFxuICAgICAgJGJ1dHRvbih7IG9uY2xpY2s6IGUgPT4gYS5zZWVrQnkoLTEwKSwgZGlzYWJsZWQ6ICEhcy5lcnJvciB9LCAkaWNvbignI3Jld2luZCcpKSxcbiAgICAgICRidXR0b24oeyBvbmNsaWNrOiBhLnBsYXlQYXVzZSwgZGlzYWJsZWQ6ICEhcy5lcnJvcixcbiAgICAgICAgY2xhc3M6IHMuZXJyb3IgPyAnZXJyb3InIDogcy5wbGF5aW5nID8gJ3BhdXNlJyA6ICdwbGF5JyxcbiAgICAgIH0sIFskaWNvbignI2Vycm9yJyksICRpY29uKCcjcGF1c2UnKSwgJGljb24oJyNwbGF5JyldKSxcbiAgICAgICRidXR0b24oeyBvbmNsaWNrOiBlID0+IGEuc2Vla0J5KDEwKSwgZGlzYWJsZWQ6ICEhcy5lcnJvciB9LCAkaWNvbignI2ZvcndhcmRzJykpLFxuICAgICAgJGJ1dHRvbih7IG9uY2xpY2s6IGEubmV4dFZpZGVvLCBkaXNhYmxlZDogISFzLmlzRmV0Y2hpbmcgfSwgJGljb24oJyNuZXh0JykpLFxuICAgIF0pLFxuICAgICRidXR0b24oeyBjbGFzczogJ3NlYXJjaCcsIG9uY2xpY2s6IHNjcm9sbFRvU2VhcmNoIH0sICdTZWFyY2ggRm9yIFN0cmVhbScpLFxuICAgICRhdWRpbyh7XG4gICAgICBzcmM6IHMudHJhY2sudXJsID8gYCR7dXJsfS9wcm94eS8keyhzLndlYm0gJiYgcy50cmFjay53ZWJtKSB8fCBzLnRyYWNrLnVybH1gIDogJycsXG4gICAgICB0aXRsZTogcy50cmFjay50aXRsZSxcbiAgICAgIGNyb3Nzb3JpZ2luOiAnYW5vbnltb3VzJyxcbiAgICAgIGF1dG9wbGF5OiAhaU9TKCkgJiYgJ3llcycsXG4gICAgICBvbmVycm9yOiBfID0+IGEuc2V0RXJyb3IodHJ1ZSksXG4gICAgICBvbmNhbnBsYXk6IF8gPT4gYS5zZXRFcnJvcihmYWxzZSksXG4gICAgICBvbmVuZGVkOiBfID0+IGEubmV4dFZpZGVvKCksXG4gICAgICBvbmNyZWF0ZTogZSA9PiB7XG4gICAgICAgIHMucGxheWVyID0gZVxuICAgICAgICBzLndlYm0gPSAhIWUuY2FuUGxheVR5cGUoJ2F1ZGlvL3dlYm0nKVxuICAgICAgfSxcbiAgICAgIG9udGltZXVwZGF0ZTogdGhyb3R0bGUoMTAwMCwgZSA9PiB7XG4gICAgICAgIGEuc2V0Q3VycmVudFRpbWUocy5wbGF5ZXIuY3VycmVudFRpbWUpXG4gICAgICAgIGlPUygpICYmIChzLnBsYXllci5jdXJyZW50VGltZSA+IHMucGxheWVyLmR1cmF0aW9uIC8gMikgJiYgYS5uZXh0VmlkZW8oKVxuICAgICAgfSksXG4gICAgfSksXG4gIF0pXG4iLCJ2YXIgaVxudmFyIHN0YWNrID0gW11cblxuZXhwb3J0IGZ1bmN0aW9uIGgodGFnLCBkYXRhKSB7XG4gIHZhciBub2RlXG4gIHZhciBjaGlsZHJlbiA9IFtdXG5cbiAgZm9yIChpID0gYXJndW1lbnRzLmxlbmd0aDsgaS0tID4gMjsgKSB7XG4gICAgc3RhY2sucHVzaChhcmd1bWVudHNbaV0pXG4gIH1cblxuICB3aGlsZSAoc3RhY2subGVuZ3RoKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoKG5vZGUgPSBzdGFjay5wb3AoKSkpKSB7XG4gICAgICBmb3IgKGkgPSBub2RlLmxlbmd0aDsgaS0tOyApIHtcbiAgICAgICAgc3RhY2sucHVzaChub2RlW2ldKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobm9kZSAhPSBudWxsICYmIG5vZGUgIT09IHRydWUgJiYgbm9kZSAhPT0gZmFsc2UpIHtcbiAgICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICBub2RlID0gbm9kZSArIFwiXCJcbiAgICAgIH1cbiAgICAgIGNoaWxkcmVuLnB1c2gobm9kZSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHlwZW9mIHRhZyA9PT0gXCJzdHJpbmdcIlxuICAgID8ge1xuICAgICAgICB0YWc6IHRhZyxcbiAgICAgICAgZGF0YTogZGF0YSB8fCB7fSxcbiAgICAgICAgY2hpbGRyZW46IGNoaWxkcmVuXG4gICAgICB9XG4gICAgOiB0YWcoZGF0YSwgY2hpbGRyZW4pXG59XG4iLCJpbXBvcnQgeyBoIH0gZnJvbSBcImh5cGVyYXBwXCJcblxuZnVuY3Rpb24gdm5vZGUodGFnKSB7XG4gIHJldHVybiBmdW5jdGlvbiAocHJvcHMsIGNoaWxkcmVuKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBwcm9wcyA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheShwcm9wcylcbiAgICAgID8gaCh0YWcsIHByb3BzLCBjaGlsZHJlbilcbiAgICAgIDogaCh0YWcsIHt9LCBwcm9wcylcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJhXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFiYnIocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImFiYnJcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkcmVzcyhwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiYWRkcmVzc1wiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcmVhKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJhcmVhXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFydGljbGUocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImFydGljbGVcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNpZGUocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImFzaWRlXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF1ZGlvKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJhdWRpb1wiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJiXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJkaShwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiYmRpXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJkbyhwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiYmRvXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJsb2NrcXVvdGUocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImJsb2NrcXVvdGVcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYnIocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImJyXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1dHRvbihwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiYnV0dG9uXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbnZhcyhwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiY2FudmFzXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhcHRpb24ocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImNhcHRpb25cIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2l0ZShwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiY2l0ZVwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb2RlKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJjb2RlXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbChwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiY29sXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbGdyb3VwKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJjb2xncm91cFwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkYXRhKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJkYXRhXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRhdGFsaXN0KHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJkYXRhbGlzdFwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZChwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiZGRcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVsKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJkZWxcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGV0YWlscyhwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiZGV0YWlsc1wiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZm4ocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImRmblwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaWFsb2cocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImRpYWxvZ1wiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXYocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImRpdlwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkbChwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiZGxcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZHQocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImR0XCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVtKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJlbVwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbWJlZChwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiZW1iZWRcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmllbGRzZXQocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImZpZWxkc2V0XCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpZ2NhcHRpb24ocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImZpZ2NhcHRpb25cIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlndXJlKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJmaWd1cmVcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9vdGVyKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJmb290ZXJcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybShwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiZm9ybVwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoMShwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiaDFcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaDIocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImgyXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGgzKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJoM1wiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoNChwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiaDRcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaDUocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImg1XCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGg2KHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJoNlwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZWFkZXIocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImhlYWRlclwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBocihwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiaHJcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaShwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiaVwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbWcocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImltZ1wiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnB1dChwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwiaW5wdXRcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJpbnNcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24ga2JkKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJrYmRcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbGFiZWwocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcImxhYmVsXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxlZ2VuZChwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwibGVnZW5kXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJsaVwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJtYWluXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcChwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwibWFwXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcmsocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcIm1hcmtcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVudShwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwibWVudVwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZW51aXRlbShwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwibWVudWl0ZW1cIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWV0ZXIocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcIm1ldGVyXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5hdihwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwibmF2XCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdChwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwib2JqZWN0XCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9sKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJvbFwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcHRncm91cChwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwib3B0Z3JvdXBcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJvcHRpb25cIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3V0cHV0KHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJvdXRwdXRcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcChwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwicFwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJhbShwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwicGFyYW1cIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJwcmVcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvZ3Jlc3MocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcInByb2dyZXNzXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHEocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcInFcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcnAocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcInJwXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJ0KHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJydFwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBydGMocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcInJ0Y1wiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBydWJ5KHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJydWJ5XCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHMocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcInNcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FtcChwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwic2FtcFwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWN0aW9uKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJzZWN0aW9uXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdChwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwic2VsZWN0XCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNtYWxsKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJzbWFsbFwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb3VyY2UocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcInNvdXJjZVwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGFuKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJzcGFuXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cm9uZyhwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwic3Ryb25nXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1Yihwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwic3ViXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1bW1hcnkocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcInN1bW1hcnlcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VwKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJzdXBcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3ZnKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJzdmdcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGFibGUocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcInRhYmxlXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRib2R5KHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJ0Ym9keVwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZChwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwidGRcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGV4dGFyZWEocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcInRleHRhcmVhXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRmb290KHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJ0Zm9vdFwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aChwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwidGhcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGhlYWQocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcInRoZWFkXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpbWUocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcInRpbWVcIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHIocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcInRyXCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYWNrKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJ0cmFja1wiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1KHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJ1XCIpKHByb3BzLCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVsKHByb3BzLCBjaGlsZHJlbikge1xuICByZXR1cm4gdm5vZGUoXCJ1bFwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2aWRlbyhwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwidmlkZW9cIikocHJvcHMsIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdnZhcihwcm9wcywgY2hpbGRyZW4pIHtcbiAgcmV0dXJuIHZub2RlKFwidnZhclwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YnIocHJvcHMsIGNoaWxkcmVuKSB7XG4gIHJldHVybiB2bm9kZShcIndiclwiKShwcm9wcywgY2hpbGRyZW4pXG59XG5cbiIsIlwidXNlIHN0cmljdFwiOyFmdW5jdGlvbigpe3ZhciBuPXthbmltYXRpb246XCJhbmltYXRpb25lbmRcIixNU0FuaW1hdGlvbjpcIk1TQW5pbWF0aW9uRW5kXCIsV2Via2l0QW5pbWF0aW9uOlwid2Via2l0QW5pbWF0aW9uRW5kXCJ9LHQ9bltPYmplY3Qua2V5cyhuKS5maWx0ZXIoZnVuY3Rpb24obil7cmV0dXJuIGRvY3VtZW50LmJvZHkuc3R5bGUuaGFzT3duUHJvcGVydHkobil9KVswXV0saT1mdW5jdGlvbihuKXtyZXR1cm4gZnVuY3Rpb24oaSl7cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKGUsbyl7dmFyIGE9QXJyYXkuaXNBcnJheShuKT9uOm4uc3BsaXQoXCIgXCIpLHI9ZnVuY3Rpb24gbihvKXtpLmNsYXNzTGlzdC5yZW1vdmUoXCJhbmltYXRlZFwiLGFbMF0pLGkucmVtb3ZlRXZlbnRMaXN0ZW5lcih0LG4pLGEuc2hpZnQoKSxhLmxlbmd0aD9zKCk6ZShpKX0scz1mdW5jdGlvbihuKXtpLmFkZEV2ZW50TGlzdGVuZXIodCxyKSxpLmNsYXNzTGlzdC5hZGQoXCJhbmltYXRlZFwiLGFbMF0pfTtpLmNsYXNzTGlzdC5jb250YWlucyhcImFuaW1hdGVkXCIpP28oaSk6cygpfSl9fTtcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlJiZ2b2lkIDAhPT1tb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1pOndpbmRvdy5BY3R1YXRlPWl9KCk7IiwiaW1wb3J0IHsgaCB9IGZyb20gJ2h5cGVyYXBwJ1xuaW1wb3J0IHsgZGl2LCBzcGFuIH0gZnJvbSAnQGh5cGVyYXBwL2h0bWwnXG5pbXBvcnQgeyAkaWNvbiB9IGZyb20gJy4uL2hlbHBlcnMvZWxlbWVudCdcblxuaW1wb3J0IEFjdHVhdGUgZnJvbSAnYWN0dWF0ZWpzJ1xuaW1wb3J0IGFuaW1hdGUgZnJvbSAnYW5pbWF0ZS5jc3MnXG5cbmV4cG9ydCBkZWZhdWx0IChhKSA9PlxuICBkaXYoe1xuICAgIGNsYXNzOiAncG9wdXAnLFxuICAgIG9uY3JlYXRlOiBlID0+IHtcbiAgICAgIEFjdHVhdGUoJ2ZhZGVJbiBmYWRlT3V0JykoZSkudGhlbihfID0+IGEuc2V0UG9wdXBWaXNpYmxlKGZhbHNlKSlcbiAgICB9XG4gIH0sIFtcbiAgICAkaWNvbignI2NoZWNrJyksXG4gICAgc3BhbignQWRkZWQgdG8gUXVldWUnKSxcbiAgXSkiLCJpbXBvcnQgeyBoIH0gZnJvbSAnaHlwZXJhcHAnXG5cbmltcG9ydCBTZWFyY2ggZnJvbSAnLi4vY29tcG9uZW50cy9zZWFyY2gnXG5pbXBvcnQgUGxheWVyIGZyb20gJy4uL2NvbXBvbmVudHMvcGxheWVyJ1xuaW1wb3J0IFBvcHVwIGZyb20gJy4uL2NvbXBvbmVudHMvcG9wdXAnXG5cbmV4cG9ydCBkZWZhdWx0IChzLGEpID0+XG4gIGgoJ2NvbWJpbmVkLXBhZ2UnLCB7fSwgW1xuICAgIHMudHJhY2suaWQgJiYgUGxheWVyKHMsYSksXG4gICAgU2VhcmNoKHMsYSksXG4gICAgcy5wb3B1cFZpc2libGUgJiYgUG9wdXAoYSksXG4gIF0pXG4iLCJpbXBvcnQgeyBoIH0gZnJvbSAnaHlwZXJhcHAnXG5cbmV4cG9ydCBkZWZhdWx0IChzLGEpID0+XG4gIGgoJ2gxJywgeyBvbmNsaWNrOiBlID0+IGEucm91dGVyLmdvKCcvJykgfSxcbiAgICBgQmFjayB0byAke2xvY2F0aW9uLmhvc3RuYW1lfWBcbiAgKVxuIiwiKGZ1bmN0aW9uKHNlbGYpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmIChzZWxmLmZldGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgc3VwcG9ydCA9IHtcbiAgICBzZWFyY2hQYXJhbXM6ICdVUkxTZWFyY2hQYXJhbXMnIGluIHNlbGYsXG4gICAgaXRlcmFibGU6ICdTeW1ib2wnIGluIHNlbGYgJiYgJ2l0ZXJhdG9yJyBpbiBTeW1ib2wsXG4gICAgYmxvYjogJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiYgJ0Jsb2InIGluIHNlbGYgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEJsb2IoKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgICBhcnJheUJ1ZmZlcjogJ0FycmF5QnVmZmVyJyBpbiBzZWxmXG4gIH1cblxuICBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlcikge1xuICAgIHZhciB2aWV3Q2xhc3NlcyA9IFtcbiAgICAgICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgICAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBGbG9hdDY0QXJyYXldJ1xuICAgIF1cblxuICAgIHZhciBpc0RhdGFWaWV3ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIERhdGFWaWV3LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKG9iailcbiAgICB9XG5cbiAgICB2YXIgaXNBcnJheUJ1ZmZlclZpZXcgPSBBcnJheUJ1ZmZlci5pc1ZpZXcgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIHZpZXdDbGFzc2VzLmluZGV4T2YoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpID4gLTFcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpXG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLlxcXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvLyBCdWlsZCBhIGRlc3RydWN0aXZlIGl0ZXJhdG9yIGZvciB0aGUgdmFsdWUgbGlzdFxuICBmdW5jdGlvbiBpdGVyYXRvckZvcihpdGVtcykge1xuICAgIHZhciBpdGVyYXRvciA9IHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBpdGVtcy5zaGlmdCgpXG4gICAgICAgIHJldHVybiB7ZG9uZTogdmFsdWUgPT09IHVuZGVmaW5lZCwgdmFsdWU6IHZhbHVlfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgICBpdGVyYXRvcltTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvclxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVyYXRvclxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9LCB0aGlzKVxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShoZWFkZXJzKSkge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgICB0aGlzLmFwcGVuZChoZWFkZXJbMF0sIGhlYWRlclsxXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIG9sZFZhbHVlID0gdGhpcy5tYXBbbmFtZV1cbiAgICB0aGlzLm1hcFtuYW1lXSA9IG9sZFZhbHVlID8gb2xkVmFsdWUrJywnK3ZhbHVlIDogdmFsdWVcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlWydkZWxldGUnXSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHJldHVybiB0aGlzLmhhcyhuYW1lKSA/IHRoaXMubWFwW25hbWVdIDogbnVsbFxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVOYW1lKG5hbWUpKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLm1hcCkge1xuICAgICAgaWYgKHRoaXMubWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdGhpcy5tYXBbbmFtZV0sIG5hbWUsIHRoaXMpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2gobmFtZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkgeyBpdGVtcy5wdXNoKHZhbHVlKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKFtuYW1lLCB2YWx1ZV0pIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICBIZWFkZXJzLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gSGVhZGVycy5wcm90b3R5cGUuZW50cmllc1xuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpXG4gICAgICB9XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEFycmF5QnVmZmVyQXNUZXh0KGJ1Zikge1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIHZhciBjaGFycyA9IG5ldyBBcnJheSh2aWV3Lmxlbmd0aClcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykge1xuICAgICAgY2hhcnNbaV0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXdbaV0pXG4gICAgfVxuICAgIHJldHVybiBjaGFycy5qb2luKCcnKVxuICB9XG5cbiAgZnVuY3Rpb24gYnVmZmVyQ2xvbmUoYnVmKSB7XG4gICAgaWYgKGJ1Zi5zbGljZSkge1xuICAgICAgcmV0dXJuIGJ1Zi5zbGljZSgwKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1Zi5ieXRlTGVuZ3RoKVxuICAgICAgdmlldy5zZXQobmV3IFVpbnQ4QXJyYXkoYnVmKSlcbiAgICAgIHJldHVybiB2aWV3LmJ1ZmZlclxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cbiAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkudG9TdHJpbmcoKVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIHN1cHBvcnQuYmxvYiAmJiBpc0RhdGFWaWV3KGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlBcnJheUJ1ZmZlciA9IGJ1ZmZlckNsb25lKGJvZHkuYnVmZmVyKVxuICAgICAgICAvLyBJRSAxMC0xMSBjYW4ndCBoYW5kbGUgYSBEYXRhVmlldyBib2R5LlxuICAgICAgICB0aGlzLl9ib2R5SW5pdCA9IG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIChBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSB8fCBpc0FycmF5QnVmZmVyVmlldyhib2R5KSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgQm9keUluaXQgdHlwZScpXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlCbG9iICYmIHRoaXMuX2JvZHlCbG9iLnR5cGUpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCB0aGlzLl9ib2R5QmxvYi50eXBlKVxuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBjb25zdW1lZCh0aGlzKSB8fCBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUFycmF5QnVmZmVyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVhZEFycmF5QnVmZmVyQXNUZXh0KHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmpzb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKEpTT04ucGFyc2UpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgcmV0dXJuIChtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSkgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keVxuXG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgaWYgKGlucHV0LmJvZHlVc2VkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpXG4gICAgICB9XG4gICAgICB0aGlzLnVybCA9IGlucHV0LnVybFxuICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzXG4gICAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbnB1dC5oZWFkZXJzKVxuICAgICAgfVxuICAgICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2RcbiAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGVcbiAgICAgIGlmICghYm9keSAmJiBpbnB1dC5fYm9keUluaXQgIT0gbnVsbCkge1xuICAgICAgICBib2R5ID0gaW5wdXQuX2JvZHlJbml0XG4gICAgICAgIGlucHV0LmJvZHlVc2VkID0gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVybCA9IFN0cmluZyhpbnB1dClcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdvbWl0J1xuICAgIGlmIChvcHRpb25zLmhlYWRlcnMgfHwgIXRoaXMuaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJylcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgYm9keSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICAgIH1cbiAgICB0aGlzLl9pbml0Qm9keShib2R5KVxuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcywgeyBib2R5OiB0aGlzLl9ib2R5SW5pdCB9KVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUhlYWRlcnMocmF3SGVhZGVycykge1xuICAgIHZhciBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKVxuICAgIHJhd0hlYWRlcnMuc3BsaXQoL1xccj9cXG4vKS5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHZhciBwYXJ0cyA9IGxpbmUuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHBhcnRzLnNoaWZ0KCkudHJpbSgpXG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHBhcnRzLmpvaW4oJzonKS50cmltKClcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoa2V5LCB2YWx1ZSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBoZWFkZXJzXG4gIH1cblxuICBCb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpXG5cbiAgZnVuY3Rpb24gUmVzcG9uc2UoYm9keUluaXQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgIH1cblxuICAgIHRoaXMudHlwZSA9ICdkZWZhdWx0J1xuICAgIHRoaXMuc3RhdHVzID0gJ3N0YXR1cycgaW4gb3B0aW9ucyA/IG9wdGlvbnMuc3RhdHVzIDogMjAwXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMFxuICAgIHRoaXMuc3RhdHVzVGV4dCA9ICdzdGF0dXNUZXh0JyBpbiBvcHRpb25zID8gb3B0aW9ucy5zdGF0dXNUZXh0IDogJ09LJ1xuICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsIHx8ICcnXG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKVxuXG4gIFJlc3BvbnNlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGhpcy5fYm9keUluaXQsIHtcbiAgICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXG4gICAgICBzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsXG4gICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh0aGlzLmhlYWRlcnMpLFxuICAgICAgdXJsOiB0aGlzLnVybFxuICAgIH0pXG4gIH1cblxuICBSZXNwb25zZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiAwLCBzdGF0dXNUZXh0OiAnJ30pXG4gICAgcmVzcG9uc2UudHlwZSA9ICdlcnJvcidcbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIHZhciByZWRpcmVjdFN0YXR1c2VzID0gWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XVxuXG4gIFJlc3BvbnNlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsLCBzdGF0dXMpIHtcbiAgICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBzdGF0dXMgY29kZScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG4gIH1cblxuICBzZWxmLkhlYWRlcnMgPSBIZWFkZXJzXG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3RcbiAgc2VsZi5SZXNwb25zZSA9IFJlc3BvbnNlXG5cbiAgc2VsZi5mZXRjaCA9IGZ1bmN0aW9uKGlucHV0LCBpbml0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdClcbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgIHN0YXR1czogeGhyLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBwYXJzZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIHx8ICcnKVxuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMudXJsID0gJ3Jlc3BvbnNlVVJMJyBpbiB4aHIgPyB4aHIucmVzcG9uc2VVUkwgOiBvcHRpb25zLmhlYWRlcnMuZ2V0KCdYLVJlcXVlc3QtVVJMJylcbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHRcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoYm9keSwgb3B0aW9ucykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbnRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9wZW4ocmVxdWVzdC5tZXRob2QsIHJlcXVlc3QudXJsLCB0cnVlKVxuXG4gICAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIgJiYgc3VwcG9ydC5ibG9iKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYidcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5oZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpXG4gICAgICB9KVxuXG4gICAgICB4aHIuc2VuZCh0eXBlb2YgcmVxdWVzdC5fYm9keUluaXQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHJlcXVlc3QuX2JvZHlJbml0KVxuICAgIH0pXG4gIH1cbiAgc2VsZi5mZXRjaC5wb2x5ZmlsbCA9IHRydWVcbn0pKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB0aGlzKTtcbiIsImltcG9ydCB7IGgsIGFwcCwgUm91dGVyIH0gZnJvbSAnaHlwZXJhcHAnXG5pbXBvcnQgc21vb3Roc2Nyb2xsIGZyb20gJ3Ntb290aHNjcm9sbC1wb2x5ZmlsbCdcblxuaW1wb3J0IHsgUGxheWVyIH0gZnJvbSAnLi9taXhpbnMvcGxheWVyJ1xuaW1wb3J0IHsgU2VhcmNoIH0gZnJvbSAnLi9taXhpbnMvc2VhcmNoJ1xuaW1wb3J0IHsgUGFydHkgfSBmcm9tICcuL21peGlucy9wYXJ0eSdcblxuaW1wb3J0IHBsYXlQYWdlIGZyb20gJy4vcGFnZXMvcGxheSdcbmltcG9ydCBsb3N0UGFnZSBmcm9tICcuL3BhZ2VzL2xvc3QnXG5cbmltcG9ydCB7IGlPUywgc2Nyb2xsVG9TZWFyY2ggfSBmcm9tICcuL2hlbHBlcnMvd2luZG93J1xuaW1wb3J0IHsgZmV0Y2hSZWxhdGVkIH0gZnJvbSAnLi9oZWxwZXJzL3lvdXR1YmUnXG5cbmltcG9ydCAnd2hhdHdnLWZldGNoJ1xuaW1wb3J0ICcuL2luZGV4LmNzcydcbmltcG9ydCAnLi9zcGlubmVyLmNzcydcbmltcG9ydCAnLi9wb3B1cC5jc3MnXG5cbi8vIENoZWNrIGZvciBhbnkgZ2l0aHViLXBhZ2VzIDQwNCByZWRpcmVjdFxuaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgbnVsbCwgc2Vzc2lvblN0b3JhZ2UucmVkaXJlY3QpXG5kZWxldGUgc2Vzc2lvblN0b3JhZ2UucmVkaXJlY3RcblxuLy8gUmVnaXN0ZXIgc2VydmljZSB3b3JrZXIgaWYgbm90IG9uIGxvY2FsaG9zdFxuY29uc3QgbG9jYWwgPSB3aW5kb3cubG9jYXRpb24uaG9zdC5zdGFydHNXaXRoKCdsb2NhbGhvc3QnKVxuaWYgKCdzZXJ2aWNlV29ya2VyJyBpbiBuYXZpZ2F0b3IgJiYgIWxvY2FsKSBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3RlcignL3N3LmpzJylcblxuc21vb3Roc2Nyb2xsLnBvbHlmaWxsKClcblxuY29uc3QgdXJsID0gJ2h0dHBzOi8vYXBpLmpvZXh0b2RkLmNvbSdcblxuYXBwKHtcbiAgc3RhdGU6IHtcbiAgICB0cmFjazoge30sXG4gICAgaXNGZXRjaGluZzogdHJ1ZSxcbiAgfSxcbiAgYWN0aW9uczoge1xuICAgIHNldEZldGNoaW5nOiAocyxhLGQpID0+ICh7IGlzRmV0Y2hpbmc6IGQgfSksXG4gICAgc2V0VHJhY2s6IChzLGEsZCkgPT4gKHsgdHJhY2s6IGQgfSksXG4gICAgcHJldlZpZGVvOiAocyxhLGQpID0+IHdpbmRvdy5oaXN0b3J5LmJhY2soKSxcbiAgICBuZXh0VmlkZW86IChzLGEsZCkgPT4ge1xuICAgICAgaWYgKHMucGFydHlJZCkge1xuICAgICAgICBhLm5leHRRVHJhY2soKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYS5zZXRGZXRjaGluZyh0cnVlKVxuICAgICAgICBhLnNldFRyYWNrKHsgaWQ6IHMudHJhY2suaWQgfSlcbiAgICAgICAgZmV0Y2hSZWxhdGVkKHMudHJhY2suaWQpXG4gICAgICAgICAgLnRoZW4oZGF0YSA9PiBkYXRhLml0ZW1zW3BhcnNlSW50KE1hdGgucmFuZG9tKCkgKiBkYXRhLml0ZW1zLmxlbmd0aCldLmlkLnZpZGVvSWQpXG4gICAgICAgICAgLnRoZW4oaWQgPT4gYS5yb3V0ZXIuZ28oYC8ke2lkfWApKVxuICAgICAgICAgIC5jYXRjaChjb25zb2xlLmxvZylcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldFZpZGVvOiAocyxhLGlkKSA9PiB7XG4gICAgICBhLnNldEVycm9yKGZhbHNlKVxuICAgICAgYS5zZXRGZXRjaGluZyh0cnVlKVxuICAgICAgYS5zZXRUcmFjayh7IGlkIH0pXG4gICAgICBhLnNldFBsYXlpbmcoIWlPUygpKVxuICAgICAgZmV0Y2goYCR7dXJsfS92aWRlby8ke2lkfWApXG4gICAgICAgIC50aGVuKHIgPT4gci5qc29uKCkpXG4gICAgICAgIC50aGVuKHRyYWNrID0+IHtcbiAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IHRyYWNrLnRpdGxlXG4gICAgICAgICAgYS5zZXRUcmFjayh0cmFjaylcbiAgICAgICAgICBhLnNldEZldGNoaW5nKGZhbHNlKVxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpXG4gICAgfVxuICB9LFxuICBldmVudHM6IHtcbiAgICByb3V0ZTogKHMsYSxkKSA9PiB7XG4gICAgICBpZiAoZC5tYXRjaCA9PT0gJy8nKSBzLnRyYWNrLmlkICYmIHNjcm9sbFRvU2VhcmNoKClcbiAgICAgIGlmIChkLm1hdGNoID09PSAnLzppZCcpIGEuZ2V0VmlkZW8oZC5wYXJhbXMuaWQpXG4gICAgICBpZiAoZC5tYXRjaCA9PT0gJy9wYXJ0eS86cGlkJykge1xuICAgICAgICBhLnNldFBhcnR5SWQoZC5wYXJhbXMucGlkKVxuICAgICAgICBhLmdldFBhcnR5USgpXG4gICAgICB9XG4gICAgfSxcbiAgfSxcbiAgdmlldzogW1xuICAgIFsnLycsIHBsYXlQYWdlXSxcbiAgICBbJy86aWQnLCBwbGF5UGFnZV0sXG4gICAgWycvcGFydHkvOnBpZCcsIHBsYXlQYWdlXSxcbiAgICBbJyonLCBsb3N0UGFnZV0sXG4gIF0sXG4gIG1peGluczogW1JvdXRlciwgUGxheWVyLCBTZWFyY2gsIFBhcnR5XSxcbn0pXG4iXSwibmFtZXMiOlsiYXJndW1lbnRzIiwiY29uc3QiLCJsZXQiLCJ1cmwiLCIkdGl0bGUiLCJpIiwiaCIsImEiLCJBY3R1YXRlIiwiUGxheWVyIiwiU2VhcmNoIiwidGhpcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLFFBQWUsU0FBUyxHQUFHLEVBQUUsSUFBSSxFQUFFOzs7RUFDakMsSUFBSSxLQUFJO0VBQ1IsSUFBSSxLQUFLLEdBQUcsR0FBRTtFQUNkLElBQUksUUFBUSxHQUFHLEdBQUU7O0VBRWpCLEtBQUssSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUk7SUFDeEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBR0EsV0FBUyxDQUFDLENBQUMsRUFBQztHQUNuQzs7RUFFRCxPQUFPLEtBQUssQ0FBQyxNQUFNLEVBQUU7SUFDbkIsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRTtNQUN2QyxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUk7UUFDL0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFDO09BQzlCO0tBQ0YsTUFBTSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFO01BQzFELElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO1FBQzVCLElBQUksR0FBRyxJQUFJLEdBQUcsR0FBRTtPQUNqQjtNQUNELFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSTtLQUNqQztHQUNGOztFQUVELE9BQU8sT0FBTyxHQUFHLEtBQUssUUFBUTtNQUMxQjtRQUNFLEdBQUcsRUFBRSxHQUFHO1FBQ1IsSUFBSSxFQUFFLElBQUks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QUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBQztPQUNqQyxFQUFFLElBQUksRUFBQztLQUNUO0dBQ0Y7O0VBRUQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxJQUFJLEVBQUUsS0FBSyxFQUFFO0lBQy9DLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxFQUFDO0lBQzFCLEtBQUssR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFDO0lBQzdCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFDO0lBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLE1BQUs7SUFDdkQ7O0VBRUQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxTQUFTLElBQUksRUFBRTtJQUMzQyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFDO0lBQ3JDOztFQUVELE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFNBQVMsSUFBSSxFQUFFO0lBQ3JDLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxFQUFDO0lBQzFCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUk7SUFDOUM7O0VBRUQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsU0FBUyxJQUFJLEVBQUU7SUFDckMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEQ7O0VBRUQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsU0FBUyxJQUFJLEVBQUUsS0FBSyxFQUFFO0lBQzVDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBQztJQUN0RDs7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
