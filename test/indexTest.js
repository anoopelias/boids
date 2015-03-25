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

  var Boids = require('../js/');
  var Vector = require('../js/vector');
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

  it('should tick', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid2, boid3, boid4];

    boids.tick();
    assertBoid(boid1, [0.4364, 0.4364, 0.4364, 0.4364, 0, 0]);
    assertBoid(boid2, [10.0424, 10.0424, 0.0424, 0.0424, 0, 0]);
    assertBoid(boid3, [60, 60, 0, 0, 0, 0]);
    assertBoid(boid4, [-10.0424, -10.0424, -0.0424, -0.0424, 0, 0]);

    boids.tick();
    assertBoid(boid1, [0.8303, 0.8303, 0.3939, 0.3939, 0, 0]);
    assertBoid(boid2, [10.1273, 10.1273, 0.0849, 0.0849, 0, 0]);
    assertBoid(boid3, [60, 60, 0, 0, 0, 0]);
    assertBoid(boid4, [-10.1273, -10.1273, -0.0849, -0.0849, 0, 0]);

    boids.tick();
    assertBoid(boid1, [1.2454, 1.2454, 0.4151, 0.4151, 0, 0]);
    assertBoid(boid2, [10.2546, 10.2546, 0.1273, 0.1273, 0, 0]);
    assertBoid(boid3, [60, 60, 0, 0, 0, 0]);
    assertBoid(boid4, [-10.2546, -10.2546, -0.1273, -0.1273, 0, 0]);

    boids.tick();
    assertBoid(boid1, [1.6182, 1.6182, 0.3727, 0.3727, 0, 0]);
    assertBoid(boid2, [10.4243, 10.4243, 0.1697, 0.1697, 0, 0]);
    assertBoid(boid3, [60, 60, 0, 0, 0, 0]);
    assertBoid(boid4, [-10.4243, -10.4243, -0.1697, -0.1697, 0, 0]);

  });

  function assertBoid(boid, val) {
    assertApprox(boid.position.x, val[0], 4);
    assertApprox(boid.position.y, val[1], 4);

    assertApprox(boid.speed.x, val[2], 4);
    assertApprox(boid.speed.y, val[3], 4);

    assertApprox(boid.acceleration.x, val[4], 4);
    assertApprox(boid.acceleration.y, val[5], 4);

  }

  function assertApprox(val, val2, d) {
    assert.equal(val.toFixed(d), val2.toFixed(d));
  }

});
