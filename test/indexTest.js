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

describe("Boids Collection", function() {
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
      assertApprox(boids.boids[0].speed.x, 0.5212);
      assertApprox(boids.boids[0].speed.y, 0.4788);
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

  describe('findNeighbors', function() {
    it('should return an empty array if the boid itself is the only one', function() {
      const boidsInstance = new Boids({ boids: 0 }); // No initial boids from opts
      const boid1Pos = new Vector(0, 0);
      // Mocking just enough of the Boid and Vector structure for findNeighbors
      boidsInstance.boids = [
        { position: boid1Pos } 
      ];
      // maxDistSq is calculated in Boids constructor. Default alignmentDistance is 60. 60*60 = 3600
      // cohesionDistance is 60, separationDistance is 30. So maxDistSq will be 3600.
      
      const neighbors = boidsInstance.findNeighbors(boid1Pos);
      assert.deepStrictEqual(neighbors, [], "Should find no neighbors for a single boid");
    });

    it('should return an empty array if other boids are too far away', function() {
      const boidsInstance = new Boids({ boids: 0 }); // Start with no boids from options
      const boid1Pos = new Vector(0, 0); // The boid we're finding neighbors for

      // Create a mock boid that's far away
      const farBoid = {
        position: new Vector(100, 100) // distSq = 100^2 + 100^2 = 20000, maxDistSq = 3600
      };
      
      boidsInstance.boids = [
        { position: boid1Pos }, // The boid itself (won't be a neighbor)
        farBoid
      ];
      
      const neighbors = boidsInstance.findNeighbors(boid1Pos);
      assert.deepStrictEqual(neighbors, [], "Should find no neighbors if others are too far");
    });

    it('should find boids within maxDistSq and calculate distSq correctly', function() {
      const boidsInstance = new Boids({ boids: 0 }); // No initial boids
      // With default opts, maxDistSq is 3600 (from alignment/cohesion distance of 60)
      
      const boid0Pos = new Vector(0, 0); // The boid we are finding neighbors for

      const nearBoid1 = { id: 'near1', position: new Vector(10, 0) }; // distSq = 100
      const nearBoid2 = { id: 'near2', position: new Vector(0, 20) }; // distSq = 400
      const farBoid = { id: 'far1', position: new Vector(100, 0) };   // distSq = 10000 (too far)
      
      // The boid itself, needs a position for the loop skip condition `if (point === boid.position)`
      const selfBoid = { id: 'self', position: boid0Pos }; 

      boidsInstance.boids = [selfBoid, nearBoid1, nearBoid2, farBoid];
      
      const expectedNeighbors = [
        { neighbor: nearBoid1, distSq: 100 },
        { neighbor: nearBoid2, distSq: 400 }
      ];
      
      const actualNeighbors = boidsInstance.findNeighbors(boid0Pos);
      
      assert.strictEqual(actualNeighbors.length, 2, "Should find 2 neighbors");
      // Sort for stable comparison if order isn't guaranteed (though it should be by iteration order)
      actualNeighbors.sort((a, b) => a.neighbor.id.localeCompare(b.neighbor.id));
      expectedNeighbors.sort((a, b) => a.neighbor.id.localeCompare(b.neighbor.id));

      assert.deepStrictEqual(actualNeighbors, expectedNeighbors, "Should find correct neighbors with correct distSq");
    });
  });

  describe('calcCohesion', function() {
    it('should return a zero vector if no neighbors influence cohesion', function() {
      const boidsInstance = new Boids({ cohesionDistance: 60 }); // cohesionDistanceSq = 3600
      const mainBoid = new Boid(new Vector(0, 0), new Vector(1, 0)); // Real Boid and Vector

      // Scenario 1: No neighbors at all
      let neighbors = [];
      let cohesionVector = boidsInstance.calcCohesion(mainBoid, neighbors);
      assert.deepStrictEqual(cohesionVector, new Vector(0, 0), "No neighbors: Cohesion vector should be zero");

      // Scenario 2: Neighbors are too far
      const farNeighborBoid = new Boid(new Vector(100, 100), new Vector(0,0)); // distSq = 20000
      neighbors = [{ neighbor: farNeighborBoid, distSq: 20000 }];
      cohesionVector = boidsInstance.calcCohesion(mainBoid, neighbors);
      assert.deepStrictEqual(cohesionVector, new Vector(0, 0), "Far neighbors: Cohesion vector should be zero");

      // Scenario 3: Neighbors are close but not in front (mocking #isInFrontOf via angle)
      // #isInFrontOf returns true if angle <= Math.PI / 3 (approx 1.047)
      // We need to mock mainBoid.position.angle to control this.
      const originalAngleMethod = mainBoid.position.angle;
      mainBoid.position.angle = function(p1, p2) { // p1 is boid.position.add(boid.speed), p2 is target.position
        return Math.PI / 2; // Not in front
      };
      
      const closeBehindNeighborBoid = new Boid(new Vector(10, 10), new Vector(0,0)); // distSq = 200
      neighbors = [{ neighbor: closeBehindNeighborBoid, distSq: 200 }];
      cohesionVector = boidsInstance.calcCohesion(mainBoid, neighbors);
      assert.deepStrictEqual(cohesionVector, new Vector(0, 0), "Behind neighbors: Cohesion vector should be zero");
      
      mainBoid.position.angle = originalAngleMethod; // Restore original method
    });

    it('should calculate cohesion vector correctly for one influential neighbor', function() {
      const opts = { cohesionDistance: 60, accelerationLimit: 0.03, speedLimit: 1 };
      const boidsInstance = new Boids(opts);

      const mainBoidPos = new Vector(0, 0);
      const mainBoidSpeed = new Vector(0.5, 0);
      const mainBoid = new Boid(mainBoidPos, mainBoidSpeed);

      const neighborPos = new Vector(10, 0); // Directly in front
      const neighborSpeed = new Vector(0, 0); // Speed of neighbor irrelevant for cohesion calc
      const neighborBoid = new Boid(neighborPos, neighborSpeed);
      
      const neighbors = [{ neighbor: neighborBoid, distSq: 100 }]; // 10*10 = 100

      // Mock mainBoid.position.angle to ensure #isInFrontOf returns true
      const originalAngleMethod = mainBoid.position.angle;
      mainBoid.position.angle = function(p1, p2) { return 0; /* Directly in front */ };

      // Expected calculation:
      // 1. total = neighborPos = (10,0)
      // 2. count = 1
      // 3. avgPosition = (10,0)
      // 4. desired = avgPosition.subtract(mainBoidPos) = (10,0).subtract((0,0)) = (10,0)
      // 5. normalizedDesired = (10,0).normalize() = (1,0)
      // 6. steeringForce = normalizedDesired.subtract(mainBoidSpeed) = (1,0).subtract((0.5,0)) = (0.5,0)
      // 7. limitedForce = (0.5,0).limit(opts.accelerationLimit=0.03). Vector(0.5,0) has mag 0.5.
      //    Since 0.5 > 0.03, it will be scaled down to magnitude 0.03. So, (0.03, 0).
      const expectedCohesionVector = new Vector(0.03, 0);

      const actualCohesionVector = boidsInstance.calcCohesion(mainBoid, neighbors);
      
      assert.strictEqual(actualCohesionVector.x.toFixed(4), expectedCohesionVector.x.toFixed(4), "Cohesion X component");
      assert.strictEqual(actualCohesionVector.y.toFixed(4), expectedCohesionVector.y.toFixed(4), "Cohesion Y component");

      mainBoid.position.angle = originalAngleMethod; // Restore
    });
  });

  describe('calcSeparation', function() {
    it('should return a zero vector if no neighbors influence separation', function() {
      const opts = { separationDistance: 30 };
      const boidsInstance = new Boids(opts);
      const mainBoid = new Boid(new Vector(0,0), new Vector(1,0));

      // Scenario 1: No neighbors
      let neighbors = [];
      let separationVector = boidsInstance.calcSeparation(mainBoid, neighbors);
      assert.deepStrictEqual(separationVector, new Vector(0,0), "No neighbors: Separation vector should be zero");

      // Scenario 2: Neighbors are too far
      const farNeighborBoid = new Boid(new Vector(100,100), new Vector(0,0)); // distSq = 20000. separationDistanceSq = 900.
      neighbors = [{ neighbor: farNeighborBoid, distSq: 20000 }];
      separationVector = boidsInstance.calcSeparation(mainBoid, neighbors);
      assert.deepStrictEqual(separationVector, new Vector(0,0), "Far neighbors: Separation vector should be zero");
    });

    it('should calculate separation vector correctly for one influential neighbor', function() {
      const opts = { separationDistance: 30, accelerationLimit: 0.03, speedLimit: 1 };
      const boidsInstance = new Boids(opts);

      const mainBoidPos = new Vector(0,0);
      const mainBoidSpeed = new Vector(0,0); // Start with zero speed for simplicity here
      const mainBoid = new Boid(mainBoidPos, mainBoidSpeed);

      const neighborPos = new Vector(10,0); // dist = 10, distSq = 100. separationDistanceSq = 900.
      const neighborBoid = new Boid(neighborPos, new Vector(0,0));
      const neighbors = [{ neighbor: neighborBoid, distSq: 100 }];

      // Expected calculation for separation:
      // 1. diff = neighborPos.subtract(mainBoidPos) = (10,0)
      // 2. normalizedDiff = diff.normalize() = (1,0)
      // 3. dist = neighborPos.distance(mainBoidPos) = 10
      // 4. forceContribution = normalizedDiff.divideBy(dist) = (1,0).divideBy(10) = (0.1,0)
      // 5. total = (0.1,0)
      // 6. count = 1
      // 7. avgForce = total.divideBy(count) = (0.1,0)
      // 8. normalizedAvgForce = avgForce.normalize() = (1,0) 
      // 9. steeringForce = normalizedAvgForce.add(mainBoidSpeed) = (1,0).add((0,0)) = (1,0)
      // 10. limitedForce = steeringForce.limit(opts.accelerationLimit=0.03) = (0.03,0)
      const expectedSeparationVector = new Vector(0.03, 0);
      
      const actualSeparationVector = boidsInstance.calcSeparation(mainBoid, neighbors);

      assert.strictEqual(actualSeparationVector.x.toFixed(4), expectedSeparationVector.x.toFixed(4), "Separation X component");
      assert.strictEqual(actualSeparationVector.y.toFixed(4), expectedSeparationVector.y.toFixed(4), "Separation Y component");
    });
  });

  describe('calcAlignment', function() {
    it('should return a zero vector if no neighbors influence alignment', function() {
      const opts = { alignmentDistance: 60 };
      const boidsInstance = new Boids(opts);
      const mainBoid = new Boid(new Vector(0,0), new Vector(1,0)); // Speed is (1,0)

      // Scenario 1: No neighbors
      let neighbors = [];
      let alignmentVector = boidsInstance.calcAlignment(mainBoid, neighbors);
      assert.deepStrictEqual(alignmentVector, new Vector(0,0), "No neighbors: Alignment vector should be zero");

      // Scenario 2: Neighbors are too far
      const farNeighborBoid = new Boid(new Vector(100,100), new Vector(0,1)); // Far away, speed (0,1)
      neighbors = [{ neighbor: farNeighborBoid, distSq: 20000 }]; // alignmentDistanceSq = 3600
      alignmentVector = boidsInstance.calcAlignment(mainBoid, neighbors);
      assert.deepStrictEqual(alignmentVector, new Vector(0,0), "Far neighbors: Alignment vector should be zero");

      // Scenario 3: Neighbors are close but not in front
      const originalAngleMethod = mainBoid.position.angle;
      mainBoid.position.angle = function() { return Math.PI; }; // Behind

      const closeBehindNeighborBoid = new Boid(new Vector(10,10), new Vector(0,1)); // Close, speed (0,1)
      neighbors = [{ neighbor: closeBehindNeighborBoid, distSq: 200 }];
      alignmentVector = boidsInstance.calcAlignment(mainBoid, neighbors);
      assert.deepStrictEqual(alignmentVector, new Vector(0,0), "Behind neighbors: Alignment vector should be zero");
      
      mainBoid.position.angle = originalAngleMethod; // Restore
    });

    it('should calculate alignment vector correctly for one influential neighbor', function() {
      const opts = { alignmentDistance: 60, accelerationLimit: 0.03, speedLimit: 1 };
      const boidsInstance = new Boids(opts);

      const mainBoidPos = new Vector(0,0);
      const mainBoidSpeed = new Vector(1,0);
      const mainBoid = new Boid(mainBoidPos, mainBoidSpeed);

      const neighborPos = new Vector(10,0); // In front
      const neighborSpeed = new Vector(0,1); // Neighbor is moving "up"
      const neighborBoid = new Boid(neighborPos, neighborSpeed);
      
      const neighbors = [{ neighbor: neighborBoid, distSq: 100 }]; // dist=10, alignmentDistanceSq=3600

      const originalAngleMethod = mainBoid.position.angle;
      mainBoid.position.angle = function() { return 0; }; // Ensure #isInFrontOf is true

      // Expected calculation for alignment:
      // 1. total = neighborBoid.speed = (0,1)
      // 2. count = 1
      // 3. avgSpeed = total.divideBy(count) = (0,1)
      // 4. normalizedAvgSpeed = avgSpeed.normalize() = (0,1)
      // 5. steeringForce = normalizedAvgSpeed.subtract(mainBoid.speed) = (0,1).subtract((1,0)) = (-1,1)
      // 6. limitedForce = steeringForce.limit(opts.accelerationLimit=0.03)
      //    Vector (-1,1) has magnitude sqrt(2) approx 1.414.
      //    Normalized: (-1/sqrt(2), 1/sqrt(2)) approx (-0.7071, 0.7071)
      //    Multiplied by limit 0.03: approx (-0.021213, 0.021213)
      const expectedAlignmentVector = new Vector(-1,1).normalize().multiplyBy(0.03);
      
      const actualAlignmentVector = boidsInstance.calcAlignment(mainBoid, neighbors);

      assert.strictEqual(actualAlignmentVector.x.toFixed(4), expectedAlignmentVector.x.toFixed(4), "Alignment X component");
      assert.strictEqual(actualAlignmentVector.y.toFixed(4), expectedAlignmentVector.y.toFixed(4), "Alignment Y component");
      
      mainBoid.position.angle = originalAngleMethod; // Restore
    });
  });

  describe('tick', function() {
    it('should update boid position based on speed if no forces apply', function() {
      const opts = { 
        boids: 0, // Start with no boids from options
        speedLimit: 100, // High limit
        accelerationLimit: 10, // High limit
        cohesionForce: 0, 
        alignmentForce: 0, 
        separationForce: 0 
      };
      const boidsInstance = new Boids(opts);

      const initialPos = new Vector(10, 20);
      const initialSpeed = new Vector(1, 2);
      const testBoid = new Boid(initialPos.clone(), initialSpeed.clone());
      boidsInstance.boids = [testBoid];

      // Mock findNeighbors to ensure no flocking forces are calculated
      const originalFindNeighbors = boidsInstance.findNeighbors;
      boidsInstance.findNeighbors = function() { return []; };

      boidsInstance.tick();

      const expectedNewPos = initialPos.add(initialSpeed); // pos = 10+1, 20+2 = (11,22)
      
      assert.deepStrictEqual(testBoid.position, expectedNewPos, "Position should update by speed");
      assert.deepStrictEqual(testBoid.speed, initialSpeed, "Speed should be unchanged with no forces/acceleration");

      boidsInstance.findNeighbors = originalFindNeighbors; // Restore
    });

    it('should apply speed limit to boids', function() {
      const opts = { 
        boids: 0,
        speedLimit: 1, // Low speed limit
        accelerationLimit: 10,
        cohesionForce: 0, alignmentForce: 0, separationForce: 0 
      };
      const boidsInstance = new Boids(opts);
      
      const initialPos = new Vector(0,0);
      const initialSpeed = new Vector(2,0); // Speed (2,0) is above limit of 1
      const testBoid = new Boid(initialPos.clone(), initialSpeed.clone());
      boidsInstance.boids = [testBoid];
      
      boidsInstance.findNeighbors = function() { return []; }; // No flocking

      boidsInstance.tick();
      
      // Speed should be limited to (1,0)
      const expectedLimitedSpeed = new Vector(1,0);
      const expectedNewPos = initialPos.add(expectedLimitedSpeed); // (0,0) + (1,0) = (1,0)

      assert.strictEqual(testBoid.speed.x.toFixed(4), expectedLimitedSpeed.x.toFixed(4), "Speed X should be limited");
      assert.strictEqual(testBoid.speed.y.toFixed(4), expectedLimitedSpeed.y.toFixed(4), "Speed Y should be limited (0)");
      assert.deepStrictEqual(testBoid.position, expectedNewPos, "Position should update by limited speed");
    });
    
    it('should apply acceleration from flocking forces and update speed/position', function() {
      const opts = { 
        boids: 0,
        speedLimit: 10, 
        accelerationLimit: 0.1, // Boids instance accelerationLimit for individual rule calculation
        cohesionForce: 1, 
        alignmentForce: 0, 
        separationForce: 0 
      };
      const boidsInstance = new Boids(opts);

      const initialPos = new Vector(0,0);
      const initialSpeed = new Vector(0,0);
      const testBoid = new Boid(initialPos.clone(), initialSpeed.clone());
      boidsInstance.boids = [testBoid];

      // Mock flocking calculation methods
      boidsInstance.findNeighbors = function() { return [{neighbor: {}, distSq: 1}]; }; // Dummy neighbors
      const originalCalcCohesion = boidsInstance.calcCohesion;
      // Let cohesion return a vector that will be limited by Vector's own limit if it's too large,
      // or directly use a small vector. The boidsInstance.accelerationLimit is used *inside* calcCohesion.
      // So calcCohesion will return a vector already limited by opts.accelerationLimit (0.1 in this case).
      boidsInstance.calcCohesion = function() { return new Vector(0.05, 0); }; 
      boidsInstance.calcAlignment = function() { return new Vector(0,0); };
      boidsInstance.calcSeparation = function() { return new Vector(0,0); };

      boidsInstance.tick();

      // Expected acceleration = (0.05,0) * 1 (cohesionForce) = (0.05,0)
      // Expected new speed = initialSpeed(0,0) + accel(0.05,0) = (0.05,0). This is within speedLimit 10.
      const expectedNewSpeed = new Vector(0.05, 0);
      // Expected new position = initialPos(0,0) + newSpeed(0.05,0) = (0.05,0)
      const expectedNewPos = new Vector(0.05, 0);

      assert.strictEqual(testBoid.speed.x.toFixed(4), expectedNewSpeed.x.toFixed(4), "Speed X after acceleration");
      assert.strictEqual(testBoid.speed.y.toFixed(4), expectedNewSpeed.y.toFixed(4), "Speed Y after acceleration");
      assert.strictEqual(testBoid.position.x.toFixed(4), expectedNewPos.x.toFixed(4), "Position X after acceleration");
      assert.strictEqual(testBoid.position.y.toFixed(4), expectedNewPos.y.toFixed(4), "Position Y after acceleration");

      boidsInstance.calcCohesion = originalCalcCohesion; // Restore
    });
  });
});

// New test suite for the Boid class itself
describe('Boid Class', function() {
  it('should correctly initialize position and speed in the constructor', function() {
    const mockPosition = { x: 10, y: 20, toString: () => "pos(10,20)", compare: () => 0 };
    const mockSpeed = { dx: 1, dy: 2 };
    const boid = new Boid(mockPosition, mockSpeed);
    assert.strictEqual(boid.position, mockPosition, 'Position should be initialized');
    assert.strictEqual(boid.speed, mockSpeed, 'Speed should be initialized');
  });

  it('should call position.toString() when boid.toString() is called', function() {
    let toStringCalled = false;
    const mockPosition = {
      // Mocking Vector's toString, which is not used by Boid's toString
      // Boid's toString calls its own position's toString.
      toString: function() {
        toStringCalled = true;
        return "MockPositionToString";
      }
    };
    const boid = new Boid(mockPosition, {}); // Speed can be a dummy object
    const result = boid.toString();
    assert.strictEqual(toStringCalled, true, 'position.toString should have been called');
    assert.strictEqual(result, "MockPositionToString", 'boid.toString should return position.toString result');
  });

  it('should call position.compare() with correct arguments when boid.compare() is called', function() {
    let compareCalledWith = null;
    const mockPosition1 = {
      // Mocking Vector's compare
      compare: function(otherPosition, even) {
        compareCalledWith = { otherPosition, even };
        return 42; // Arbitrary return value for the test
      }
    };
    const mockPosition2 = { x: 1, y: 1 }; // Dummy position for the 'that' boid

    const boid1 = new Boid(mockPosition1, {}); // Speed can be a dummy object
    const boid2 = new Boid(mockPosition2, {}); // 'that' boid, its speed is irrelevant for this test

    const isEvenArg = true;
    const result = boid1.compare(boid2, isEvenArg);

    assert.ok(compareCalledWith, 'position.compare should have been called');
    assert.strictEqual(compareCalledWith.otherPosition, mockPosition2, 'position.compare called with that.position');
    assert.strictEqual(compareCalledWith.even, isEvenArg, 'position.compare called with isEven argument');
    assert.strictEqual(result, 42, 'boid.compare should return the result of position.compare');
  });
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
