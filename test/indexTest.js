import assert from 'assert';
import Boids from '../js/index.js';
import Vector from '../js/vector.js';
import Boid from '../js/boid.js';

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
  describe("Separation", function() {
    it("should slow down for a boid in front", function() {
      const boids = new Boids(makeOptions([1, 0, 0]));
      boids.boids = [newBoid(0, 0, 0.5, 0.5), newBoid(10, 10, 0, 0)];
      boids.tick();
      assertApprox(boids.boids[0].position.x, 0.4788);
      assertApprox(boids.boids[0].position.y, 0.4788);
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
      assertApprox(boids.boids[0].position.x, 0.5212);
      assertApprox(boids.boids[0].position.y, 0.5212);
    });
  });

  describe("Cohesion", function() {
    it("should move towards the nearby boids", function() {
      const boids = new Boids(makeOptions([0, 1, 0]));
      boids.boids = [newBoid(0, 0, 0.5, 0.5), newBoid(10, 10, 0, 0)];
      boids.tick();
      assertApprox(boids.boids[0].position.x, 0.5212);
      assertApprox(boids.boids[0].position.y, 0.5212);
    });
    it("should ignore far away boids", function() {
      const boids = new Boids(makeOptions([0, 1, 0]));
      boids.boids = [newBoid(0, 0, 0.5, 0.5), newBoid(60, 60, 1, 0)];
      boids.tick();
      assertApprox(boids.boids[0].position.x, 0.5);
      assertApprox(boids.boids[0].position.y, 0.5);
    });
    it("should ignore boids behind", function() {
      const boids = new Boids(makeOptions([0, 1, 0]));
      boids.boids = [newBoid(0, 0, 0.5, 0.5), newBoid(-10, -10, 1, 1)];
      boids.tick();
      assertApprox(boids.boids[0].position.x, 0.5);
      assertApprox(boids.boids[0].position.y, 0.5);
    });
  });

  describe("Alignment", function() {
    it("should align towards nearby boid", function() {
      const boids = new Boids(makeOptions([0, 0, 1]));
      boids.boids = [newBoid(0, 0, 0.5, 0.5), newBoid(10, 10, 0.5, 0)];
      boids.tick();
      assertApprox(boids.boids[0].speed.x, 0.5300);
      assertApprox(boids.boids[0].speed.y, 0.5000);
    });
    it("should avoid far away boids", function() {
      const boids = new Boids(makeOptions([0, 0, 1]));
      boids.boids = [newBoid(0, 0, 0.5, 0.5), newBoid(60, 60, 0, 0)];
      boids.tick();
      assertApprox(boids.boids[0].speed.x, 0.5);
      assertApprox(boids.boids[0].speed.y, 0.5);
    });
    it("should avoid boids behind", function() {
      const boids = new Boids(makeOptions([0, 0, 1]));
      boids.boids = [newBoid(0, 0, 0.5, 0.5), newBoid(-10, -10, 0.5, 0)];
      boids.tick();
      assertApprox(boids.boids[0].speed.x, 0.5);
      assertApprox(boids.boids[0].speed.y, 0.5);
    });
  });

  it("should tick", function() {
    const boids = new Boids(makeOptions());
    const boid1 = newBoid(0, 0, 0.5, 0.5),
      boid2 = newBoid(10, 10, 0, 0),
      boid3 = newBoid(60, 60, 0, 0),
      boid4 = newBoid(-10, -10, 0, 0);
    boids.boids = [boid1, boid2, boid3, boid4];

    boids.tick();
    assertBoid(boid1, [0.5212, 0.5212, 0.5212, 0.5212]);
    assertBoid(boid2, [10.0424, 10.0424, 0.0424, 0.0424]);
    assertBoid(boid3, [60, 60, 0, 0]);
    assertBoid(boid4, [-10.0424, -10.0424, -0.0424, -0.0424]);

    boids.tick();
    assertBoid(boid2, [10.1273, 10.1273, 0.0849, 0.0849]);
    assertBoid(boid3, [60, 60, 0, 0]);
    assertBoid(boid4, [-10.1273, -10.1273, -0.0849, -0.0849]);

    boids.tick();
    assertBoid(boid1, [1.8394, 1.8394, 0.6909, 0.6909]);
    assertBoid(boid2, [10.2546, 10.2546, 0.1273, 0.1273]);
    assertBoid(boid3, [60, 60, 0, 0]);
    assertBoid(boid4, [-10.2546, -10.2546, -0.1273, -0.1273]);

    boids.tick();
    assertBoid(boid1, [2.5465, 2.5465, 0.7071, 0.7071]);
    assertBoid(boid2, [10.4243, 10.4243, 0.1697, 0.1697]);
    assertBoid(boid3, [60, 60, 0, 0]);
    assertBoid(boid4, [-10.4243, -10.4243, -0.1697, -0.1697]);
  });

  function assertBoid(boid, val) {
    assertApprox(boid.position.x, val[0]);
    assertApprox(boid.position.y, val[1]);

    assertApprox(boid.speed.x, val[2]);
    assertApprox(boid.speed.y, val[3]);
  }

  function assertApprox(val, val2) {
    assert.equal(val.toFixed(4), val2.toFixed(4));
  }
});
