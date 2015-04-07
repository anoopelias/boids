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

  var Boids = require('../js/'),
    Vector = require('../js/vector'),
    Boid = require('../js/boid'),
    assert = require('assert'),
    boid1 = new Boid(new Vector(0, 0), new Vector(0.5, 0.5)),
    boid2 = new Boid(new Vector(10, 10), new Vector(0, 0)),
    boid3 = new Boid(new Vector(60, 60), new Vector(0, 0)),
    boid4 = new Boid(new Vector(-10, -10), new Vector(0, 0));

  it('should calculate separation', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid2];
    boids.init();
    boids.findNeighbors(boid1.position);
    var sep = boids.calcSeparation(boid1);
    assertApprox(sep.x, 0.0212, 4);
    assertApprox(sep.y, 0.0212, 4);

  });

  it('should have zero separation for far away boids', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid3];
    boids.init();
    boids.findNeighbors(boid1.position);
    var sep = boids.calcSeparation(boid1);
    assert.equal(sep.x, 0);
    assert.equal(sep.y, 0);
  });

  it('should have non-zero separation for boids behind them', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid4];
    boids.init();
    boids.findNeighbors(boid1.position);
    var sep = boids.calcSeparation(boid1);
    assertApprox(sep.x, -0.0212, 4);
    assertApprox(sep.y, -0.0212, 4);

  });
  it('should have zero separation for boids in the same location', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, Object.create(boid1)];
    boids.init();
    boids.findNeighbors(boid1.position);
    var sep = boids.calcSeparation(boid1);
    assert.equal(sep.x, 0);
    assert.equal(sep.y, 0);

  });


  it('should calculate cohesion', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid2];
    boids.init();
    boids.findNeighbors(boid1.position);
    var sep = boids.calcCohesion(boid1);
    assertApprox(sep.x, 0.0212, 4);
    assertApprox(sep.y, 0.0212, 4);
  });

  it('should have zero cohesion for far away boids', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid3];
    boids.init();
    boids.findNeighbors(boid1.position);
    var sep = boids.calcCohesion(boid1);
    assert.equal(sep.x, 0);
    assert.equal(sep.y, 0);
  });

  it('should have zero cohesion for boids behind them', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid4];
    boids.init();
    boids.findNeighbors(boid1.position);
    var sep = boids.calcCohesion(boid1);
    assert.equal(sep.x, 0);
    assert.equal(sep.y, 0);
  });

  it('should calculate alignment', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid2];
    boids.init();
    boids.findNeighbors(boid1.position);
    var sep = boids.calcAlignment(boid1);
    assertApprox(sep.x, -0.0212, 4);
    assertApprox(sep.y, -0.0212, 4);
  });

  it('should have zero alignment for far away boids', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid3];
    boids.init();
    boids.findNeighbors(boid1.position);
    var sep = boids.calcAlignment(boid1);
    assert.equal(sep.x, 0);
    assert.equal(sep.y, 0);
  });

  it('should have zero alignment for boids behind them', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid4];
    boids.init();
    boids.findNeighbors(boid1.position);
    var sep = boids.calcAlignment(boid1);
    assert.equal(sep.x, 0);
    assert.equal(sep.y, 0);
  });

  it('should tick', function() {
    var boids = new Boids(defaultOptions);
    boids.boids = [boid1, boid2, boid3, boid4];

    boids.tick();
    assertBoid(boid1, [0.4364, 0.4364, 0.4364, 0.4364]);
    assertBoid(boid2, [10.0424, 10.0424, 0.0424, 0.0424]);
    assertBoid(boid3, [60, 60, 0, 0]);
    assertBoid(boid4, [-10.0424, -10.0424, -0.0424, -0.0424]);

    boids.tick();
    assertBoid(boid1, [0.8939, 0.8939, 0.4576, 0.4576]);
    assertBoid(boid2, [10.1273, 10.1273, 0.0849, 0.0849]);
    assertBoid(boid3, [60, 60, 0, 0]);
    assertBoid(boid4, [-10.1273, -10.1273, -0.0849, -0.0849]);

    boids.tick();
    assertBoid(boid1, [1.3727, 1.3727, 0.4788, 0.4788]);
    assertBoid(boid2, [10.2546, 10.2546, 0.1273, 0.1273]);
    assertBoid(boid3, [60, 60, 0, 0]);
    assertBoid(boid4, [-10.2546, -10.2546, -0.1273, -0.1273]);

    boids.tick();
    assertBoid(boid1, [1.8727, 1.8727, 0.5000, 0.5000]);
    assertBoid(boid2, [10.4243, 10.4243, 0.1697, 0.1697]);
    assertBoid(boid3, [60, 60, 0, 0]);
    assertBoid(boid4, [-10.4243, -10.4243, -0.1697, -0.1697]);

  });

  function assertBoid(boid, val) {
    assertApprox(boid.position.x, val[0], 4);
    assertApprox(boid.position.y, val[1], 4);

    assertApprox(boid.speed.x, val[2], 4);
    assertApprox(boid.speed.y, val[3], 4);

  }

  function assertApprox(val, val2, d) {
    assert.equal(val.toFixed(d), val2.toFixed(d));
  }

});
