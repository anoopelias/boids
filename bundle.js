/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = inherits

function inherits (c, p, proto) {
  proto = proto || {}
  var e = {}
  ;[c.prototype, proto].forEach(function (s) {
    Object.getOwnPropertyNames(s).forEach(function (k) {
      e[k] = Object.getOwnPropertyDescriptor(s, k)
    })
  })
  c.prototype = Object.create(p.prototype, e)
  c.super = p
}

//function Child () {
//  Child.super.call(this)
//  console.error([this
//                ,this.constructor
//                ,this.constructor === Child
//                ,this.constructor.super === Parent
//                ,Object.getPrototypeOf(this) === Child.prototype
//                ,Object.getPrototypeOf(Object.getPrototypeOf(this))
//                 === Parent.prototype
//                ,this instanceof Child
//                ,this instanceof Parent])
//}
//function Parent () {}
//inherits(Child, Parent)
//new Child


/***/ }),
/* 2 */
/***/ (function(module, exports) {

function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.add = function (v) {
  return new Vector(this.x + v.x, this.y + v.y);
};

Vector.prototype.distSquared = function (v) {
  return Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2);
};

Vector.prototype.distance = function (v) {
  return Math.sqrt(this.distSquared(v));
};

Vector.prototype.multiplyBy = function (s) {
  return new Vector(this.x * s, this.y * s);
};

Vector.prototype.neg = function (v) {
  return new Vector(-this.x, -this.y);
};

Vector.prototype.magnitude = function () {
  return this.distance(new Vector(0, 0));
};

Vector.prototype.normalize = function () {
  var magnitude = this.magnitude();

  if (magnitude === 0) return new Vector(0, 0);

  return new Vector(this.x / magnitude, this.y / magnitude);
};

Vector.prototype.subtract = function (v) {
  return this.add(v.neg());
};

Vector.prototype.divideBy = function (s) {
  return this.multiplyBy(1 / s);
};

Vector.prototype.limit = function (s) {
  if (this.magnitude() > s) return this.normalize().multiplyBy(s);

  return this;
};

Vector.prototype.angle = function (p1, p2) {
  var v1 = this.subtract(p1).normalize(),
      v2 = this.subtract(p2).normalize(),

  // Rounding is because sometimes the value goes beyond 1.0
  // due to floating point precision errors
  cos = Math.round((v1.x * v2.x + v1.y * v2.y) * 10000) / 10000;

  return Math.acos(cos);
};

Vector.prototype.compare = function (that, y) {
  return y && (this.y - that.y || this.x - that.x) || this.x - that.x || this.y - that.y;
};

Vector.prototype.toString = function () {
  return "{x:" + this.x + ", y:" + this.y + "}";
};

module.exports = Vector;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = Boid;

function Boid(position, speed) {
  this.position = position;
  this.speed = speed;
}

Boid.prototype.compare = function (that, isEven) {
  return this.position.compare(that.position, isEven);
};

Boid.prototype.toString = function () {
  return this.position.toString();
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var fps = __webpack_require__(5),
    ticker = __webpack_require__(6),
    debounce = __webpack_require__(12),
    Boids = __webpack_require__(13),
    Vector = __webpack_require__(2),
    Boid = __webpack_require__(3);

var anchor = document.createElement("a"),
    canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d"),
    boids = Boids();

canvas.addEventListener("click", function (e) {
  var x = e.pageX,
      y = e.pageY,
      halfHeight = canvas.height / 2,
      halfWidth = canvas.width / 2;
  x = x - halfWidth;
  y = y - halfHeight;
  if (boids.boids.length < 500) boids.boids.push(new Boid(new Vector(x, y), new Vector(Math.random() * 6 - 3, Math.random() * 6 - 3)));
});

window.onresize = debounce(function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}, 100);
window.onresize();

anchor.setAttribute("href", "#");
anchor.appendChild(canvas);
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.appendChild(anchor);

ticker(window, 60).on("tick", function () {
  frames.tick();
  boids.tick();
}).on("draw", function () {
  var boidData = boids.boids,
      halfHeight = canvas.height / 2,
      halfWidth = canvas.width / 2;

  ctx.fillStyle = "rgba(255,241,235,0.25)"; // '#FFF1EB'
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#543D5E";
  for (var i = 0, l = boidData.length, x, y; i < l; i += 1) {
    x = boidData[i].position.x;
    y = boidData[i].position.y;
    // wrap around the screen
    boidData[i].position.x = x > halfWidth ? -halfWidth : -x > halfWidth ? halfWidth : x;
    boidData[i].position.y = y > halfHeight ? -halfHeight : -y > halfHeight ? halfHeight : y;
    ctx.fillRect(x + halfWidth, y + halfHeight, 2, 2);
  }
});

var frameText = document.querySelector("[data-fps]");
var countText = document.querySelector("[data-count]");
var frames = fps({ every: 10, decay: 0.04 }).on("data", function (rate) {
  for (var i = 0; i < 3; i += 1) {
    if (rate <= 56 && boids.boids.length > 10) boids.boids.pop();
    if (rate >= 60 && boids.boids.length < 300) boids.boids.push(new Boid(new Vector(0, 0), new Vector(Math.random() * 6 - 3, Math.random() * 6 - 3)));
  }
  frameText.innerHTML = String(Math.round(rate));
  countText.innerHTML = String(boids.boids.length);
});

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(0).EventEmitter
  , inherits = __webpack_require__(1)

module.exports = fps

// Try use performance.now(), otherwise try
// +new Date.
var now = (
  (function(){ return this }()).performance &&
  'function' === typeof performance.now
) ? function() { return performance.now() }
  : Date.now || function() { return +new Date }

function fps(opts) {
  if (!(this instanceof fps)) return new fps(opts)
  EventEmitter.call(this)

  opts = opts || {}
  this.last = now()
  this.rate = 0
  this.time = 0
  this.decay = opts.decay || 1
  this.every = opts.every || 1
  this.ticks = 0
}
inherits(fps, EventEmitter)

fps.prototype.tick = function() {
  var time = now()
    , diff = time - this.last
    , fps = diff

  this.ticks += 1
  this.last = time
  this.time += (fps - this.time) * this.decay
  this.rate = 1000 / this.time
  if (!(this.ticks % this.every)) this.emit('data', this.rate)
}



/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var raf = __webpack_require__(7)
  , EventEmitter = __webpack_require__(0).EventEmitter

module.exports = ticker

function ticker(element, rate, limit) {
  var millisecondsPerFrame = 1000 / (rate || 60)
    , time = 0
    , emitter

  limit = arguments.length > 2 ? +limit + 1 : 2
  emitter = raf(element || window).on('data', function(dt) {
    var n = limit

    time += dt
    while (time > millisecondsPerFrame && n) {
      time -= millisecondsPerFrame
      n -= 1
      emitter.emit('tick')
    }
    time = (time + millisecondsPerFrame * 1000) % millisecondsPerFrame

    if (n !== limit) emitter.emit('draw')
  })

  return emitter
}


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(setImmediate) {module.exports = raf

var EE = __webpack_require__(0).EventEmitter
  , global = typeof window === 'undefined' ? this : window
  , now = Date.now || function () { return +new Date() }

var _raf =
  global.requestAnimationFrame ||
  global.webkitRequestAnimationFrame ||
  global.mozRequestAnimationFrame ||
  global.msRequestAnimationFrame ||
  global.oRequestAnimationFrame ||
  (global.setImmediate ? function(fn, el) {
    setImmediate(fn)
  } :
  function(fn, el) {
    setTimeout(fn, 0)
  })

function raf(el) {
  var now = raf.now()
    , ee = new EE

  ee.pause = function() { ee.paused = true }
  ee.resume = function() { ee.paused = false }

  _raf(iter, el)

  return ee

  function iter(timestamp) {
    var _now = raf.now()
      , dt = _now - now
    
    now = _now

    ee.emit('data', dt)

    if(!ee.paused) {
      _raf(iter, el)
    }
  }
}

raf.polyfill = _raf
raf.now = now


/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8).setImmediate))

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(9);
exports.setImmediate = setImmediate;
exports.clearImmediate = clearImmediate;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10), __webpack_require__(11)))

/***/ }),
/* 10 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 11 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 12 */
/***/ (function(module, exports) {

/**
 * Debounces a function by the given threshold.
 *
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`true`)
 * @api public
 */

module.exports = function debounce(func, threshold, execAsap){
  var timeout;
  if (false !== execAsap) execAsap = true;

  return function debounced(){
    var obj = this, args = arguments;

    function delayed () {
      if (!execAsap) {
        func.apply(obj, args);
      }
      timeout = null;
    }

    if (timeout) {
      clearTimeout(timeout);
    } else if (execAsap) {
      func.apply(obj, args);
    }

    timeout = setTimeout(delayed, threshold || 100);
  };
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(0).EventEmitter,
    inherits = __webpack_require__(1),
    Vector = __webpack_require__(2),
    Dtree = __webpack_require__(14),
    Boid = __webpack_require__(3);

module.exports = Boids;

function Boids(opts, callback) {
  if (!(this instanceof Boids)) return new Boids(opts, callback);
  EventEmitter.call(this);

  opts = opts || {};
  callback = callback || function () {};

  this.speedLimit = opts.speedLimit || 1;
  this.accelerationLimit = opts.accelerationLimit || 0.03;
  this.separationDistance = opts.separationDistance || 30;
  this.separationDistanceSq = Math.pow(this.separationDistance, 2);
  this.alignmentDistance = opts.alignmentDistance || 60;
  this.alignmentDistanceSq = Math.pow(this.alignmentDistance, 2);
  this.cohesionDistance = opts.cohesionDistance || 60;
  this.cohesionDistanceSq = Math.pow(this.cohesionDistance, 2);
  this.separationForce = opts.separationForce || 2;
  this.cohesionForce = opts.cohesionForce || 1;
  this.alignmentForce = opts.alignmentForce || opts.alignment || 1;
  this.maxDistSq = Math.max(this.separationDistanceSq, this.cohesionDistanceSq, this.alignmentDistanceSq);

  var boids = this.boids = [];

  for (var i = 0, l = opts.boids === undefined ? 150 : opts.boids; i < l; i += 1) {
    boids[i] = new Boid(new Vector(Math.random() * 100 - 50, Math.random() * 100 - 50), new Vector(0, 0));
  }

  this.on("tick", function () {
    callback(boids);
  });
}
inherits(Boids, EventEmitter);

Boids.prototype.init = function () {
  var dtree = new Dtree();
  for (var i = 0; i < this.boids.length; i++) {
    dtree.insert(this.boids[i]);
  }

  this.tickData = {};
  this.tickData.dtree = dtree;
};

Boids.prototype.findNeighbors = function (point) {
  this.tickData.neighbors = this.tickData.dtree.neighbors(point, this.maxDistSq);
};

Boids.prototype.calcCohesion = function (boid) {
  var total = new Vector(0, 0),
      distSq,
      target,
      neighbors = this.tickData.neighbors,
      count = 0;

  for (var i = 0; i < neighbors.length; i++) {
    target = neighbors[i].neighbor;
    if (boid === target) continue;

    distSq = neighbors[i].distSq;
    if (distSq < this.cohesionDistanceSq && isInFrontOf(boid, target.position)) {
      total = total.add(target.position);
      count++;
    }
  }

  if (count === 0) return new Vector(0, 0);

  return total.divideBy(count).subtract(boid.position).normalize().subtract(boid.speed).limit(this.accelerationLimit);
};

Boids.prototype.calcSeparation = function (boid) {
  var total = new Vector(0, 0),
      target,
      distSq,
      neighbors = this.tickData.neighbors,
      count = 0;

  for (var i = 0; i < neighbors.length; i++) {
    target = neighbors[i].neighbor;
    if (boid === target) continue;

    distSq = neighbors[i].distSq;
    if (distSq < this.separationDistanceSq) {
      total = total.add(target.position.subtract(boid.position).normalize().divideBy(target.position.distance(boid.position)));
      count++;
    }
  }

  if (count === 0) return new Vector(0, 0);

  return total.divideBy(count).normalize().add(boid.speed) // Adding speed instead of subtracting because separation is repulsive
  .limit(this.accelerationLimit);
};

Boids.prototype.calcAlignment = function (boid) {
  var total = new Vector(0, 0),
      target,
      distSq,
      neighbors = this.tickData.neighbors,
      count = 0;

  for (var i = 0; i < neighbors.length; i++) {
    target = this.tickData.neighbors[i].neighbor;
    if (boid === target) continue;

    distSq = neighbors[i].distSq;
    if (distSq < this.alignmentDistanceSq && isInFrontOf(boid, target.position)) {
      total = total.add(target.speed);
      count++;
    }
  }

  if (count === 0) return new Vector(0, 0);

  return total.divideBy(count).normalize().subtract(boid.speed).limit(this.accelerationLimit);
};

Boids.prototype.tick = function () {
  var boid;
  this.init();

  for (var i = 0; i < this.boids.length; i++) {
    boid = this.boids[i];
    this.findNeighbors(boid.position);

    boid.acceleration = this.calcCohesion(boid).multiplyBy(this.cohesionForce).add(this.calcAlignment(boid).multiplyBy(this.alignmentForce)).subtract(this.calcSeparation(boid).multiplyBy(this.separationForce));
  }

  delete this.tickData;

  for (var j = 0; j < this.boids.length; j++) {
    boid = this.boids[j];
    boid.speed = boid.speed.add(boid.acceleration).limit(this.speedLimit);

    boid.position = boid.position.add(boid.speed);
    delete boid.acceleration;
  }

  this.emit("tick", this.boids);
};

function isInFrontOf(boid, point) {
  return boid.position.angle(boid.position.add(boid.speed), point) <= Math.PI / 3;
}

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = Dtree;

function Dtree() {
  this.size = 0;
}

Dtree.prototype.insert = function (obj) {
  this.root = insert(this.root, obj, false);
};

Dtree.prototype.contains = function (obj) {
  return contains(this.root, obj);
};

Dtree.prototype.toString = function () {
  return toString(this.root);
};

Dtree.prototype.neighbors = function (point, radiusSq) {
  var objects = [],
      stack = [this.root],
      distSq,
      distX,
      distY,
      node,
      cmp,
      position,
      dist2line;

  // Not speeding up enough with recursion
  while (stack.length > 0) {
    node = stack.pop();
    position = node.value.position;
    isEven = node.isEven;

    distX = point.x - position.x;
    distY = point.y - position.y;
    distSq = distX * distX + distY * distY;

    if (distSq <= radiusSq) objects.push({
      neighbor: node.value,
      distSq: distSq
    });

    cmp = isEven ? distY || distX : distX || distY;
    dist2line = Math.pow(isEven ? distY : distX, 2);

    if (node.left && (cmp <= 0 || dist2line <= radiusSq)) stack.push(node.left);

    if (node.right && (cmp >= 0 || dist2line <= radiusSq)) stack.push(node.right);
  }

  return objects;
};

function insert(node, obj, isEven) {
  if (!node) {
    return { value: obj, isEven: isEven };
  }

  var cmp = obj.compare(node.value, isEven);
  if (cmp < 0) {
    node.left = insert(node.left, obj, !isEven);
  } else if (cmp > 0) {
    node.right = insert(node.right, obj, !isEven);
  }

  return node;
}

function contains(node, obj, isEven) {
  if (!node) return false;

  var cmp = obj.compare(node.value, isEven);

  if (cmp < 0) return contains(node.left, obj, !isEven);else if (cmp > 0) return contains(node.right, obj, !isEven);

  return true;
}

function toString(node) {
  if (!node) {
    return "";
  }

  return "{ L:" + toString(node.left) + ", N:" + node.value + ", R:" + toString(node.right) + "}";
}

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYmFjYmJkNDE5MGJjMjliZTEwNzkiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzLmpzIiwid2VicGFjazovLy8uL2pzL3ZlY3Rvci5qcyIsIndlYnBhY2s6Ly8vLi9qcy9ib2lkLmpzIiwid2VicGFjazovLy8uL2pzL2RlbW8uanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2Zwcy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdGlja2VyL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9yYWYvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3NldGltbWVkaWF0ZS9zZXRJbW1lZGlhdGUuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9kZWJvdW5jZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9kdHJlZS5qcyJdLCJuYW1lcyI6WyJWZWN0b3IiLCJ4IiwieSIsInByb3RvdHlwZSIsImFkZCIsInYiLCJkaXN0U3F1YXJlZCIsIk1hdGgiLCJwb3ciLCJkaXN0YW5jZSIsInNxcnQiLCJtdWx0aXBseUJ5IiwicyIsIm5lZyIsIm1hZ25pdHVkZSIsIm5vcm1hbGl6ZSIsInN1YnRyYWN0IiwiZGl2aWRlQnkiLCJsaW1pdCIsImFuZ2xlIiwicDEiLCJwMiIsInYxIiwidjIiLCJjb3MiLCJyb3VuZCIsImFjb3MiLCJjb21wYXJlIiwidGhhdCIsInRvU3RyaW5nIiwibW9kdWxlIiwiZXhwb3J0cyIsIkJvaWQiLCJwb3NpdGlvbiIsInNwZWVkIiwiaXNFdmVuIiwiZnBzIiwicmVxdWlyZSIsInRpY2tlciIsImRlYm91bmNlIiwiQm9pZHMiLCJhbmNob3IiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJjYW52YXMiLCJjdHgiLCJnZXRDb250ZXh0IiwiYm9pZHMiLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsInBhZ2VYIiwicGFnZVkiLCJoYWxmSGVpZ2h0IiwiaGVpZ2h0IiwiaGFsZldpZHRoIiwid2lkdGgiLCJsZW5ndGgiLCJwdXNoIiwicmFuZG9tIiwid2luZG93Iiwib25yZXNpemUiLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJzZXRBdHRyaWJ1dGUiLCJhcHBlbmRDaGlsZCIsImJvZHkiLCJzdHlsZSIsIm1hcmdpbiIsInBhZGRpbmciLCJvbiIsImZyYW1lcyIsInRpY2siLCJib2lkRGF0YSIsImZpbGxTdHlsZSIsImZpbGxSZWN0IiwiaSIsImwiLCJmcmFtZVRleHQiLCJxdWVyeVNlbGVjdG9yIiwiY291bnRUZXh0IiwiZXZlcnkiLCJkZWNheSIsInJhdGUiLCJwb3AiLCJpbm5lckhUTUwiLCJTdHJpbmciLCJFdmVudEVtaXR0ZXIiLCJpbmhlcml0cyIsIkR0cmVlIiwib3B0cyIsImNhbGxiYWNrIiwiY2FsbCIsInNwZWVkTGltaXQiLCJhY2NlbGVyYXRpb25MaW1pdCIsInNlcGFyYXRpb25EaXN0YW5jZSIsInNlcGFyYXRpb25EaXN0YW5jZVNxIiwiYWxpZ25tZW50RGlzdGFuY2UiLCJhbGlnbm1lbnREaXN0YW5jZVNxIiwiY29oZXNpb25EaXN0YW5jZSIsImNvaGVzaW9uRGlzdGFuY2VTcSIsInNlcGFyYXRpb25Gb3JjZSIsImNvaGVzaW9uRm9yY2UiLCJhbGlnbm1lbnRGb3JjZSIsImFsaWdubWVudCIsIm1heERpc3RTcSIsIm1heCIsInVuZGVmaW5lZCIsImluaXQiLCJkdHJlZSIsImluc2VydCIsInRpY2tEYXRhIiwiZmluZE5laWdoYm9ycyIsInBvaW50IiwibmVpZ2hib3JzIiwiY2FsY0NvaGVzaW9uIiwiYm9pZCIsInRvdGFsIiwiZGlzdFNxIiwidGFyZ2V0IiwiY291bnQiLCJuZWlnaGJvciIsImlzSW5Gcm9udE9mIiwiY2FsY1NlcGFyYXRpb24iLCJjYWxjQWxpZ25tZW50IiwiYWNjZWxlcmF0aW9uIiwiaiIsImVtaXQiLCJQSSIsInNpemUiLCJvYmoiLCJyb290IiwiY29udGFpbnMiLCJyYWRpdXNTcSIsIm9iamVjdHMiLCJzdGFjayIsImRpc3RYIiwiZGlzdFkiLCJub2RlIiwiY21wIiwiZGlzdDJsaW5lIiwidmFsdWUiLCJsZWZ0IiwicmlnaHQiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxlQUFlLFNBQVM7QUFDeEI7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEdBQUc7QUFDSCxvQkFBb0IsU0FBUztBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7Ozs7OztBQzdTQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQzVCQSxTQUFTQSxNQUFULENBQWdCQyxDQUFoQixFQUFtQkMsQ0FBbkIsRUFBc0I7QUFDcEIsT0FBS0QsQ0FBTCxHQUFTQSxDQUFUO0FBQ0EsT0FBS0MsQ0FBTCxHQUFTQSxDQUFUO0FBQ0Q7O0FBRURGLE9BQU9HLFNBQVAsQ0FBaUJDLEdBQWpCLEdBQXVCLFVBQVNDLENBQVQsRUFBWTtBQUNqQyxTQUFPLElBQUlMLE1BQUosQ0FBVyxLQUFLQyxDQUFMLEdBQVNJLEVBQUVKLENBQXRCLEVBQXlCLEtBQUtDLENBQUwsR0FBU0csRUFBRUgsQ0FBcEMsQ0FBUDtBQUNELENBRkQ7O0FBSUFGLE9BQU9HLFNBQVAsQ0FBaUJHLFdBQWpCLEdBQStCLFVBQVNELENBQVQsRUFBWTtBQUN6QyxTQUFPRSxLQUFLQyxHQUFMLENBQVMsS0FBS1AsQ0FBTCxHQUFTSSxFQUFFSixDQUFwQixFQUF1QixDQUF2QixJQUE0Qk0sS0FBS0MsR0FBTCxDQUFTLEtBQUtOLENBQUwsR0FBU0csRUFBRUgsQ0FBcEIsRUFBdUIsQ0FBdkIsQ0FBbkM7QUFDRCxDQUZEOztBQUlBRixPQUFPRyxTQUFQLENBQWlCTSxRQUFqQixHQUE0QixVQUFTSixDQUFULEVBQVk7QUFDdEMsU0FBT0UsS0FBS0csSUFBTCxDQUFVLEtBQUtKLFdBQUwsQ0FBaUJELENBQWpCLENBQVYsQ0FBUDtBQUNELENBRkQ7O0FBSUFMLE9BQU9HLFNBQVAsQ0FBaUJRLFVBQWpCLEdBQThCLFVBQVNDLENBQVQsRUFBWTtBQUN4QyxTQUFPLElBQUlaLE1BQUosQ0FBVyxLQUFLQyxDQUFMLEdBQVNXLENBQXBCLEVBQXVCLEtBQUtWLENBQUwsR0FBU1UsQ0FBaEMsQ0FBUDtBQUNELENBRkQ7O0FBSUFaLE9BQU9HLFNBQVAsQ0FBaUJVLEdBQWpCLEdBQXVCLFVBQVNSLENBQVQsRUFBWTtBQUNqQyxTQUFPLElBQUlMLE1BQUosQ0FBVyxDQUFDLEtBQUtDLENBQWpCLEVBQW9CLENBQUMsS0FBS0MsQ0FBMUIsQ0FBUDtBQUNELENBRkQ7O0FBSUFGLE9BQU9HLFNBQVAsQ0FBaUJXLFNBQWpCLEdBQTZCLFlBQVc7QUFDdEMsU0FBTyxLQUFLTCxRQUFMLENBQWMsSUFBSVQsTUFBSixDQUFXLENBQVgsRUFBYyxDQUFkLENBQWQsQ0FBUDtBQUNELENBRkQ7O0FBSUFBLE9BQU9HLFNBQVAsQ0FBaUJZLFNBQWpCLEdBQTZCLFlBQVc7QUFDdEMsTUFBSUQsWUFBWSxLQUFLQSxTQUFMLEVBQWhCOztBQUVBLE1BQUlBLGNBQWMsQ0FBbEIsRUFBcUIsT0FBTyxJQUFJZCxNQUFKLENBQVcsQ0FBWCxFQUFjLENBQWQsQ0FBUDs7QUFFckIsU0FBTyxJQUFJQSxNQUFKLENBQVcsS0FBS0MsQ0FBTCxHQUFTYSxTQUFwQixFQUErQixLQUFLWixDQUFMLEdBQVNZLFNBQXhDLENBQVA7QUFDRCxDQU5EOztBQVFBZCxPQUFPRyxTQUFQLENBQWlCYSxRQUFqQixHQUE0QixVQUFTWCxDQUFULEVBQVk7QUFDdEMsU0FBTyxLQUFLRCxHQUFMLENBQVNDLEVBQUVRLEdBQUYsRUFBVCxDQUFQO0FBQ0QsQ0FGRDs7QUFJQWIsT0FBT0csU0FBUCxDQUFpQmMsUUFBakIsR0FBNEIsVUFBU0wsQ0FBVCxFQUFZO0FBQ3RDLFNBQU8sS0FBS0QsVUFBTCxDQUFnQixJQUFJQyxDQUFwQixDQUFQO0FBQ0QsQ0FGRDs7QUFJQVosT0FBT0csU0FBUCxDQUFpQmUsS0FBakIsR0FBeUIsVUFBU04sQ0FBVCxFQUFZO0FBQ25DLE1BQUksS0FBS0UsU0FBTCxLQUFtQkYsQ0FBdkIsRUFBMEIsT0FBTyxLQUFLRyxTQUFMLEdBQWlCSixVQUFqQixDQUE0QkMsQ0FBNUIsQ0FBUDs7QUFFMUIsU0FBTyxJQUFQO0FBQ0QsQ0FKRDs7QUFNQVosT0FBT0csU0FBUCxDQUFpQmdCLEtBQWpCLEdBQXlCLFVBQVNDLEVBQVQsRUFBYUMsRUFBYixFQUFpQjtBQUN4QyxNQUFJQyxLQUFLLEtBQUtOLFFBQUwsQ0FBY0ksRUFBZCxFQUFrQkwsU0FBbEIsRUFBVDtBQUFBLE1BQ0VRLEtBQUssS0FBS1AsUUFBTCxDQUFjSyxFQUFkLEVBQWtCTixTQUFsQixFQURQOztBQUVFO0FBQ0E7QUFDQVMsUUFBTWpCLEtBQUtrQixLQUFMLENBQVcsQ0FBQ0gsR0FBR3JCLENBQUgsR0FBT3NCLEdBQUd0QixDQUFWLEdBQWNxQixHQUFHcEIsQ0FBSCxHQUFPcUIsR0FBR3JCLENBQXpCLElBQThCLEtBQXpDLElBQWtELEtBSjFEOztBQU1BLFNBQU9LLEtBQUttQixJQUFMLENBQVVGLEdBQVYsQ0FBUDtBQUNELENBUkQ7O0FBVUF4QixPQUFPRyxTQUFQLENBQWlCd0IsT0FBakIsR0FBMkIsVUFBU0MsSUFBVCxFQUFlMUIsQ0FBZixFQUFrQjtBQUMzQyxTQUNHQSxNQUFNLEtBQUtBLENBQUwsR0FBUzBCLEtBQUsxQixDQUFkLElBQW1CLEtBQUtELENBQUwsR0FBUzJCLEtBQUszQixDQUF2QyxDQUFELElBQ0MsS0FBS0EsQ0FBTCxHQUFTMkIsS0FBSzNCLENBQWQsSUFBbUIsS0FBS0MsQ0FBTCxHQUFTMEIsS0FBSzFCLENBRnBDO0FBSUQsQ0FMRDs7QUFPQUYsT0FBT0csU0FBUCxDQUFpQjBCLFFBQWpCLEdBQTRCLFlBQVc7QUFDckMsU0FBTyxRQUFRLEtBQUs1QixDQUFiLEdBQWlCLE1BQWpCLEdBQTBCLEtBQUtDLENBQS9CLEdBQW1DLEdBQTFDO0FBQ0QsQ0FGRDs7QUFJQTRCLE9BQU9DLE9BQVAsR0FBaUIvQixNQUFqQixDOzs7Ozs7QUN4RUE4QixPQUFPQyxPQUFQLEdBQWlCQyxJQUFqQjs7QUFFQSxTQUFTQSxJQUFULENBQWNDLFFBQWQsRUFBd0JDLEtBQXhCLEVBQStCO0FBQzdCLE9BQUtELFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0EsT0FBS0MsS0FBTCxHQUFhQSxLQUFiO0FBQ0Q7O0FBRURGLEtBQUs3QixTQUFMLENBQWV3QixPQUFmLEdBQXlCLFVBQVNDLElBQVQsRUFBZU8sTUFBZixFQUF1QjtBQUM5QyxTQUFPLEtBQUtGLFFBQUwsQ0FBY04sT0FBZCxDQUFzQkMsS0FBS0ssUUFBM0IsRUFBcUNFLE1BQXJDLENBQVA7QUFDRCxDQUZEOztBQUlBSCxLQUFLN0IsU0FBTCxDQUFlMEIsUUFBZixHQUEwQixZQUFXO0FBQ25DLFNBQU8sS0FBS0ksUUFBTCxDQUFjSixRQUFkLEVBQVA7QUFDRCxDQUZELEM7Ozs7OztBQ1hBLElBQUlPLE1BQU0sbUJBQUFDLENBQVEsQ0FBUixDQUFWO0FBQUEsSUFDRUMsU0FBUyxtQkFBQUQsQ0FBUSxDQUFSLENBRFg7QUFBQSxJQUVFRSxXQUFXLG1CQUFBRixDQUFRLEVBQVIsQ0FGYjtBQUFBLElBR0VHLFFBQVEsbUJBQUFILENBQVEsRUFBUixDQUhWO0FBQUEsSUFJRXJDLFNBQVMsbUJBQUFxQyxDQUFRLENBQVIsQ0FKWDtBQUFBLElBS0VMLE9BQU8sbUJBQUFLLENBQVEsQ0FBUixDQUxUOztBQU9BLElBQUlJLFNBQVNDLFNBQVNDLGFBQVQsQ0FBdUIsR0FBdkIsQ0FBYjtBQUFBLElBQ0VDLFNBQVNGLFNBQVNDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FEWDtBQUFBLElBRUVFLE1BQU1ELE9BQU9FLFVBQVAsQ0FBa0IsSUFBbEIsQ0FGUjtBQUFBLElBR0VDLFFBQVFQLE9BSFY7O0FBS0FJLE9BQU9JLGdCQUFQLENBQXdCLE9BQXhCLEVBQWlDLFVBQVNDLENBQVQsRUFBWTtBQUMzQyxNQUFJaEQsSUFBSWdELEVBQUVDLEtBQVY7QUFBQSxNQUNFaEQsSUFBSStDLEVBQUVFLEtBRFI7QUFBQSxNQUVFQyxhQUFhUixPQUFPUyxNQUFQLEdBQWdCLENBRi9CO0FBQUEsTUFHRUMsWUFBWVYsT0FBT1csS0FBUCxHQUFlLENBSDdCO0FBSUF0RCxNQUFJQSxJQUFJcUQsU0FBUjtBQUNBcEQsTUFBSUEsSUFBSWtELFVBQVI7QUFDQSxNQUFJTCxNQUFNQSxLQUFOLENBQVlTLE1BQVosR0FBcUIsR0FBekIsRUFDRVQsTUFBTUEsS0FBTixDQUFZVSxJQUFaLENBQ0UsSUFBSXpCLElBQUosQ0FDRSxJQUFJaEMsTUFBSixDQUFXQyxDQUFYLEVBQWNDLENBQWQsQ0FERixFQUVFLElBQUlGLE1BQUosQ0FBV08sS0FBS21ELE1BQUwsS0FBZ0IsQ0FBaEIsR0FBb0IsQ0FBL0IsRUFBa0NuRCxLQUFLbUQsTUFBTCxLQUFnQixDQUFoQixHQUFvQixDQUF0RCxDQUZGLENBREY7QUFNSCxDQWREOztBQWdCQUMsT0FBT0MsUUFBUCxHQUFrQnJCLFNBQVMsWUFBVztBQUNwQ0ssU0FBT1csS0FBUCxHQUFlSSxPQUFPRSxVQUF0QjtBQUNBakIsU0FBT1MsTUFBUCxHQUFnQk0sT0FBT0csV0FBdkI7QUFDRCxDQUhpQixFQUdmLEdBSGUsQ0FBbEI7QUFJQUgsT0FBT0MsUUFBUDs7QUFFQW5CLE9BQU9zQixZQUFQLENBQW9CLE1BQXBCLEVBQTRCLEdBQTVCO0FBQ0F0QixPQUFPdUIsV0FBUCxDQUFtQnBCLE1BQW5CO0FBQ0FGLFNBQVN1QixJQUFULENBQWNDLEtBQWQsQ0FBb0JDLE1BQXBCLEdBQTZCLEdBQTdCO0FBQ0F6QixTQUFTdUIsSUFBVCxDQUFjQyxLQUFkLENBQW9CRSxPQUFwQixHQUE4QixHQUE5QjtBQUNBMUIsU0FBU3VCLElBQVQsQ0FBY0QsV0FBZCxDQUEwQnZCLE1BQTFCOztBQUVBSCxPQUFPcUIsTUFBUCxFQUFlLEVBQWYsRUFDR1UsRUFESCxDQUNNLE1BRE4sRUFDYyxZQUFXO0FBQ3JCQyxTQUFPQyxJQUFQO0FBQ0F4QixRQUFNd0IsSUFBTjtBQUNELENBSkgsRUFLR0YsRUFMSCxDQUtNLE1BTE4sRUFLYyxZQUFXO0FBQ3JCLE1BQUlHLFdBQVd6QixNQUFNQSxLQUFyQjtBQUFBLE1BQ0VLLGFBQWFSLE9BQU9TLE1BQVAsR0FBZ0IsQ0FEL0I7QUFBQSxNQUVFQyxZQUFZVixPQUFPVyxLQUFQLEdBQWUsQ0FGN0I7O0FBSUFWLE1BQUk0QixTQUFKLEdBQWdCLHdCQUFoQixDQUxxQixDQUtxQjtBQUMxQzVCLE1BQUk2QixRQUFKLENBQWEsQ0FBYixFQUFnQixDQUFoQixFQUFtQjlCLE9BQU9XLEtBQTFCLEVBQWlDWCxPQUFPUyxNQUF4Qzs7QUFFQVIsTUFBSTRCLFNBQUosR0FBZ0IsU0FBaEI7QUFDQSxPQUFLLElBQUlFLElBQUksQ0FBUixFQUFXQyxJQUFJSixTQUFTaEIsTUFBeEIsRUFBZ0N2RCxDQUFoQyxFQUFtQ0MsQ0FBeEMsRUFBMkN5RSxJQUFJQyxDQUEvQyxFQUFrREQsS0FBSyxDQUF2RCxFQUEwRDtBQUN4RDFFLFFBQUl1RSxTQUFTRyxDQUFULEVBQVkxQyxRQUFaLENBQXFCaEMsQ0FBekI7QUFDQUMsUUFBSXNFLFNBQVNHLENBQVQsRUFBWTFDLFFBQVosQ0FBcUIvQixDQUF6QjtBQUNBO0FBQ0FzRSxhQUFTRyxDQUFULEVBQVkxQyxRQUFaLENBQXFCaEMsQ0FBckIsR0FDRUEsSUFBSXFELFNBQUosR0FBZ0IsQ0FBQ0EsU0FBakIsR0FBNkIsQ0FBQ3JELENBQUQsR0FBS3FELFNBQUwsR0FBaUJBLFNBQWpCLEdBQTZCckQsQ0FENUQ7QUFFQXVFLGFBQVNHLENBQVQsRUFBWTFDLFFBQVosQ0FBcUIvQixDQUFyQixHQUNFQSxJQUFJa0QsVUFBSixHQUFpQixDQUFDQSxVQUFsQixHQUErQixDQUFDbEQsQ0FBRCxHQUFLa0QsVUFBTCxHQUFrQkEsVUFBbEIsR0FBK0JsRCxDQURoRTtBQUVBMkMsUUFBSTZCLFFBQUosQ0FBYXpFLElBQUlxRCxTQUFqQixFQUE0QnBELElBQUlrRCxVQUFoQyxFQUE0QyxDQUE1QyxFQUErQyxDQUEvQztBQUNEO0FBQ0YsQ0F4Qkg7O0FBMEJBLElBQUl5QixZQUFZbkMsU0FBU29DLGFBQVQsQ0FBdUIsWUFBdkIsQ0FBaEI7QUFDQSxJQUFJQyxZQUFZckMsU0FBU29DLGFBQVQsQ0FBdUIsY0FBdkIsQ0FBaEI7QUFDQSxJQUFJUixTQUFTbEMsSUFBSSxFQUFFNEMsT0FBTyxFQUFULEVBQWFDLE9BQU8sSUFBcEIsRUFBSixFQUFnQ1osRUFBaEMsQ0FBbUMsTUFBbkMsRUFBMkMsVUFBU2EsSUFBVCxFQUFlO0FBQ3JFLE9BQUssSUFBSVAsSUFBSSxDQUFiLEVBQWdCQSxJQUFJLENBQXBCLEVBQXVCQSxLQUFLLENBQTVCLEVBQStCO0FBQzdCLFFBQUlPLFFBQVEsRUFBUixJQUFjbkMsTUFBTUEsS0FBTixDQUFZUyxNQUFaLEdBQXFCLEVBQXZDLEVBQTJDVCxNQUFNQSxLQUFOLENBQVlvQyxHQUFaO0FBQzNDLFFBQUlELFFBQVEsRUFBUixJQUFjbkMsTUFBTUEsS0FBTixDQUFZUyxNQUFaLEdBQXFCLEdBQXZDLEVBQ0VULE1BQU1BLEtBQU4sQ0FBWVUsSUFBWixDQUNFLElBQUl6QixJQUFKLENBQ0UsSUFBSWhDLE1BQUosQ0FBVyxDQUFYLEVBQWMsQ0FBZCxDQURGLEVBRUUsSUFBSUEsTUFBSixDQUFXTyxLQUFLbUQsTUFBTCxLQUFnQixDQUFoQixHQUFvQixDQUEvQixFQUFrQ25ELEtBQUttRCxNQUFMLEtBQWdCLENBQWhCLEdBQW9CLENBQXRELENBRkYsQ0FERjtBQU1IO0FBQ0RtQixZQUFVTyxTQUFWLEdBQXNCQyxPQUFPOUUsS0FBS2tCLEtBQUwsQ0FBV3lELElBQVgsQ0FBUCxDQUF0QjtBQUNBSCxZQUFVSyxTQUFWLEdBQXNCQyxPQUFPdEMsTUFBTUEsS0FBTixDQUFZUyxNQUFuQixDQUF0QjtBQUNELENBYlksQ0FBYixDOzs7Ozs7QUNwRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLGNBQWM7QUFDNUI7QUFDQSxnQkFBZ0I7QUFDaEIsNEJBQTRCOztBQUU1QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNyQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHOztBQUVIO0FBQ0E7Ozs7Ozs7QUMxQkE7O0FBRUE7QUFDQTtBQUNBLG1DQUFtQzs7QUFFbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUEseUJBQXlCO0FBQ3pCLDBCQUEwQjs7QUFFMUI7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7O0FDN0NBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNwREE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsdUJBQXVCO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLGlCQUFpQjtBQUN0QztBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsMENBQTBDLHNCQUFzQixFQUFFO0FBQ2xFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EseUNBQXlDO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxVQUFVO0FBQ1Y7QUFDQTs7QUFFQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxDQUFDOzs7Ozs7OztBQ3pMRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNENBQTRDOztBQUU1Qzs7Ozs7OztBQ3BCQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHNCQUFzQjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEscUNBQXFDOztBQUVyQztBQUNBO0FBQ0E7O0FBRUEsMkJBQTJC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RUFBUDtBQUNEOztBQUVELFNBQ0UsU0FDQTVHLFNBQVM0RyxLQUFLSSxJQUFkLENBREEsR0FFQSxNQUZBLEdBR0FKLEtBQUtHLEtBSEwsR0FJQSxNQUpBLEdBS0EvRyxTQUFTNEcsS0FBS0ssS0FBZCxDQUxBLEdBTUEsR0FQRjtBQVNELEMiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gNCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgYmFjYmJkNDE5MGJjMjliZTEwNzkiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzXG4vLyBtb2R1bGUgaWQgPSAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gaW5oZXJpdHNcblxuZnVuY3Rpb24gaW5oZXJpdHMgKGMsIHAsIHByb3RvKSB7XG4gIHByb3RvID0gcHJvdG8gfHwge31cbiAgdmFyIGUgPSB7fVxuICA7W2MucHJvdG90eXBlLCBwcm90b10uZm9yRWFjaChmdW5jdGlvbiAocykge1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHMpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgIGVba10gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHMsIGspXG4gICAgfSlcbiAgfSlcbiAgYy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHAucHJvdG90eXBlLCBlKVxuICBjLnN1cGVyID0gcFxufVxuXG4vL2Z1bmN0aW9uIENoaWxkICgpIHtcbi8vICBDaGlsZC5zdXBlci5jYWxsKHRoaXMpXG4vLyAgY29uc29sZS5lcnJvcihbdGhpc1xuLy8gICAgICAgICAgICAgICAgLHRoaXMuY29uc3RydWN0b3Jcbi8vICAgICAgICAgICAgICAgICx0aGlzLmNvbnN0cnVjdG9yID09PSBDaGlsZFxuLy8gICAgICAgICAgICAgICAgLHRoaXMuY29uc3RydWN0b3Iuc3VwZXIgPT09IFBhcmVudFxuLy8gICAgICAgICAgICAgICAgLE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSA9PT0gQ2hpbGQucHJvdG90eXBlXG4vLyAgICAgICAgICAgICAgICAsT2JqZWN0LmdldFByb3RvdHlwZU9mKE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSlcbi8vICAgICAgICAgICAgICAgICA9PT0gUGFyZW50LnByb3RvdHlwZVxuLy8gICAgICAgICAgICAgICAgLHRoaXMgaW5zdGFuY2VvZiBDaGlsZFxuLy8gICAgICAgICAgICAgICAgLHRoaXMgaW5zdGFuY2VvZiBQYXJlbnRdKVxuLy99XG4vL2Z1bmN0aW9uIFBhcmVudCAoKSB7fVxuLy9pbmhlcml0cyhDaGlsZCwgUGFyZW50KVxuLy9uZXcgQ2hpbGRcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzLmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImZ1bmN0aW9uIFZlY3Rvcih4LCB5KSB7XG4gIHRoaXMueCA9IHg7XG4gIHRoaXMueSA9IHk7XG59XG5cblZlY3Rvci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24odikge1xuICByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKyB2LngsIHRoaXMueSArIHYueSk7XG59O1xuXG5WZWN0b3IucHJvdG90eXBlLmRpc3RTcXVhcmVkID0gZnVuY3Rpb24odikge1xuICByZXR1cm4gTWF0aC5wb3codGhpcy54IC0gdi54LCAyKSArIE1hdGgucG93KHRoaXMueSAtIHYueSwgMik7XG59O1xuXG5WZWN0b3IucHJvdG90eXBlLmRpc3RhbmNlID0gZnVuY3Rpb24odikge1xuICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMuZGlzdFNxdWFyZWQodikpO1xufTtcblxuVmVjdG9yLnByb3RvdHlwZS5tdWx0aXBseUJ5ID0gZnVuY3Rpb24ocykge1xuICByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKiBzLCB0aGlzLnkgKiBzKTtcbn07XG5cblZlY3Rvci5wcm90b3R5cGUubmVnID0gZnVuY3Rpb24odikge1xuICByZXR1cm4gbmV3IFZlY3RvcigtdGhpcy54LCAtdGhpcy55KTtcbn07XG5cblZlY3Rvci5wcm90b3R5cGUubWFnbml0dWRlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmRpc3RhbmNlKG5ldyBWZWN0b3IoMCwgMCkpO1xufTtcblxuVmVjdG9yLnByb3RvdHlwZS5ub3JtYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG1hZ25pdHVkZSA9IHRoaXMubWFnbml0dWRlKCk7XG5cbiAgaWYgKG1hZ25pdHVkZSA9PT0gMCkgcmV0dXJuIG5ldyBWZWN0b3IoMCwgMCk7XG5cbiAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54IC8gbWFnbml0dWRlLCB0aGlzLnkgLyBtYWduaXR1ZGUpO1xufTtcblxuVmVjdG9yLnByb3RvdHlwZS5zdWJ0cmFjdCA9IGZ1bmN0aW9uKHYpIHtcbiAgcmV0dXJuIHRoaXMuYWRkKHYubmVnKCkpO1xufTtcblxuVmVjdG9yLnByb3RvdHlwZS5kaXZpZGVCeSA9IGZ1bmN0aW9uKHMpIHtcbiAgcmV0dXJuIHRoaXMubXVsdGlwbHlCeSgxIC8gcyk7XG59O1xuXG5WZWN0b3IucHJvdG90eXBlLmxpbWl0ID0gZnVuY3Rpb24ocykge1xuICBpZiAodGhpcy5tYWduaXR1ZGUoKSA+IHMpIHJldHVybiB0aGlzLm5vcm1hbGl6ZSgpLm11bHRpcGx5Qnkocyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5WZWN0b3IucHJvdG90eXBlLmFuZ2xlID0gZnVuY3Rpb24ocDEsIHAyKSB7XG4gIHZhciB2MSA9IHRoaXMuc3VidHJhY3QocDEpLm5vcm1hbGl6ZSgpLFxuICAgIHYyID0gdGhpcy5zdWJ0cmFjdChwMikubm9ybWFsaXplKCksXG4gICAgLy8gUm91bmRpbmcgaXMgYmVjYXVzZSBzb21ldGltZXMgdGhlIHZhbHVlIGdvZXMgYmV5b25kIDEuMFxuICAgIC8vIGR1ZSB0byBmbG9hdGluZyBwb2ludCBwcmVjaXNpb24gZXJyb3JzXG4gICAgY29zID0gTWF0aC5yb3VuZCgodjEueCAqIHYyLnggKyB2MS55ICogdjIueSkgKiAxMDAwMCkgLyAxMDAwMDtcblxuICByZXR1cm4gTWF0aC5hY29zKGNvcyk7XG59O1xuXG5WZWN0b3IucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbih0aGF0LCB5KSB7XG4gIHJldHVybiAoXG4gICAgKHkgJiYgKHRoaXMueSAtIHRoYXQueSB8fCB0aGlzLnggLSB0aGF0LngpKSB8fFxuICAgICh0aGlzLnggLSB0aGF0LnggfHwgdGhpcy55IC0gdGhhdC55KVxuICApO1xufTtcblxuVmVjdG9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gXCJ7eDpcIiArIHRoaXMueCArIFwiLCB5OlwiICsgdGhpcy55ICsgXCJ9XCI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZlY3RvcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2pzL3ZlY3Rvci5qcyIsIm1vZHVsZS5leHBvcnRzID0gQm9pZDtcblxuZnVuY3Rpb24gQm9pZChwb3NpdGlvbiwgc3BlZWQpIHtcbiAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICB0aGlzLnNwZWVkID0gc3BlZWQ7XG59XG5cbkJvaWQucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbih0aGF0LCBpc0V2ZW4pIHtcbiAgcmV0dXJuIHRoaXMucG9zaXRpb24uY29tcGFyZSh0aGF0LnBvc2l0aW9uLCBpc0V2ZW4pO1xufTtcblxuQm9pZC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMucG9zaXRpb24udG9TdHJpbmcoKTtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9qcy9ib2lkLmpzIiwidmFyIGZwcyA9IHJlcXVpcmUoXCJmcHNcIiksXG4gIHRpY2tlciA9IHJlcXVpcmUoXCJ0aWNrZXJcIiksXG4gIGRlYm91bmNlID0gcmVxdWlyZShcImRlYm91bmNlXCIpLFxuICBCb2lkcyA9IHJlcXVpcmUoXCIuL1wiKSxcbiAgVmVjdG9yID0gcmVxdWlyZShcIi4vdmVjdG9yXCIpLFxuICBCb2lkID0gcmVxdWlyZShcIi4vYm9pZFwiKTtcblxudmFyIGFuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpLFxuICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpLFxuICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpLFxuICBib2lkcyA9IEJvaWRzKCk7XG5cbmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xuICB2YXIgeCA9IGUucGFnZVgsXG4gICAgeSA9IGUucGFnZVksXG4gICAgaGFsZkhlaWdodCA9IGNhbnZhcy5oZWlnaHQgLyAyLFxuICAgIGhhbGZXaWR0aCA9IGNhbnZhcy53aWR0aCAvIDI7XG4gIHggPSB4IC0gaGFsZldpZHRoO1xuICB5ID0geSAtIGhhbGZIZWlnaHQ7XG4gIGlmIChib2lkcy5ib2lkcy5sZW5ndGggPCA1MDApXG4gICAgYm9pZHMuYm9pZHMucHVzaChcbiAgICAgIG5ldyBCb2lkKFxuICAgICAgICBuZXcgVmVjdG9yKHgsIHkpLFxuICAgICAgICBuZXcgVmVjdG9yKE1hdGgucmFuZG9tKCkgKiA2IC0gMywgTWF0aC5yYW5kb20oKSAqIDYgLSAzKVxuICAgICAgKVxuICAgICk7XG59KTtcblxud2luZG93Lm9ucmVzaXplID0gZGVib3VuY2UoZnVuY3Rpb24oKSB7XG4gIGNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICBjYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xufSwgMTAwKTtcbndpbmRvdy5vbnJlc2l6ZSgpO1xuXG5hbmNob3Iuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcIiNcIik7XG5hbmNob3IuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbmRvY3VtZW50LmJvZHkuc3R5bGUubWFyZ2luID0gXCIwXCI7XG5kb2N1bWVudC5ib2R5LnN0eWxlLnBhZGRpbmcgPSBcIjBcIjtcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYW5jaG9yKTtcblxudGlja2VyKHdpbmRvdywgNjApXG4gIC5vbihcInRpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgZnJhbWVzLnRpY2soKTtcbiAgICBib2lkcy50aWNrKCk7XG4gIH0pXG4gIC5vbihcImRyYXdcIiwgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGJvaWREYXRhID0gYm9pZHMuYm9pZHMsXG4gICAgICBoYWxmSGVpZ2h0ID0gY2FudmFzLmhlaWdodCAvIDIsXG4gICAgICBoYWxmV2lkdGggPSBjYW52YXMud2lkdGggLyAyO1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgyNTUsMjQxLDIzNSwwLjI1KVwiOyAvLyAnI0ZGRjFFQidcbiAgICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBcIiM1NDNENUVcIjtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGJvaWREYXRhLmxlbmd0aCwgeCwgeTsgaSA8IGw7IGkgKz0gMSkge1xuICAgICAgeCA9IGJvaWREYXRhW2ldLnBvc2l0aW9uLng7XG4gICAgICB5ID0gYm9pZERhdGFbaV0ucG9zaXRpb24ueTtcbiAgICAgIC8vIHdyYXAgYXJvdW5kIHRoZSBzY3JlZW5cbiAgICAgIGJvaWREYXRhW2ldLnBvc2l0aW9uLnggPVxuICAgICAgICB4ID4gaGFsZldpZHRoID8gLWhhbGZXaWR0aCA6IC14ID4gaGFsZldpZHRoID8gaGFsZldpZHRoIDogeDtcbiAgICAgIGJvaWREYXRhW2ldLnBvc2l0aW9uLnkgPVxuICAgICAgICB5ID4gaGFsZkhlaWdodCA/IC1oYWxmSGVpZ2h0IDogLXkgPiBoYWxmSGVpZ2h0ID8gaGFsZkhlaWdodCA6IHk7XG4gICAgICBjdHguZmlsbFJlY3QoeCArIGhhbGZXaWR0aCwgeSArIGhhbGZIZWlnaHQsIDIsIDIpO1xuICAgIH1cbiAgfSk7XG5cbnZhciBmcmFtZVRleHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtZnBzXVwiKTtcbnZhciBjb3VudFRleHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtY291bnRdXCIpO1xudmFyIGZyYW1lcyA9IGZwcyh7IGV2ZXJ5OiAxMCwgZGVjYXk6IDAuMDQgfSkub24oXCJkYXRhXCIsIGZ1bmN0aW9uKHJhdGUpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpICs9IDEpIHtcbiAgICBpZiAocmF0ZSA8PSA1NiAmJiBib2lkcy5ib2lkcy5sZW5ndGggPiAxMCkgYm9pZHMuYm9pZHMucG9wKCk7XG4gICAgaWYgKHJhdGUgPj0gNjAgJiYgYm9pZHMuYm9pZHMubGVuZ3RoIDwgMzAwKVxuICAgICAgYm9pZHMuYm9pZHMucHVzaChcbiAgICAgICAgbmV3IEJvaWQoXG4gICAgICAgICAgbmV3IFZlY3RvcigwLCAwKSxcbiAgICAgICAgICBuZXcgVmVjdG9yKE1hdGgucmFuZG9tKCkgKiA2IC0gMywgTWF0aC5yYW5kb20oKSAqIDYgLSAzKVxuICAgICAgICApXG4gICAgICApO1xuICB9XG4gIGZyYW1lVGV4dC5pbm5lckhUTUwgPSBTdHJpbmcoTWF0aC5yb3VuZChyYXRlKSk7XG4gIGNvdW50VGV4dC5pbm5lckhUTUwgPSBTdHJpbmcoYm9pZHMuYm9pZHMubGVuZ3RoKTtcbn0pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vanMvZGVtby5qcyIsInZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXJcbiAgLCBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJylcblxubW9kdWxlLmV4cG9ydHMgPSBmcHNcblxuLy8gVHJ5IHVzZSBwZXJmb3JtYW5jZS5ub3coKSwgb3RoZXJ3aXNlIHRyeVxuLy8gK25ldyBEYXRlLlxudmFyIG5vdyA9IChcbiAgKGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzIH0oKSkucGVyZm9ybWFuY2UgJiZcbiAgJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIHBlcmZvcm1hbmNlLm5vd1xuKSA/IGZ1bmN0aW9uKCkgeyByZXR1cm4gcGVyZm9ybWFuY2Uubm93KCkgfVxuICA6IERhdGUubm93IHx8IGZ1bmN0aW9uKCkgeyByZXR1cm4gK25ldyBEYXRlIH1cblxuZnVuY3Rpb24gZnBzKG9wdHMpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIGZwcykpIHJldHVybiBuZXcgZnBzKG9wdHMpXG4gIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpXG5cbiAgb3B0cyA9IG9wdHMgfHwge31cbiAgdGhpcy5sYXN0ID0gbm93KClcbiAgdGhpcy5yYXRlID0gMFxuICB0aGlzLnRpbWUgPSAwXG4gIHRoaXMuZGVjYXkgPSBvcHRzLmRlY2F5IHx8IDFcbiAgdGhpcy5ldmVyeSA9IG9wdHMuZXZlcnkgfHwgMVxuICB0aGlzLnRpY2tzID0gMFxufVxuaW5oZXJpdHMoZnBzLCBFdmVudEVtaXR0ZXIpXG5cbmZwcy5wcm90b3R5cGUudGljayA9IGZ1bmN0aW9uKCkge1xuICB2YXIgdGltZSA9IG5vdygpXG4gICAgLCBkaWZmID0gdGltZSAtIHRoaXMubGFzdFxuICAgICwgZnBzID0gZGlmZlxuXG4gIHRoaXMudGlja3MgKz0gMVxuICB0aGlzLmxhc3QgPSB0aW1lXG4gIHRoaXMudGltZSArPSAoZnBzIC0gdGhpcy50aW1lKSAqIHRoaXMuZGVjYXlcbiAgdGhpcy5yYXRlID0gMTAwMCAvIHRoaXMudGltZVxuICBpZiAoISh0aGlzLnRpY2tzICUgdGhpcy5ldmVyeSkpIHRoaXMuZW1pdCgnZGF0YScsIHRoaXMucmF0ZSlcbn1cblxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvZnBzL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciByYWYgPSByZXF1aXJlKCdyYWYnKVxuICAsIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxuXG5tb2R1bGUuZXhwb3J0cyA9IHRpY2tlclxuXG5mdW5jdGlvbiB0aWNrZXIoZWxlbWVudCwgcmF0ZSwgbGltaXQpIHtcbiAgdmFyIG1pbGxpc2Vjb25kc1BlckZyYW1lID0gMTAwMCAvIChyYXRlIHx8IDYwKVxuICAgICwgdGltZSA9IDBcbiAgICAsIGVtaXR0ZXJcblxuICBsaW1pdCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyID8gK2xpbWl0ICsgMSA6IDJcbiAgZW1pdHRlciA9IHJhZihlbGVtZW50IHx8IHdpbmRvdykub24oJ2RhdGEnLCBmdW5jdGlvbihkdCkge1xuICAgIHZhciBuID0gbGltaXRcblxuICAgIHRpbWUgKz0gZHRcbiAgICB3aGlsZSAodGltZSA+IG1pbGxpc2Vjb25kc1BlckZyYW1lICYmIG4pIHtcbiAgICAgIHRpbWUgLT0gbWlsbGlzZWNvbmRzUGVyRnJhbWVcbiAgICAgIG4gLT0gMVxuICAgICAgZW1pdHRlci5lbWl0KCd0aWNrJylcbiAgICB9XG4gICAgdGltZSA9ICh0aW1lICsgbWlsbGlzZWNvbmRzUGVyRnJhbWUgKiAxMDAwKSAlIG1pbGxpc2Vjb25kc1BlckZyYW1lXG5cbiAgICBpZiAobiAhPT0gbGltaXQpIGVtaXR0ZXIuZW1pdCgnZHJhdycpXG4gIH0pXG5cbiAgcmV0dXJuIGVtaXR0ZXJcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3RpY2tlci9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJhZlxuXG52YXIgRUUgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXJcbiAgLCBnbG9iYWwgPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IHRoaXMgOiB3aW5kb3dcbiAgLCBub3cgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbiAoKSB7IHJldHVybiArbmV3IERhdGUoKSB9XG5cbnZhciBfcmFmID1cbiAgZ2xvYmFsLnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICBnbG9iYWwud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gIGdsb2JhbC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgZ2xvYmFsLm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gIGdsb2JhbC5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gIChnbG9iYWwuc2V0SW1tZWRpYXRlID8gZnVuY3Rpb24oZm4sIGVsKSB7XG4gICAgc2V0SW1tZWRpYXRlKGZuKVxuICB9IDpcbiAgZnVuY3Rpb24oZm4sIGVsKSB7XG4gICAgc2V0VGltZW91dChmbiwgMClcbiAgfSlcblxuZnVuY3Rpb24gcmFmKGVsKSB7XG4gIHZhciBub3cgPSByYWYubm93KClcbiAgICAsIGVlID0gbmV3IEVFXG5cbiAgZWUucGF1c2UgPSBmdW5jdGlvbigpIHsgZWUucGF1c2VkID0gdHJ1ZSB9XG4gIGVlLnJlc3VtZSA9IGZ1bmN0aW9uKCkgeyBlZS5wYXVzZWQgPSBmYWxzZSB9XG5cbiAgX3JhZihpdGVyLCBlbClcblxuICByZXR1cm4gZWVcblxuICBmdW5jdGlvbiBpdGVyKHRpbWVzdGFtcCkge1xuICAgIHZhciBfbm93ID0gcmFmLm5vdygpXG4gICAgICAsIGR0ID0gX25vdyAtIG5vd1xuICAgIFxuICAgIG5vdyA9IF9ub3dcblxuICAgIGVlLmVtaXQoJ2RhdGEnLCBkdClcblxuICAgIGlmKCFlZS5wYXVzZWQpIHtcbiAgICAgIF9yYWYoaXRlciwgZWwpXG4gICAgfVxuICB9XG59XG5cbnJhZi5wb2x5ZmlsbCA9IF9yYWZcbnJhZi5ub3cgPSBub3dcblxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvcmFmL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSA3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBhcHBseSA9IEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseTtcblxuLy8gRE9NIEFQSXMsIGZvciBjb21wbGV0ZW5lc3NcblxuZXhwb3J0cy5zZXRUaW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldFRpbWVvdXQsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJUaW1lb3V0KTtcbn07XG5leHBvcnRzLnNldEludGVydmFsID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldEludGVydmFsLCB3aW5kb3csIGFyZ3VtZW50cyksIGNsZWFySW50ZXJ2YWwpO1xufTtcbmV4cG9ydHMuY2xlYXJUaW1lb3V0ID1cbmV4cG9ydHMuY2xlYXJJbnRlcnZhbCA9IGZ1bmN0aW9uKHRpbWVvdXQpIHtcbiAgaWYgKHRpbWVvdXQpIHtcbiAgICB0aW1lb3V0LmNsb3NlKCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIFRpbWVvdXQoaWQsIGNsZWFyRm4pIHtcbiAgdGhpcy5faWQgPSBpZDtcbiAgdGhpcy5fY2xlYXJGbiA9IGNsZWFyRm47XG59XG5UaW1lb3V0LnByb3RvdHlwZS51bnJlZiA9IFRpbWVvdXQucHJvdG90eXBlLnJlZiA9IGZ1bmN0aW9uKCkge307XG5UaW1lb3V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9jbGVhckZuLmNhbGwod2luZG93LCB0aGlzLl9pZCk7XG59O1xuXG4vLyBEb2VzIG5vdCBzdGFydCB0aGUgdGltZSwganVzdCBzZXRzIHVwIHRoZSBtZW1iZXJzIG5lZWRlZC5cbmV4cG9ydHMuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSwgbXNlY3MpIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IG1zZWNzO1xufTtcblxuZXhwb3J0cy51bmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IC0xO1xufTtcblxuZXhwb3J0cy5fdW5yZWZBY3RpdmUgPSBleHBvcnRzLmFjdGl2ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuXG4gIHZhciBtc2VjcyA9IGl0ZW0uX2lkbGVUaW1lb3V0O1xuICBpZiAobXNlY3MgPj0gMCkge1xuICAgIGl0ZW0uX2lkbGVUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uIG9uVGltZW91dCgpIHtcbiAgICAgIGlmIChpdGVtLl9vblRpbWVvdXQpXG4gICAgICAgIGl0ZW0uX29uVGltZW91dCgpO1xuICAgIH0sIG1zZWNzKTtcbiAgfVxufTtcblxuLy8gc2V0aW1tZWRpYXRlIGF0dGFjaGVzIGl0c2VsZiB0byB0aGUgZ2xvYmFsIG9iamVjdFxucmVxdWlyZShcInNldGltbWVkaWF0ZVwiKTtcbmV4cG9ydHMuc2V0SW1tZWRpYXRlID0gc2V0SW1tZWRpYXRlO1xuZXhwb3J0cy5jbGVhckltbWVkaWF0ZSA9IGNsZWFySW1tZWRpYXRlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdGltZXJzLWJyb3dzZXJpZnkvbWFpbi5qc1xuLy8gbW9kdWxlIGlkID0gOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIoZnVuY3Rpb24gKGdsb2JhbCwgdW5kZWZpbmVkKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAoZ2xvYmFsLnNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG5leHRIYW5kbGUgPSAxOyAvLyBTcGVjIHNheXMgZ3JlYXRlciB0aGFuIHplcm9cbiAgICB2YXIgdGFza3NCeUhhbmRsZSA9IHt9O1xuICAgIHZhciBjdXJyZW50bHlSdW5uaW5nQVRhc2sgPSBmYWxzZTtcbiAgICB2YXIgZG9jID0gZ2xvYmFsLmRvY3VtZW50O1xuICAgIHZhciByZWdpc3RlckltbWVkaWF0ZTtcblxuICAgIGZ1bmN0aW9uIHNldEltbWVkaWF0ZShjYWxsYmFjaykge1xuICAgICAgLy8gQ2FsbGJhY2sgY2FuIGVpdGhlciBiZSBhIGZ1bmN0aW9uIG9yIGEgc3RyaW5nXG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBuZXcgRnVuY3Rpb24oXCJcIiArIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICAgIC8vIENvcHkgZnVuY3Rpb24gYXJndW1lbnRzXG4gICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2kgKyAxXTtcbiAgICAgIH1cbiAgICAgIC8vIFN0b3JlIGFuZCByZWdpc3RlciB0aGUgdGFza1xuICAgICAgdmFyIHRhc2sgPSB7IGNhbGxiYWNrOiBjYWxsYmFjaywgYXJnczogYXJncyB9O1xuICAgICAgdGFza3NCeUhhbmRsZVtuZXh0SGFuZGxlXSA9IHRhc2s7XG4gICAgICByZWdpc3RlckltbWVkaWF0ZShuZXh0SGFuZGxlKTtcbiAgICAgIHJldHVybiBuZXh0SGFuZGxlKys7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xlYXJJbW1lZGlhdGUoaGFuZGxlKSB7XG4gICAgICAgIGRlbGV0ZSB0YXNrc0J5SGFuZGxlW2hhbmRsZV07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcnVuKHRhc2spIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gdGFzay5jYWxsYmFjaztcbiAgICAgICAgdmFyIGFyZ3MgPSB0YXNrLmFyZ3M7XG4gICAgICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBjYWxsYmFjayhhcmdzWzBdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBjYWxsYmFjayhhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBjYWxsYmFjayhhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodW5kZWZpbmVkLCBhcmdzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcnVuSWZQcmVzZW50KGhhbmRsZSkge1xuICAgICAgICAvLyBGcm9tIHRoZSBzcGVjOiBcIldhaXQgdW50aWwgYW55IGludm9jYXRpb25zIG9mIHRoaXMgYWxnb3JpdGhtIHN0YXJ0ZWQgYmVmb3JlIHRoaXMgb25lIGhhdmUgY29tcGxldGVkLlwiXG4gICAgICAgIC8vIFNvIGlmIHdlJ3JlIGN1cnJlbnRseSBydW5uaW5nIGEgdGFzaywgd2UnbGwgbmVlZCB0byBkZWxheSB0aGlzIGludm9jYXRpb24uXG4gICAgICAgIGlmIChjdXJyZW50bHlSdW5uaW5nQVRhc2spIHtcbiAgICAgICAgICAgIC8vIERlbGF5IGJ5IGRvaW5nIGEgc2V0VGltZW91dC4gc2V0SW1tZWRpYXRlIHdhcyB0cmllZCBpbnN0ZWFkLCBidXQgaW4gRmlyZWZveCA3IGl0IGdlbmVyYXRlZCBhXG4gICAgICAgICAgICAvLyBcInRvbyBtdWNoIHJlY3Vyc2lvblwiIGVycm9yLlxuICAgICAgICAgICAgc2V0VGltZW91dChydW5JZlByZXNlbnQsIDAsIGhhbmRsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdGFzayA9IHRhc2tzQnlIYW5kbGVbaGFuZGxlXTtcbiAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudGx5UnVubmluZ0FUYXNrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBydW4odGFzayk7XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbW1lZGlhdGUoaGFuZGxlKTtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudGx5UnVubmluZ0FUYXNrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zdGFsbE5leHRUaWNrSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHJlZ2lzdGVySW1tZWRpYXRlID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uICgpIHsgcnVuSWZQcmVzZW50KGhhbmRsZSk7IH0pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhblVzZVBvc3RNZXNzYWdlKCkge1xuICAgICAgICAvLyBUaGUgdGVzdCBhZ2FpbnN0IGBpbXBvcnRTY3JpcHRzYCBwcmV2ZW50cyB0aGlzIGltcGxlbWVudGF0aW9uIGZyb20gYmVpbmcgaW5zdGFsbGVkIGluc2lkZSBhIHdlYiB3b3JrZXIsXG4gICAgICAgIC8vIHdoZXJlIGBnbG9iYWwucG9zdE1lc3NhZ2VgIG1lYW5zIHNvbWV0aGluZyBjb21wbGV0ZWx5IGRpZmZlcmVudCBhbmQgY2FuJ3QgYmUgdXNlZCBmb3IgdGhpcyBwdXJwb3NlLlxuICAgICAgICBpZiAoZ2xvYmFsLnBvc3RNZXNzYWdlICYmICFnbG9iYWwuaW1wb3J0U2NyaXB0cykge1xuICAgICAgICAgICAgdmFyIHBvc3RNZXNzYWdlSXNBc3luY2hyb25vdXMgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIG9sZE9uTWVzc2FnZSA9IGdsb2JhbC5vbm1lc3NhZ2U7XG4gICAgICAgICAgICBnbG9iYWwub25tZXNzYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2VJc0FzeW5jaHJvbm91cyA9IGZhbHNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZShcIlwiLCBcIipcIik7XG4gICAgICAgICAgICBnbG9iYWwub25tZXNzYWdlID0gb2xkT25NZXNzYWdlO1xuICAgICAgICAgICAgcmV0dXJuIHBvc3RNZXNzYWdlSXNBc3luY2hyb25vdXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsUG9zdE1lc3NhZ2VJbXBsZW1lbnRhdGlvbigpIHtcbiAgICAgICAgLy8gSW5zdGFsbHMgYW4gZXZlbnQgaGFuZGxlciBvbiBgZ2xvYmFsYCBmb3IgdGhlIGBtZXNzYWdlYCBldmVudDogc2VlXG4gICAgICAgIC8vICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vRE9NL3dpbmRvdy5wb3N0TWVzc2FnZVxuICAgICAgICAvLyAqIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL2NvbW1zLmh0bWwjY3Jvc3NEb2N1bWVudE1lc3NhZ2VzXG5cbiAgICAgICAgdmFyIG1lc3NhZ2VQcmVmaXggPSBcInNldEltbWVkaWF0ZSRcIiArIE1hdGgucmFuZG9tKCkgKyBcIiRcIjtcbiAgICAgICAgdmFyIG9uR2xvYmFsTWVzc2FnZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlID09PSBnbG9iYWwgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgZXZlbnQuZGF0YSA9PT0gXCJzdHJpbmdcIiAmJlxuICAgICAgICAgICAgICAgIGV2ZW50LmRhdGEuaW5kZXhPZihtZXNzYWdlUHJlZml4KSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJ1bklmUHJlc2VudCgrZXZlbnQuZGF0YS5zbGljZShtZXNzYWdlUHJlZml4Lmxlbmd0aCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIG9uR2xvYmFsTWVzc2FnZSwgZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2xvYmFsLmF0dGFjaEV2ZW50KFwib25tZXNzYWdlXCIsIG9uR2xvYmFsTWVzc2FnZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgZ2xvYmFsLnBvc3RNZXNzYWdlKG1lc3NhZ2VQcmVmaXggKyBoYW5kbGUsIFwiKlwiKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnN0YWxsTWVzc2FnZUNoYW5uZWxJbXBsZW1lbnRhdGlvbigpIHtcbiAgICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGhhbmRsZSA9IGV2ZW50LmRhdGE7XG4gICAgICAgICAgICBydW5JZlByZXNlbnQoaGFuZGxlKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZWdpc3RlckltbWVkaWF0ZSA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZShoYW5kbGUpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3RhbGxSZWFkeVN0YXRlQ2hhbmdlSW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHZhciBodG1sID0gZG9jLmRvY3VtZW50RWxlbWVudDtcbiAgICAgICAgcmVnaXN0ZXJJbW1lZGlhdGUgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIDxzY3JpcHQ+IGVsZW1lbnQ7IGl0cyByZWFkeXN0YXRlY2hhbmdlIGV2ZW50IHdpbGwgYmUgZmlyZWQgYXN5bmNocm9ub3VzbHkgb25jZSBpdCBpcyBpbnNlcnRlZFxuICAgICAgICAgICAgLy8gaW50byB0aGUgZG9jdW1lbnQuIERvIHNvLCB0aHVzIHF1ZXVpbmcgdXAgdGhlIHRhc2suIFJlbWVtYmVyIHRvIGNsZWFuIHVwIG9uY2UgaXQncyBiZWVuIGNhbGxlZC5cbiAgICAgICAgICAgIHZhciBzY3JpcHQgPSBkb2MuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICAgICAgICAgIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcnVuSWZQcmVzZW50KGhhbmRsZSk7XG4gICAgICAgICAgICAgICAgc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgaHRtbC5yZW1vdmVDaGlsZChzY3JpcHQpO1xuICAgICAgICAgICAgICAgIHNjcmlwdCA9IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaHRtbC5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc3RhbGxTZXRUaW1lb3V0SW1wbGVtZW50YXRpb24oKSB7XG4gICAgICAgIHJlZ2lzdGVySW1tZWRpYXRlID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHJ1bklmUHJlc2VudCwgMCwgaGFuZGxlKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBJZiBzdXBwb3J0ZWQsIHdlIHNob3VsZCBhdHRhY2ggdG8gdGhlIHByb3RvdHlwZSBvZiBnbG9iYWwsIHNpbmNlIHRoYXQgaXMgd2hlcmUgc2V0VGltZW91dCBldCBhbC4gbGl2ZS5cbiAgICB2YXIgYXR0YWNoVG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKGdsb2JhbCk7XG4gICAgYXR0YWNoVG8gPSBhdHRhY2hUbyAmJiBhdHRhY2hUby5zZXRUaW1lb3V0ID8gYXR0YWNoVG8gOiBnbG9iYWw7XG5cbiAgICAvLyBEb24ndCBnZXQgZm9vbGVkIGJ5IGUuZy4gYnJvd3NlcmlmeSBlbnZpcm9ubWVudHMuXG4gICAgaWYgKHt9LnRvU3RyaW5nLmNhbGwoZ2xvYmFsLnByb2Nlc3MpID09PSBcIltvYmplY3QgcHJvY2Vzc11cIikge1xuICAgICAgICAvLyBGb3IgTm9kZS5qcyBiZWZvcmUgMC45XG4gICAgICAgIGluc3RhbGxOZXh0VGlja0ltcGxlbWVudGF0aW9uKCk7XG5cbiAgICB9IGVsc2UgaWYgKGNhblVzZVBvc3RNZXNzYWdlKCkpIHtcbiAgICAgICAgLy8gRm9yIG5vbi1JRTEwIG1vZGVybiBicm93c2Vyc1xuICAgICAgICBpbnN0YWxsUG9zdE1lc3NhZ2VJbXBsZW1lbnRhdGlvbigpO1xuXG4gICAgfSBlbHNlIGlmIChnbG9iYWwuTWVzc2FnZUNoYW5uZWwpIHtcbiAgICAgICAgLy8gRm9yIHdlYiB3b3JrZXJzLCB3aGVyZSBzdXBwb3J0ZWRcbiAgICAgICAgaW5zdGFsbE1lc3NhZ2VDaGFubmVsSW1wbGVtZW50YXRpb24oKTtcblxuICAgIH0gZWxzZSBpZiAoZG9jICYmIFwib25yZWFkeXN0YXRlY2hhbmdlXCIgaW4gZG9jLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIikpIHtcbiAgICAgICAgLy8gRm9yIElFIDbigJM4XG4gICAgICAgIGluc3RhbGxSZWFkeVN0YXRlQ2hhbmdlSW1wbGVtZW50YXRpb24oKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZvciBvbGRlciBicm93c2Vyc1xuICAgICAgICBpbnN0YWxsU2V0VGltZW91dEltcGxlbWVudGF0aW9uKCk7XG4gICAgfVxuXG4gICAgYXR0YWNoVG8uc2V0SW1tZWRpYXRlID0gc2V0SW1tZWRpYXRlO1xuICAgIGF0dGFjaFRvLmNsZWFySW1tZWRpYXRlID0gY2xlYXJJbW1lZGlhdGU7XG59KHR5cGVvZiBzZWxmID09PSBcInVuZGVmaW5lZFwiID8gdHlwZW9mIGdsb2JhbCA9PT0gXCJ1bmRlZmluZWRcIiA/IHRoaXMgOiBnbG9iYWwgOiBzZWxmKSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9zZXRpbW1lZGlhdGUvc2V0SW1tZWRpYXRlLmpzXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBnO1xyXG5cclxuLy8gVGhpcyB3b3JrcyBpbiBub24tc3RyaWN0IG1vZGVcclxuZyA9IChmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdGhpcztcclxufSkoKTtcclxuXHJcbnRyeSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiBldmFsIGlzIGFsbG93ZWQgKHNlZSBDU1ApXHJcblx0ZyA9IGcgfHwgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpIHx8ICgxLGV2YWwpKFwidGhpc1wiKTtcclxufSBjYXRjaChlKSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiB0aGUgd2luZG93IHJlZmVyZW5jZSBpcyBhdmFpbGFibGVcclxuXHRpZih0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKVxyXG5cdFx0ZyA9IHdpbmRvdztcclxufVxyXG5cclxuLy8gZyBjYW4gc3RpbGwgYmUgdW5kZWZpbmVkLCBidXQgbm90aGluZyB0byBkbyBhYm91dCBpdC4uLlxyXG4vLyBXZSByZXR1cm4gdW5kZWZpbmVkLCBpbnN0ZWFkIG9mIG5vdGhpbmcgaGVyZSwgc28gaXQnc1xyXG4vLyBlYXNpZXIgdG8gaGFuZGxlIHRoaXMgY2FzZS4gaWYoIWdsb2JhbCkgeyAuLi59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGc7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vICh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qc1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qc1xuLy8gbW9kdWxlIGlkID0gMTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBEZWJvdW5jZXMgYSBmdW5jdGlvbiBieSB0aGUgZ2l2ZW4gdGhyZXNob2xkLlxuICpcbiAqIEBzZWUgaHR0cDovL3Vuc2NyaXB0YWJsZS5jb20vMjAwOS8wMy8yMC9kZWJvdW5jaW5nLWphdmFzY3JpcHQtbWV0aG9kcy9cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmN0aW9uIHRvIHdyYXBcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lb3V0IGluIG1zIChgMTAwYClcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gd2hldGhlciB0byBleGVjdXRlIGF0IHRoZSBiZWdpbm5pbmcgKGB0cnVlYClcbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB0aHJlc2hvbGQsIGV4ZWNBc2FwKXtcbiAgdmFyIHRpbWVvdXQ7XG4gIGlmIChmYWxzZSAhPT0gZXhlY0FzYXApIGV4ZWNBc2FwID0gdHJ1ZTtcblxuICByZXR1cm4gZnVuY3Rpb24gZGVib3VuY2VkKCl7XG4gICAgdmFyIG9iaiA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICBmdW5jdGlvbiBkZWxheWVkICgpIHtcbiAgICAgIGlmICghZXhlY0FzYXApIHtcbiAgICAgICAgZnVuYy5hcHBseShvYmosIGFyZ3MpO1xuICAgICAgfVxuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICB9IGVsc2UgaWYgKGV4ZWNBc2FwKSB7XG4gICAgICBmdW5jLmFwcGx5KG9iaiwgYXJncyk7XG4gICAgfVxuXG4gICAgdGltZW91dCA9IHNldFRpbWVvdXQoZGVsYXllZCwgdGhyZXNob2xkIHx8IDEwMCk7XG4gIH07XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvZGVib3VuY2UvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKFwiZXZlbnRzXCIpLkV2ZW50RW1pdHRlcixcbiAgaW5oZXJpdHMgPSByZXF1aXJlKFwiaW5oZXJpdHNcIiksXG4gIFZlY3RvciA9IHJlcXVpcmUoXCIuL3ZlY3RvclwiKSxcbiAgRHRyZWUgPSByZXF1aXJlKFwiLi9kdHJlZVwiKSxcbiAgQm9pZCA9IHJlcXVpcmUoXCIuL2JvaWRcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gQm9pZHM7XG5cbmZ1bmN0aW9uIEJvaWRzKG9wdHMsIGNhbGxiYWNrKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCb2lkcykpIHJldHVybiBuZXcgQm9pZHMob3B0cywgY2FsbGJhY2spO1xuICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbigpIHt9O1xuXG4gIHRoaXMuc3BlZWRMaW1pdCA9IG9wdHMuc3BlZWRMaW1pdCB8fCAxO1xuICB0aGlzLmFjY2VsZXJhdGlvbkxpbWl0ID0gb3B0cy5hY2NlbGVyYXRpb25MaW1pdCB8fCAwLjAzO1xuICB0aGlzLnNlcGFyYXRpb25EaXN0YW5jZSA9IG9wdHMuc2VwYXJhdGlvbkRpc3RhbmNlIHx8IDMwO1xuICB0aGlzLnNlcGFyYXRpb25EaXN0YW5jZVNxID0gTWF0aC5wb3codGhpcy5zZXBhcmF0aW9uRGlzdGFuY2UsIDIpO1xuICB0aGlzLmFsaWdubWVudERpc3RhbmNlID0gb3B0cy5hbGlnbm1lbnREaXN0YW5jZSB8fCA2MDtcbiAgdGhpcy5hbGlnbm1lbnREaXN0YW5jZVNxID0gTWF0aC5wb3codGhpcy5hbGlnbm1lbnREaXN0YW5jZSwgMik7XG4gIHRoaXMuY29oZXNpb25EaXN0YW5jZSA9IG9wdHMuY29oZXNpb25EaXN0YW5jZSB8fCA2MDtcbiAgdGhpcy5jb2hlc2lvbkRpc3RhbmNlU3EgPSBNYXRoLnBvdyh0aGlzLmNvaGVzaW9uRGlzdGFuY2UsIDIpO1xuICB0aGlzLnNlcGFyYXRpb25Gb3JjZSA9IG9wdHMuc2VwYXJhdGlvbkZvcmNlIHx8IDI7XG4gIHRoaXMuY29oZXNpb25Gb3JjZSA9IG9wdHMuY29oZXNpb25Gb3JjZSB8fCAxO1xuICB0aGlzLmFsaWdubWVudEZvcmNlID0gb3B0cy5hbGlnbm1lbnRGb3JjZSB8fCBvcHRzLmFsaWdubWVudCB8fCAxO1xuICB0aGlzLm1heERpc3RTcSA9IE1hdGgubWF4KFxuICAgIHRoaXMuc2VwYXJhdGlvbkRpc3RhbmNlU3EsXG4gICAgdGhpcy5jb2hlc2lvbkRpc3RhbmNlU3EsXG4gICAgdGhpcy5hbGlnbm1lbnREaXN0YW5jZVNxXG4gICk7XG5cbiAgdmFyIGJvaWRzID0gKHRoaXMuYm9pZHMgPSBbXSk7XG5cbiAgZm9yIChcbiAgICB2YXIgaSA9IDAsIGwgPSBvcHRzLmJvaWRzID09PSB1bmRlZmluZWQgPyAxNTAgOiBvcHRzLmJvaWRzO1xuICAgIGkgPCBsO1xuICAgIGkgKz0gMVxuICApIHtcbiAgICBib2lkc1tpXSA9IG5ldyBCb2lkKFxuICAgICAgbmV3IFZlY3RvcihNYXRoLnJhbmRvbSgpICogMTAwIC0gNTAsIE1hdGgucmFuZG9tKCkgKiAxMDAgLSA1MCksXG4gICAgICBuZXcgVmVjdG9yKDAsIDApXG4gICAgKTtcbiAgfVxuXG4gIHRoaXMub24oXCJ0aWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgIGNhbGxiYWNrKGJvaWRzKTtcbiAgfSk7XG59XG5pbmhlcml0cyhCb2lkcywgRXZlbnRFbWl0dGVyKTtcblxuQm9pZHMucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGR0cmVlID0gbmV3IER0cmVlKCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ib2lkcy5sZW5ndGg7IGkrKykge1xuICAgIGR0cmVlLmluc2VydCh0aGlzLmJvaWRzW2ldKTtcbiAgfVxuXG4gIHRoaXMudGlja0RhdGEgPSB7fTtcbiAgdGhpcy50aWNrRGF0YS5kdHJlZSA9IGR0cmVlO1xufTtcblxuQm9pZHMucHJvdG90eXBlLmZpbmROZWlnaGJvcnMgPSBmdW5jdGlvbihwb2ludCkge1xuICB0aGlzLnRpY2tEYXRhLm5laWdoYm9ycyA9IHRoaXMudGlja0RhdGEuZHRyZWUubmVpZ2hib3JzKFxuICAgIHBvaW50LFxuICAgIHRoaXMubWF4RGlzdFNxXG4gICk7XG59O1xuXG5Cb2lkcy5wcm90b3R5cGUuY2FsY0NvaGVzaW9uID0gZnVuY3Rpb24oYm9pZCkge1xuICB2YXIgdG90YWwgPSBuZXcgVmVjdG9yKDAsIDApLFxuICAgIGRpc3RTcSxcbiAgICB0YXJnZXQsXG4gICAgbmVpZ2hib3JzID0gdGhpcy50aWNrRGF0YS5uZWlnaGJvcnMsXG4gICAgY291bnQgPSAwO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbmVpZ2hib3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGFyZ2V0ID0gbmVpZ2hib3JzW2ldLm5laWdoYm9yO1xuICAgIGlmIChib2lkID09PSB0YXJnZXQpIGNvbnRpbnVlO1xuXG4gICAgZGlzdFNxID0gbmVpZ2hib3JzW2ldLmRpc3RTcTtcbiAgICBpZiAoXG4gICAgICBkaXN0U3EgPCB0aGlzLmNvaGVzaW9uRGlzdGFuY2VTcSAmJlxuICAgICAgaXNJbkZyb250T2YoYm9pZCwgdGFyZ2V0LnBvc2l0aW9uKVxuICAgICkge1xuICAgICAgdG90YWwgPSB0b3RhbC5hZGQodGFyZ2V0LnBvc2l0aW9uKTtcbiAgICAgIGNvdW50Kys7XG4gICAgfVxuICB9XG5cbiAgaWYgKGNvdW50ID09PSAwKSByZXR1cm4gbmV3IFZlY3RvcigwLCAwKTtcblxuICByZXR1cm4gdG90YWxcbiAgICAuZGl2aWRlQnkoY291bnQpXG4gICAgLnN1YnRyYWN0KGJvaWQucG9zaXRpb24pXG4gICAgLm5vcm1hbGl6ZSgpXG4gICAgLnN1YnRyYWN0KGJvaWQuc3BlZWQpXG4gICAgLmxpbWl0KHRoaXMuYWNjZWxlcmF0aW9uTGltaXQpO1xufTtcblxuQm9pZHMucHJvdG90eXBlLmNhbGNTZXBhcmF0aW9uID0gZnVuY3Rpb24oYm9pZCkge1xuICB2YXIgdG90YWwgPSBuZXcgVmVjdG9yKDAsIDApLFxuICAgIHRhcmdldCxcbiAgICBkaXN0U3EsXG4gICAgbmVpZ2hib3JzID0gdGhpcy50aWNrRGF0YS5uZWlnaGJvcnMsXG4gICAgY291bnQgPSAwO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbmVpZ2hib3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGFyZ2V0ID0gbmVpZ2hib3JzW2ldLm5laWdoYm9yO1xuICAgIGlmIChib2lkID09PSB0YXJnZXQpIGNvbnRpbnVlO1xuXG4gICAgZGlzdFNxID0gbmVpZ2hib3JzW2ldLmRpc3RTcTtcbiAgICBpZiAoZGlzdFNxIDwgdGhpcy5zZXBhcmF0aW9uRGlzdGFuY2VTcSkge1xuICAgICAgdG90YWwgPSB0b3RhbC5hZGQoXG4gICAgICAgIHRhcmdldC5wb3NpdGlvblxuICAgICAgICAgIC5zdWJ0cmFjdChib2lkLnBvc2l0aW9uKVxuICAgICAgICAgIC5ub3JtYWxpemUoKVxuICAgICAgICAgIC5kaXZpZGVCeSh0YXJnZXQucG9zaXRpb24uZGlzdGFuY2UoYm9pZC5wb3NpdGlvbikpXG4gICAgICApO1xuICAgICAgY291bnQrKztcbiAgICB9XG4gIH1cblxuICBpZiAoY291bnQgPT09IDApIHJldHVybiBuZXcgVmVjdG9yKDAsIDApO1xuXG4gIHJldHVybiB0b3RhbFxuICAgIC5kaXZpZGVCeShjb3VudClcbiAgICAubm9ybWFsaXplKClcbiAgICAuYWRkKGJvaWQuc3BlZWQpIC8vIEFkZGluZyBzcGVlZCBpbnN0ZWFkIG9mIHN1YnRyYWN0aW5nIGJlY2F1c2Ugc2VwYXJhdGlvbiBpcyByZXB1bHNpdmVcbiAgICAubGltaXQodGhpcy5hY2NlbGVyYXRpb25MaW1pdCk7XG59O1xuXG5Cb2lkcy5wcm90b3R5cGUuY2FsY0FsaWdubWVudCA9IGZ1bmN0aW9uKGJvaWQpIHtcbiAgdmFyIHRvdGFsID0gbmV3IFZlY3RvcigwLCAwKSxcbiAgICB0YXJnZXQsXG4gICAgZGlzdFNxLFxuICAgIG5laWdoYm9ycyA9IHRoaXMudGlja0RhdGEubmVpZ2hib3JzLFxuICAgIGNvdW50ID0gMDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG5laWdoYm9ycy5sZW5ndGg7IGkrKykge1xuICAgIHRhcmdldCA9IHRoaXMudGlja0RhdGEubmVpZ2hib3JzW2ldLm5laWdoYm9yO1xuICAgIGlmIChib2lkID09PSB0YXJnZXQpIGNvbnRpbnVlO1xuXG4gICAgZGlzdFNxID0gbmVpZ2hib3JzW2ldLmRpc3RTcTtcbiAgICBpZiAoXG4gICAgICBkaXN0U3EgPCB0aGlzLmFsaWdubWVudERpc3RhbmNlU3EgJiZcbiAgICAgIGlzSW5Gcm9udE9mKGJvaWQsIHRhcmdldC5wb3NpdGlvbilcbiAgICApIHtcbiAgICAgIHRvdGFsID0gdG90YWwuYWRkKHRhcmdldC5zcGVlZCk7XG4gICAgICBjb3VudCsrO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjb3VudCA9PT0gMCkgcmV0dXJuIG5ldyBWZWN0b3IoMCwgMCk7XG5cbiAgcmV0dXJuIHRvdGFsXG4gICAgLmRpdmlkZUJ5KGNvdW50KVxuICAgIC5ub3JtYWxpemUoKVxuICAgIC5zdWJ0cmFjdChib2lkLnNwZWVkKVxuICAgIC5saW1pdCh0aGlzLmFjY2VsZXJhdGlvbkxpbWl0KTtcbn07XG5cbkJvaWRzLnByb3RvdHlwZS50aWNrID0gZnVuY3Rpb24oKSB7XG4gIHZhciBib2lkO1xuICB0aGlzLmluaXQoKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYm9pZHMubGVuZ3RoOyBpKyspIHtcbiAgICBib2lkID0gdGhpcy5ib2lkc1tpXTtcbiAgICB0aGlzLmZpbmROZWlnaGJvcnMoYm9pZC5wb3NpdGlvbik7XG5cbiAgICBib2lkLmFjY2VsZXJhdGlvbiA9IHRoaXMuY2FsY0NvaGVzaW9uKGJvaWQpXG4gICAgICAubXVsdGlwbHlCeSh0aGlzLmNvaGVzaW9uRm9yY2UpXG4gICAgICAuYWRkKHRoaXMuY2FsY0FsaWdubWVudChib2lkKS5tdWx0aXBseUJ5KHRoaXMuYWxpZ25tZW50Rm9yY2UpKVxuICAgICAgLnN1YnRyYWN0KHRoaXMuY2FsY1NlcGFyYXRpb24oYm9pZCkubXVsdGlwbHlCeSh0aGlzLnNlcGFyYXRpb25Gb3JjZSkpO1xuICB9XG5cbiAgZGVsZXRlIHRoaXMudGlja0RhdGE7XG5cbiAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmJvaWRzLmxlbmd0aDsgaisrKSB7XG4gICAgYm9pZCA9IHRoaXMuYm9pZHNbal07XG4gICAgYm9pZC5zcGVlZCA9IGJvaWQuc3BlZWQuYWRkKGJvaWQuYWNjZWxlcmF0aW9uKS5saW1pdCh0aGlzLnNwZWVkTGltaXQpO1xuXG4gICAgYm9pZC5wb3NpdGlvbiA9IGJvaWQucG9zaXRpb24uYWRkKGJvaWQuc3BlZWQpO1xuICAgIGRlbGV0ZSBib2lkLmFjY2VsZXJhdGlvbjtcbiAgfVxuXG4gIHRoaXMuZW1pdChcInRpY2tcIiwgdGhpcy5ib2lkcyk7XG59O1xuXG5mdW5jdGlvbiBpc0luRnJvbnRPZihib2lkLCBwb2ludCkge1xuICByZXR1cm4gKFxuICAgIGJvaWQucG9zaXRpb24uYW5nbGUoYm9pZC5wb3NpdGlvbi5hZGQoYm9pZC5zcGVlZCksIHBvaW50KSA8PSBNYXRoLlBJIC8gM1xuICApO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vanMvaW5kZXguanMiLCJtb2R1bGUuZXhwb3J0cyA9IER0cmVlO1xuXG5mdW5jdGlvbiBEdHJlZSgpIHtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxuRHRyZWUucHJvdG90eXBlLmluc2VydCA9IGZ1bmN0aW9uKG9iaikge1xuICB0aGlzLnJvb3QgPSBpbnNlcnQodGhpcy5yb290LCBvYmosIGZhbHNlKTtcbn07XG5cbkR0cmVlLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gY29udGFpbnModGhpcy5yb290LCBvYmopO1xufTtcblxuRHRyZWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0b1N0cmluZyh0aGlzLnJvb3QpO1xufTtcblxuRHRyZWUucHJvdG90eXBlLm5laWdoYm9ycyA9IGZ1bmN0aW9uKHBvaW50LCByYWRpdXNTcSkge1xuICB2YXIgb2JqZWN0cyA9IFtdLFxuICAgIHN0YWNrID0gW3RoaXMucm9vdF0sXG4gICAgZGlzdFNxLFxuICAgIGRpc3RYLFxuICAgIGRpc3RZLFxuICAgIG5vZGUsXG4gICAgY21wLFxuICAgIHBvc2l0aW9uLFxuICAgIGRpc3QybGluZTtcblxuICAvLyBOb3Qgc3BlZWRpbmcgdXAgZW5vdWdoIHdpdGggcmVjdXJzaW9uXG4gIHdoaWxlIChzdGFjay5sZW5ndGggPiAwKSB7XG4gICAgbm9kZSA9IHN0YWNrLnBvcCgpO1xuICAgIHBvc2l0aW9uID0gbm9kZS52YWx1ZS5wb3NpdGlvbjtcbiAgICBpc0V2ZW4gPSBub2RlLmlzRXZlbjtcblxuICAgIGRpc3RYID0gcG9pbnQueCAtIHBvc2l0aW9uLng7XG4gICAgZGlzdFkgPSBwb2ludC55IC0gcG9zaXRpb24ueTtcbiAgICBkaXN0U3EgPSBkaXN0WCAqIGRpc3RYICsgZGlzdFkgKiBkaXN0WTtcblxuICAgIGlmIChkaXN0U3EgPD0gcmFkaXVzU3EpXG4gICAgICBvYmplY3RzLnB1c2goe1xuICAgICAgICBuZWlnaGJvcjogbm9kZS52YWx1ZSxcbiAgICAgICAgZGlzdFNxOiBkaXN0U3FcbiAgICAgIH0pO1xuXG4gICAgY21wID0gaXNFdmVuID8gZGlzdFkgfHwgZGlzdFggOiBkaXN0WCB8fCBkaXN0WTtcbiAgICBkaXN0MmxpbmUgPSBNYXRoLnBvdyhpc0V2ZW4gPyBkaXN0WSA6IGRpc3RYLCAyKTtcblxuICAgIGlmIChub2RlLmxlZnQgJiYgKGNtcCA8PSAwIHx8IGRpc3QybGluZSA8PSByYWRpdXNTcSkpIHN0YWNrLnB1c2gobm9kZS5sZWZ0KTtcblxuICAgIGlmIChub2RlLnJpZ2h0ICYmIChjbXAgPj0gMCB8fCBkaXN0MmxpbmUgPD0gcmFkaXVzU3EpKVxuICAgICAgc3RhY2sucHVzaChub2RlLnJpZ2h0KTtcbiAgfVxuXG4gIHJldHVybiBvYmplY3RzO1xufTtcblxuZnVuY3Rpb24gaW5zZXJ0KG5vZGUsIG9iaiwgaXNFdmVuKSB7XG4gIGlmICghbm9kZSkge1xuICAgIHJldHVybiB7IHZhbHVlOiBvYmosIGlzRXZlbjogaXNFdmVuIH07XG4gIH1cblxuICB2YXIgY21wID0gb2JqLmNvbXBhcmUobm9kZS52YWx1ZSwgaXNFdmVuKTtcbiAgaWYgKGNtcCA8IDApIHtcbiAgICBub2RlLmxlZnQgPSBpbnNlcnQobm9kZS5sZWZ0LCBvYmosICFpc0V2ZW4pO1xuICB9IGVsc2UgaWYgKGNtcCA+IDApIHtcbiAgICBub2RlLnJpZ2h0ID0gaW5zZXJ0KG5vZGUucmlnaHQsIG9iaiwgIWlzRXZlbik7XG4gIH1cblxuICByZXR1cm4gbm9kZTtcbn1cblxuZnVuY3Rpb24gY29udGFpbnMobm9kZSwgb2JqLCBpc0V2ZW4pIHtcbiAgaWYgKCFub2RlKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGNtcCA9IG9iai5jb21wYXJlKG5vZGUudmFsdWUsIGlzRXZlbik7XG5cbiAgaWYgKGNtcCA8IDApIHJldHVybiBjb250YWlucyhub2RlLmxlZnQsIG9iaiwgIWlzRXZlbik7XG4gIGVsc2UgaWYgKGNtcCA+IDApIHJldHVybiBjb250YWlucyhub2RlLnJpZ2h0LCBvYmosICFpc0V2ZW4pO1xuXG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiB0b1N0cmluZyhub2RlKSB7XG4gIGlmICghbm9kZSkge1xuICAgIHJldHVybiBcIlwiO1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICBcInsgTDpcIiArXG4gICAgdG9TdHJpbmcobm9kZS5sZWZ0KSArXG4gICAgXCIsIE46XCIgK1xuICAgIG5vZGUudmFsdWUgK1xuICAgIFwiLCBSOlwiICtcbiAgICB0b1N0cmluZyhub2RlLnJpZ2h0KSArXG4gICAgXCJ9XCJcbiAgKTtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2pzL2R0cmVlLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==