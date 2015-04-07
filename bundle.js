;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){

function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.add = function(v) {
  return new Vector(this.x + v.x, this.y + v.y);
};

Vector.prototype.distSquared = function(v) {
  return Math.pow(this.x - v.x, 2) + 
    Math.pow(this.y - v.y, 2);
};

Vector.prototype.distance = function(v) {
  return Math.sqrt(this.distSquared(v));
};

Vector.prototype.multiplyBy = function(s) {
  return new Vector(this.x * s, this.y * s);
};

Vector.prototype.neg = function(v) {
  return new Vector(-this.x, -this.y);
};

Vector.prototype.magnitude = function() {
  return this.distance(new Vector(0, 0));
};

Vector.prototype.normalize = function() {
  var magnitude = this.magnitude();
  
  if(magnitude === 0)
    return new Vector(0, 0);

  return new Vector(this.x / magnitude, this.y / magnitude);
};

Vector.prototype.subtract = function(v) {
  return this.add(v.neg());
};

Vector.prototype.divideBy = function(s) {
  return this.multiplyBy(1 / s);
};

Vector.prototype.limit = function(s) {
  if(this.magnitude() > s)
    return this.normalize().multiplyBy(s);

  return this;
};

Vector.prototype.angle = function(p1, p2) {
  var v1 = this.subtract(p1).normalize(),
    v2 = this.subtract(p2).normalize(),
    // Rounding is because sometimes the value goes beyond 1.0 
    // due to floating point precision errors
    cos = Math.round((v1.x * v2.x + v1.y * v2.y) * 10000) / 10000;

  return Math.acos(cos);
};

Vector.prototype.compare = function(that, y) {
  return (y && (this.y - that.y || this.x - that.x)) ||
    (this.x - that.x || this.y - that.y);
};

Vector.prototype.toString = function() {
  return "{x:" + this.x + ", y:" + this.y + "}";
};

module.exports = Vector;

},{}],2:[function(require,module,exports){

module.exports = Boid;

function Boid(position, speed) {
  this.position = position;
  this.speed = speed;
}

Boid.prototype.compare = function(that, isEven) {
  return this.position.compare(that.position, isEven);
};

Boid.prototype.toString = function() {
  return this.position.toString();
};

},{}],3:[function(require,module,exports){
var fps = require('fps'),
  ticker = require('ticker'),
  debounce = require('debounce'),
  Boids = require('./'),
  Vector = require('./vector'),
  Boid = require('./boid');


var anchor = document.createElement('a'),
  canvas = document.createElement('canvas'),
  ctx = canvas.getContext('2d'),
  boids = Boids();

canvas.addEventListener('click', function(e) {
  var x = e.pageX,
    y = e.pageY,
    halfHeight = canvas.height/2,
    halfWidth = canvas.width/2;
  x = x - halfWidth;
  y = y - halfHeight;
  if (boids.boids.length < 500) 
    boids.boids.push(
      new Boid(new Vector(x, y), new Vector(Math.random()*6-3,Math.random()*6-3))
    );
});

window.onresize = debounce(function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}, 100);
window.onresize();

anchor.setAttribute('href', '#');
anchor.appendChild(canvas);
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.appendChild(anchor);

ticker(window, 60).on('tick', function() {
  frames.tick();
  boids.tick();
}).on('draw', function() {
  var boidData = boids.boids,
    halfHeight = canvas.height/2,
    halfWidth = canvas.width/2;

  ctx.fillStyle = 'rgba(255,241,235,0.25)'; // '#FFF1EB'
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#543D5E';
  for (var i = 0, l = boidData.length, x, y; i < l; i += 1) {
    x = boidData[i].position.x; y = boidData[i].position.y;
    // wrap around the screen
    boidData[i].position.x = x > halfWidth ? -halfWidth : -x > halfWidth ? halfWidth : x;
    boidData[i].position.y = y > halfHeight ? -halfHeight : -y > halfHeight ? halfHeight : y;
    ctx.fillRect(x + halfWidth, y + halfHeight, 2, 2);
  }
});

var frameText = document.querySelector('[data-fps]');
var countText = document.querySelector('[data-count]');
var frames = fps({ every: 10, decay: 0.04 }).on('data', function(rate) {
  for (var i = 0; i < 3; i += 1) {
    if (rate <= 56 && boids.boids.length > 10) boids.boids.pop();
    if (rate >= 60 && boids.boids.length < 300) 
      boids.boids.push(
        new Boid(new Vector(0,0), new Vector(Math.random()*6-3,Math.random()*6-3))
      );
  }
  frameText.innerHTML = String(Math.round(rate));
  countText.innerHTML = String(boids.boids.length);
});

},{"./vector":1,"./boid":2,"./":4,"ticker":5,"fps":6,"debounce":7}],8:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],9:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
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
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":8}],7:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
module.exports = Dtree;

function Dtree() {
  this.size = 0;
}

Dtree.prototype.insert = function(obj) {
  this.root = insert(this.root, obj, false);
};

Dtree.prototype.contains = function(obj) {
  return contains(this.root, obj);
};

Dtree.prototype.toString = function() {
  return toString(this.root);
};

Dtree.prototype.neighbors = function(point, radiusSq) {
  var objects = [],
    stack = [this.root],
    distSq,
    distX, distY,
    node,
    cmp,
    position,
    dist2line;

  // Not speeding up enough with recursion
  while(stack.length > 0) {
    node = stack.pop();
    position = node.value.position;
    isEven = node.isEven;

    distX = point.x - position.x;
    distY = point.y - position.y;
    distSq = distX * distX + distY * distY;

    if(distSq <= radiusSq) 
      objects.push({
        neighbor: node.value,
        distSq: distSq
      });

    cmp = (isEven ? (distY || distX) : (distX || distY));
    dist2line = Math.pow(isEven ? distY : distX, 2);

    if(node.left && (cmp <= 0 || dist2line <= radiusSq))
      stack.push(node.left);

    if(node.right && (cmp >= 0 || dist2line <= radiusSq))
      stack.push(node.right);

  }

  return objects;
};

function insert(node, obj, isEven) {
  if(!node) {
    return { value : obj, isEven: isEven };
  }

  var cmp = obj.compare(node.value, isEven);
  if(cmp < 0) {
    node.left = insert(node.left, obj, !isEven);
  } else if (cmp > 0) {
    node.right = insert(node.right, obj, !isEven);
  }

  return node;
}

function contains(node, obj, isEven) {
  if(!node) 
    return false;

  var cmp = obj.compare(node.value, isEven);
  
  if(cmp < 0)
    return contains(node.left, obj, !isEven);
  else if (cmp > 0)
    return contains(node.right, obj, !isEven);

  return true;

}

function toString(node) {
  if(!node) {
    return '';
  }

  return '{ L:' + toString(node.left) + 
    ', N:' + node.value + 
    ', R:' + toString(node.right) + '}';
}

},{}],4:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter, 
  inherits = require('inherits'),
  Vector = require('./vector'),
  Dtree = require('./dtree'),
  Boid = require('./boid');

module.exports = Boids;

function Boids(opts, callback) {
  if (!(this instanceof Boids)) return new Boids(opts, callback);
  EventEmitter.call(this);

  opts = opts || {};
  callback = callback || function(){};

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
  this.maxDistSq = Math.max(this.separationDistanceSq, 
      this.cohesionDistanceSq, this.alignmentDistanceSq);

  var boids = this.boids = [];

  for (var i = 0, l = opts.boids === undefined ? 150 : opts.boids; i < l; i += 1) {
    boids[i] = new Boid( 
      new Vector(Math.random()*100 - 50, Math.random()*100 - 50),
      new Vector(0, 0)
    );
  }

  this.on('tick', function() {
    callback(boids);
  });
}
inherits(Boids, EventEmitter);

Boids.prototype.init = function() {
  var dtree = new Dtree();
  for(var i=0; i<this.boids.length; i++) {
    dtree.insert(this.boids[i]);
  }

  this.tickData = {};
  this.tickData.dtree = dtree;
};

Boids.prototype.findNeighbors = function(point) {
  this.tickData.neighbors = this.tickData.dtree.neighbors(point, this.maxDistSq);
};

Boids.prototype.calcCohesion = function(boid) {
  var total = new Vector(0, 0),
    distSq,
    target,
    neighbors = this.tickData.neighbors,
    count = 0;
  
  for(var i=0; i<neighbors.length; i++) {
    target = neighbors[i].neighbor;
    if(boid === target)
      continue;

    distSq = neighbors[i].distSq;
    if(distSq < this.cohesionDistanceSq &&
        isInFrontOf(boid, target.position)) {
      total = total.add(target.position);
      count++;
    }
  }

  if( count === 0) 
    return new Vector(0, 0);

  return total
    .divideBy(count)
    .subtract(boid.position)
    .normalize()
    .subtract(boid.speed)
    .limit(this.accelerationLimit);
};

Boids.prototype.calcSeparation = function(boid) {
  var total = new Vector(0, 0),
    target,
    distSq,
    neighbors = this.tickData.neighbors,
    count = 0; 

  for(var i=0; i<neighbors.length; i++) {
    target = neighbors[i].neighbor;
    if(boid === target)
      continue;

    distSq = neighbors[i].distSq;
    if(distSq < this.separationDistanceSq) {
      total = total.add(
        target.position
          .subtract(boid.position)
          .normalize()
          .divideBy(
            target.position.distance(boid.position)
          )
        );
      count++;
    }

  }

  if(count === 0) 
    return new Vector(0, 0);

  return total
    .divideBy(count)
    .normalize()
    .add(boid.speed) // Adding speed instead of subtracting because separation is repulsive
    .limit(this.accelerationLimit);
};

Boids.prototype.calcAlignment = function(boid) {
  var total = new Vector(0, 0),
    target,
    distSq,
    neighbors = this.tickData.neighbors,
    count = 0;

  for(var i=0; i<neighbors.length; i++) {
    target = this.tickData.neighbors[i].neighbor;
    if(boid === target)
      continue;

    distSq = neighbors[i].distSq;
    if(distSq < this.alignmentDistanceSq && 
        isInFrontOf(boid, target.position)) {
      total = total.add(target.speed);
      count++;
    }
  }

  if (count === 0)
    return new Vector(0, 0);

  return total
    .divideBy(count)
    .normalize()
    .subtract(boid.speed)
    .limit(this.accelerationLimit);
};

Boids.prototype.tick = function() {

  var boid;
  this.init();

  for(var i=0; i<this.boids.length; i++) {
    boid = this.boids[i];
    this.findNeighbors(boid.position);

    boid.acceleration = this.calcCohesion(boid)
      .multiplyBy(this.cohesionForce)
      .add(this.calcAlignment(boid)
        .multiplyBy(this.alignmentForce))
      .subtract(this.calcSeparation(boid)
        .multiplyBy(this.separationForce));
  }

  delete this.tickData;

  for(var j=0; j<this.boids.length; j++) {
    boid = this.boids[j];
    boid.speed = boid.speed
      .add(boid.acceleration)
      .limit(this.speedLimit);

    boid.position = boid.position.add(boid.speed);
    delete boid.acceleration;
  }

  this.emit('tick', this.boids);
};

function isInFrontOf(boid, point) {
  return boid.position.angle( boid.position.add(boid.speed), point) <= 
    ( Math.PI / 3);
}


},{"events":9,"./vector":1,"./dtree":10,"./boid":2,"inherits":11}],11:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter
  , inherits = require('inherits')

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


},{"events":9,"inherits":11}],5:[function(require,module,exports){
var raf = require('raf')
  , EventEmitter = require('events').EventEmitter

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

},{"events":9,"raf":12}],12:[function(require,module,exports){
(function(){module.exports = raf

var EE = require('events').EventEmitter
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


})()
},{"events":9}]},{},[3])
;