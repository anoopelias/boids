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
    speed: new Vector(0, 0),
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

  function assertApprox(val, val2, d) {
    var power = Math.pow(10, d);
    var newVal = Math.round(power * val);
    var targetVal = val2 * power;
    assert.equal(newVal, targetVal);
  }

});
