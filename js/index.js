import Vector from "./vector.js";
import Boid from "./boid.js";

export default function Boids(opts) {
  if (!(this instanceof Boids)) return new Boids(opts);

  opts = opts || {};

  this.speedLimit = opts.speedLimit || 1;
  this.accelerationLimit = opts.accelerationLimit || 0.03;
  this.separationDistance = opts.separationDistance || 30;
  this.separationDistanceSq = Math.pow(this.separationDistance, 2);
  this.alignmentDistance = opts.alignmentDistance || 60;
  this.alignmentDistanceSq = Math.pow(this.alignmentDistance, 2);
  this.cohesionDistance = opts.cohesionDistance || 60;
  this.cohesionDistanceSq = Math.pow(this.cohesionDistance, 2);
  /* jshint laxbreak: true */
  this.separationForce = !isNaN(opts.separationForce)
    ? opts.separationForce
    : 2;
  this.cohesionForce = !isNaN(opts.cohesionForce) ? opts.cohesionForce : 1;
  this.alignmentForce = !isNaN(opts.alignmentForce) ? opts.alignmentForce : 1;
  this.maxDistSq = Math.max(
    this.separationDistanceSq,
    this.cohesionDistanceSq,
    this.alignmentDistanceSq
  );

  const boids = (this.boids = []);

  for (
    let i = 0, l = opts.boids === undefined ? 150 : opts.boids;
    i < l;
    i += 1
  ) {
    boids[i] = new Boid(
      new Vector(Math.random() * 100 - 50, Math.random() * 100 - 50),
      new Vector(0, 0)
    );
  }
}

Boids.prototype.findNeighbors = function(point) {
  const neighbors = [];
  for (let i = 0; i < this.boids.length; i++) {
    const boid = this.boids[i];

    if (point === boid.position) {
      continue;
    }

    const distSq = boid.position.distSquared(point);
    if (distSq < this.maxDistSq) {
      neighbors.push({
        neighbor: this.boids[i],
        distSq: distSq
      });
    }
  }

  return neighbors;
};

Boids.prototype.calcCohesion = function(boid, neighbors) {
  let total = new Vector(0, 0),
    count = 0;

  for (let i = 0; i < neighbors.length; i++) {
    const target = neighbors[i].neighbor;
    if (boid === target) continue;

    const distSq = neighbors[i].distSq;
    if (
      distSq < this.cohesionDistanceSq &&
      isInFrontOf(boid, target.position)
    ) {
      total = total.add(target.position);
      count++;
    }
  }

  if (count === 0) return new Vector(0, 0);

  return total
    .divideBy(count)
    .subtract(boid.position)
    .normalize()
    .subtract(boid.speed)
    .limit(this.accelerationLimit);
};

Boids.prototype.calcSeparation = function(boid, neighbors) {
  let total = new Vector(0, 0),
    count = 0;

  for (let i = 0; i < neighbors.length; i++) {
    const target = neighbors[i].neighbor;
    if (boid === target) continue;

    const distSq = neighbors[i].distSq;
    if (distSq < this.separationDistanceSq) {
      total = total.add(
        target.position
          .subtract(boid.position)
          .normalize()
          .divideBy(target.position.distance(boid.position))
      );
      count++;
    }
  }

  if (count === 0) return new Vector(0, 0);

  return total
    .divideBy(count)
    .normalize()
    .add(boid.speed) // Adding speed instead of subtracting because separation is repulsive
    .limit(this.accelerationLimit);
};

Boids.prototype.calcAlignment = function(boid, neighbors) {
  let total = new Vector(0, 0),
    count = 0;

  for (let i = 0; i < neighbors.length; i++) {
    const target = neighbors[i].neighbor;
    if (boid === target) continue;

    const distSq = neighbors[i].distSq;
    if (
      distSq < this.alignmentDistanceSq &&
      isInFrontOf(boid, target.position)
    ) {
      total = total.add(target.speed);
      count++;
    }
  }

  if (count === 0) return new Vector(0, 0);

  return total
    .divideBy(count)
    .normalize()
    .subtract(boid.speed)
    .limit(this.accelerationLimit);
};

Boids.prototype.tick = function() {
  const accelerations = [];
  for (let i = 0; i < this.boids.length; i++) {
    let boid = this.boids[i];
    let neighbors = this.findNeighbors(boid.position);

    const acceleration = this.calcCohesion(boid, neighbors)
      .multiplyBy(this.cohesionForce)
      .add(this.calcAlignment(boid, neighbors).multiplyBy(this.alignmentForce))
      .subtract(this.calcSeparation(boid, neighbors).multiplyBy(this.separationForce));

    accelerations.push(acceleration);
  }

  for (let j = 0; j < this.boids.length; j++) {
    const boid = this.boids[j];
    boid.speed = boid.speed.add(accelerations[j]).limit(this.speedLimit);
    boid.position = boid.position.add(boid.speed);
  }
};

function isInFrontOf(boid, point) {
  return (
    boid.position.angle(boid.position.add(boid.speed), point) <= Math.PI / 3
  );
}
