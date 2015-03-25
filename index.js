var EventEmitter = require('events').EventEmitter, 
  inherits = require('inherits'),
  Vector = require('./vector');

module.exports = Boids;

function Boids(opts, callback) {
  if (!(this instanceof Boids)) return new Boids(opts, callback);
  EventEmitter.call(this);

  opts = opts || {};
  callback = callback || function(){};

  this.speedLimit = opts.speedLimit || 1;
  this.accelerationLimit = opts.accelerationLimit || 0.03;
  this.separationDistance = opts.separationDistance || 30;
  this.alignmentDistance = opts.alignmentDistance || 60;
  this.cohesionDistance = opts.cohesionDistance || 60;
  this.separationForce = opts.separationForce || 2;
  this.cohesionForce = opts.cohesionForce || 1;
  this.alignmentForce = opts.alignmentForce || opts.alignment || 1;
  this.attractors = opts.attractors || [];

  var boids = this.boids = [];

  for (var i = 0, l = opts.boids === undefined ? 150 : opts.boids; i < l; i += 1) {
    boids[i] = {
      position: new Vector(Math.random()*25, Math.random()*25),
      speed: new Vector(0, 0),
      acceleration: new Vector(0, 0)
    };
  }

  this.on('tick', function() {
    callback(boids);
  });
}
inherits(Boids, EventEmitter);

Boids.prototype.calcCohesion = function(boid) {
  var total = new Vector(0, 0);
  var count = 0;
  
  for(var i=0; i<this.boids.length; i++) {
    var target = this.boids[i];
    if(boid === target)
      continue;

    var dist = boid.position.distance(target.position);
    if(dist < this.cohesionDistance && 
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
  var total = new Vector(0, 0);
  var count = 0;

  for(var i=0; i<this.boids.length; i++) {
    var target = this.boids[i];
    if(boid === target)
      continue;

    var dist = boid.position.distance(target.position);
    if(dist < this.separationDistance) {
      total = total.add(
        target.position
          .subtract(boid.position)
          .normalize()
          .divideBy(dist));
      count++;
    }
  }

  if(count === 0) 
    return new Vector(0, 0);

  return total
    .divideBy(count)
    .normalize()
    .subtract(boid.speed)
    .limit(this.accelerationLimit);
};

Boids.prototype.calcAlignment = function(boid) {
  var total = new Vector(0, 0);
  var count = 0;

  for(var i=0; i<this.boids.length; i++) {
    var target = this.boids[i];
    if(boid === target)
      continue;

    var dist = boid.position.distance(target.position);
    if(dist < this.alignmentDistance && 
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
  for(var i=0; i<this.boids.length; i++) {
    boid = this.boids[i];
    var cohesion = this
      .calcCohesion(boid)
      .multiplyBy(this.cohesionForce);
    var separation = this
      .calcSeparation(boid)
      .multiplyBy(this.separationForce);
    var alignment = this
      .calcAlignment(boid)
      .multiplyBy(this.alignmentForce);

    boid.acceleration = cohesion.add(alignment).subtract(separation);
  }

  for(var j=0; j<this.boids.length; j++) {
    boid = this.boids[j];
    boid.speed = boid.speed
      .add(boid.acceleration)
      .limit(this.speedLimit);

    boid.position = boid.position.add(boid.speed);
    boid.acceleration = new Vector(0, 0);
  }

  this.emit('tick', this.boids);
};

function isInFrontOf(boid, point) {
  return boid.position.angle( boid.position.add(boid.speed), point) <= 
    ( Math.PI / 3);
}

