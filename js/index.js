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

    const distSq = distSquared(boid.position.arr(), point.arr());
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
  let total = [0, 0],
    count = 0;

  for (let i = 0; i < neighbors.length; i++) {
    const target = neighbors[i].neighbor;
    if (boid === target) continue;

    const distSq = neighbors[i].distSq;
    if (
      distSq < this.cohesionDistanceSq &&
      isInFrontOf(boid, target.position.arr())
    ) {
      add(total, target.position.arr());
      count++;
    }
  }

  if (count === 0) return [0, 0];

  divideBy(total, count);
  subtract(total, boid.position.arr());
  normalize(total);
  subtract(total, boid.speed.arr());
  limit(total, this.accelerationLimit);

  return total;
};

Boids.prototype.calcSeparation = function(boid, neighbors) {
  let total = [0, 0],
    count = 0;

  for (let i = 0; i < neighbors.length; i++) {
    const target = neighbors[i].neighbor;
    if (boid === target) continue;

    const distSq = neighbors[i].distSq;
    if (distSq < this.separationDistanceSq) {
      const position = target.position.arr();
      const boidPosition = boid.position.arr();
      const dist = distance(position, boidPosition);
      subtract(position, boidPosition);
      normalize(position);
      divideBy(position, dist);
      add(total, position);
      count++;
    }
  }

  if (count === 0) return [0, 0];

  divideBy(total, count);
  normalize(total);
  add(total, boid.speed.arr());
  limit(total, this.accelerationLimit);

  return total;
};

Boids.prototype.calcAlignment = function(boid, neighbors) {
  let total = [0, 0],
    count = 0;

  for (let i = 0; i < neighbors.length; i++) {
    const target = neighbors[i].neighbor;
    if (boid === target) continue;

    const distSq = neighbors[i].distSq;
    if (
      distSq < this.alignmentDistanceSq &&
      isInFrontOf(boid, target.position.arr())
    ) {
      add(total, target.speed.arr());
      count++;
    }
  }

  if (count === 0) return total;

  divideBy(total, count);
  normalize(total);
  subtract(total, boid.speed.arr());
  limit(total, this.accelerationLimit);

  return total;
};

Boids.prototype.tick = function() {
  const accelerations = [];
  for (let i = 0; i < this.boids.length; i++) {
    let boid = this.boids[i];
    let neighbors = this.findNeighbors(boid.position);
    const acceleration = this.calcCohesion(boid, neighbors);
    multiplyBy(acceleration, this.cohesionForce);

    const alignmentArr = this.calcAlignment(boid, neighbors);
    multiplyBy(alignmentArr, this.alignmentForce);
    add(acceleration, alignmentArr);

    const separationArr = this.calcSeparation(boid, neighbors);
    multiplyBy(separationArr, this.separationForce);
    subtract(acceleration, separationArr);

    accelerations.push(acceleration);
  }

  for (let j = 0; j < this.boids.length; j++) {
    const boid = this.boids[j];
    boid.speed = boid.speed.add(new Vector(accelerations[j][0], accelerations[j][1])).limit(this.speedLimit);
    boid.position = boid.position.add(boid.speed);
  }
};

function multiplyBy(vec, scalar) {
  vec[0] *= scalar;
  vec[1] *= scalar;
}

function add(vec1, vec2) {
  vec1[0] += vec2[0];
  vec1[1] += vec2[1];
}

function subtract(vec1, vec2) {
  vec1[0] -= vec2[0];
  vec1[1] -= vec2[1];
}

function distSquared(vec1, vec2) {
  return Math.pow(vec1[0] - vec2[0], 2) + Math.pow(vec1[1] - vec2[1], 2);
}

function distance(vec1, vec2) {
  return Math.sqrt(distSquared(vec1, vec2));
}

function magnitude(vec) {
  return distance(vec, [0, 0]);
}

function normalize(vec) {
  divideBy(vec, magnitude(vec));
}

function divideBy(vec, scalar) {
  if (scalar !== 0) {
    vec[0] /= scalar;
    vec[1] /= scalar;
  }
}

function limit(vec, scalar) {
  const vecMagnitude = magnitude(vec);
  if (vecMagnitude > scalar) {
    normalize(vec);
    multiplyBy(vec, scalar);
  }
}

function angle(pivot, p1, p2) {
  const vec1 = pivot.slice();
  subtract(vec1, p1);
  normalize(vec1);

  const vec2 = pivot.slice();
  subtract(vec2, p2);
  normalize(vec2);

  // Rounding is because sometimes the value goes beyond 1.0
  // due to floating point precision errors
  const cos = Math.round((vec1[0] * vec2[0] + vec1[1] * vec2[1]) * 10000) / 10000;

  return Math.acos(cos);
}

function isInFrontOf(boid, p2) {
  const p1 = boid.position.arr().slice();
  add(p1, boid.speed.arr());

  return angle(boid.position.arr(), p1, p2) <= Math.PI / 3;
}
