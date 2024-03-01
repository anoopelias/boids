const Boids = require("../js/"),
  Vector = require("../js/vector"),
  Boid = require("../js/boid"),
  assert = require("assert");

function makeOptions(force) {
  return {
    speedLimit: 1,
    accelerationLimit: 0.03,
    separationDistance: 30,
    alignmentDistance: 60,
    cohesionDistance: 60,
    separationForce: !isNaN(force && force[0]) ? force[0] : 2,
    cohesionForce: !isNaN(force && force[1]) ? force[1] : 1,
    alignmentForce: !isNaN(force && force[2]) ? force[2] : 2
  };
}

function newBoid(posX, posY, velX, velY) {
  return new Boid(new Vector(posX, posY), new Vector(velX, velY));
}

describe("Boid", function() {
  const boid1 = new Boid(new Vector(0, 0), new Vector(0.5, 0.5)),
    boid2 = new Boid(new Vector(10, 10), new Vector(0, 0)),
    boid3 = new Boid(new Vector(60, 60), new Vector(0, 0)),
    boid4 = new Boid(new Vector(-10, -10), new Vector(0, 0));

  describe("Separation", function () {
    it("should slow down for a boid in front", function() {
      const boids = new Boids(makeOptions([1, 0, 0]));
      boids.boids = [newBoid(0, 0, 0.5, 0.5), newBoid(10, 10, 0, 0)];
      boids.tick();
      assertApprox(boids.boids[0].position.x, 0.4788, 4);
      assertApprox(boids.boids[0].position.y, 0.4788, 4);
    });

    it("should ignore far away boids", function() {
      const boids = new Boids(makeOptions([1, 0, 0]));
      boids.boids = [newBoid(0, 0, 0.5, 0.5), newBoid(60, 60, 0, 0)];
      boids.tick();
      assert.equal(boids.boids[0].position.x, 0.5);
      assert.equal(boids.boids[0].position.y, 0.5);
    });

    it("should speed up for boids behind", function() {
      const boids = new Boids(makeOptions([1, 0, 0]));
      boids.boids = [newBoid(0, 0, 0.5, 0.5), newBoid(-10, -10, 0, 0)];
      boids.tick();
      assertApprox(boids.boids[0].position.x, 0.5212, 4);
      assertApprox(boids.boids[0].position.y, 0.5212, 4);
    });
  });

  describe("Cohesion", function () {
    it("should move towards the nearby boids", function() {
      const boids = new Boids(makeOptions([0, 1, 0]));
      boids.boids = [newBoid(0, 0, 0.5, 0.5), newBoid(10, 10, 0, 0)];
      boids.tick();
      assertApprox(boids.boids[0].position.x, 0.5212, 4);
      assertApprox(boids.boids[0].position.y, 0.5212, 4);
    });
    it("should ignore far away boids", function() {
      const boids = new Boids(makeOptions([0, 1, 0]));
      boids.boids = [newBoid(0, 0, 0.5, 0.5), newBoid(60, 60, 1, 0)];
      boids.tick();
      assertApprox(boids.boids[0].position.x, 0.5, 4);
      assertApprox(boids.boids[0].position.y, 0.5, 4);
    });
    it("should ignore boids behind", function() {
      const boids = new Boids(makeOptions([0, 1, 0]));
      boids.boids = [newBoid(0, 0, 0.5, 0.5), newBoid(-10, -10, 1, 1)];
      boids.tick();
      assertApprox(boids.boids[0].position.x, 0.5, 4);
      assertApprox(boids.boids[0].position.y, 0.5, 4);
    });
  });

  describe("Alignment", function () {
    it("should align towards nearby boid", function() {
      const boids = new Boids(makeOptions([0, 0, 1]));
      boids.boids = [newBoid(0, 0, 0.5, 0.5), newBoid(10, 10, 0.5, 0)];
      boids.tick();
      assertApprox(boids.boids[0].speed.x, 0.5212, 4);
      assertApprox(boids.boids[0].speed.y, 0.4788, 4);
    });
    it("should avoid far away boids", function() {
      const boids = new Boids(makeOptions([0, 0, 1]));
      boids.boids = [newBoid(0, 0, 0.5, 0.5), newBoid(60, 60, 0, 0)];
      boids.tick();
      assertApprox(boids.boids[0].speed.x, 0.5, 4);
      assertApprox(boids.boids[0].speed.y, 0.5, 4);
    });
    it("should avoid boids behind", function() {
      const boids = new Boids(makeOptions([0, 0, 1]));
      boids.boids = [newBoid(0, 0, 0.5, 0.5), newBoid(-10, -10, 0.5, 0)];
      boids.tick();
      assertApprox(boids.boids[0].speed.x, 0.5, 4);
      assertApprox(boids.boids[0].speed.y, 0.5, 4);
    });
  });

  it("should tick", function() {
    const boids = new Boids(makeOptions());
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
    assertBoid(boid1, [1.8727, 1.8727, 0.5, 0.5]);
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
