describe('Boid', function() {
  var defaultOptions = {
    speedLimit: 1,
    accelerationLimit: 0.03,
    separationDistance: 30,
    alignmentDistance: 60,
    cohesionDistance: 60,
    separationForce: 2,
    cohesionForce: 1,
    alignmentForce: 2
  };

  var Boids = require('../');
  var Vector = require('../vector');
  var assert = require('assert');

  var boid1 = {
    position: new Vector(0, 0),
    speed: new Vector(0.5, 0.5),
    acceleration: new Vector(0, 0)
  };
  var boid2 = {
    position: new Vector(10, 10),
    speed: new Vector(0, 0),
    acceleration: new Vector(0, 0)
  };
  var boid3 = {
    position: new Vector(60, 60),
    speed: new Vector(0, 0),
    acceleration: new Vector(0, 0)
  };
  var boid4 = {
    position: new Vector(-10, -10),
    speed: new Vector(0, 0),
    acceleration: new Vector(0, 0)
  };

  it('should calculate separation', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid2];
    var sep = boids.calcSeparation(boid1);
    assertApprox(sep.x, 0.0212, 4);
    assertApprox(sep.y, 0.0212, 4);

  });

  it('should have zero separation for far away boids', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid3];
    var sep = boids.calcSeparation(boid1);
    assert.equal(sep.x, 0);
    assert.equal(sep.y, 0);
  });

  it('should have non-zero separation for boids behind them', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid4];
    var sep = boids.calcSeparation(boid1);
    assertApprox(sep.x, -0.0212, 4);
    assertApprox(sep.y, -0.0212, 4);

  });

  it('should calculate cohesion', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid2];
    var sep = boids.calcCohesion(boid1);
    assertApprox(sep.x, 0.0212, 4);
    assertApprox(sep.y, 0.0212, 4);
  });

  it('should have zero cohesion for far away boids', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid3];
    var sep = boids.calcCohesion(boid1);
    assert.equal(sep.x, 0);
    assert.equal(sep.y, 0);
  });

  it('should have zero cohesion for boids behind them', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid4];
    var sep = boids.calcCohesion(boid1);
    assert.equal(sep.x, 0);
    assert.equal(sep.y, 0);
  });

  it('should calculate alignment', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid2];
    var sep = boids.calcAlignment(boid1);
    assertApprox(sep.x, -0.0212, 4);
    assertApprox(sep.y, -0.0212, 4);
  });

  it('should have zero alignment for far away boids', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid3];
    var sep = boids.calcAlignment(boid1);
    assert.equal(sep.x, 0);
    assert.equal(sep.y, 0);
  });

  it('should have zero alignment for boids behind them', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid4];
    var sep = boids.calcAlignment(boid1);
    assert.equal(sep.x, 0);
    assert.equal(sep.y, 0);
  });

  function assertApprox(val, val2, d) {
    var power = Math.pow(10, d);
    var newVal = Math.round(power * val);
    var targetVal = val2 * power;
    assert.equal(newVal, targetVal);
  }

});
