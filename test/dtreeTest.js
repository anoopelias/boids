describe("Dtree", function() {

  var Dtree = require('../js/dtree'),
    Vector = require('../js/vector'),
    assert = require('assert');

  it("should be able to search on root node", function() {
    var dtree = new Dtree();
    dtree.insert(new Vector(5, 15));
    assert(dtree.contains(new Vector(5, 15)));
    assert(!dtree.contains(new Vector(10, 15)));
  });

  it("should be able to search on left or right node", function() {
    var dtree = new Dtree();
    dtree.insert(new Vector(5, 15));
    dtree.insert(new Vector(1, 25));
    dtree.insert(new Vector(7, 5));

    assert(dtree.contains(new Vector(7, 5)));
    assert(dtree.contains(new Vector(1, 25)));

    assert(!dtree.contains(new Vector(7, 25)));
    assert(!dtree.contains(new Vector(1, 5)));
  });

  it("should be able to search on third level nodes", function() {
    var dtree = new Dtree();
    dtree.insert(new Vector(5, 15));
    dtree.insert(new Vector(1, 25));
    dtree.insert(new Vector(7, 25));
    dtree.insert(new Vector(6, 35));
    dtree.insert(new Vector(6, 20));
    dtree.insert(new Vector(2, 15));
    dtree.insert(new Vector(3, 30));

    assert(dtree.contains(new Vector(6, 35)));
    assert(dtree.contains(new Vector(6, 20)));
    assert(dtree.contains(new Vector(2, 15)));
    assert(dtree.contains(new Vector(3, 30)));

    assert(!dtree.contains(new Vector(6, 15)));
    assert(!dtree.contains(new Vector(6, 30)));
    assert(!dtree.contains(new Vector(2, 30)));
    assert(!dtree.contains(new Vector(3, 15)));
  });

  it("should be able find a neighbors", function() {

    var dtree = new Dtree();

    var vec67 = new Vector(6, 7),
      vecM10 = new Vector(-1, 0),
      vec1010 = new Vector(10, 10);

    dtree.insert(vec67);
    dtree.insert(vecM10);
    dtree.insert(vec1010);

    var neighbors = dtree.neighbors(new Vector(3, 3), 5); 
    assert(arrayContains(neighbors, vec67));
    assert(arrayContains(neighbors, vecM10));
    assert(!arrayContains(neighbors, vec1010));

  });

  it("should be able find self as a neighbor", function() {
    var dtree = new Dtree();

    var vec67 = new Vector(6, 7),
      vecM10 = new Vector(-1, 0),
      vec1010 = new Vector(10, 10),
      vec33 = new Vector(3, 3);

    dtree.insert(vec67);
    dtree.insert(vecM10);
    dtree.insert(vec1010);
    dtree.insert(vec33);

    var neighbors = dtree.neighbors(new Vector(3, 3), 2); 
    assert(arrayContains(neighbors, vec33));
    assert(!arrayContains(neighbors, vec67));
    assert(!arrayContains(neighbors, vecM10));
    assert(!arrayContains(neighbors, vec1010));
  });

  it("should be able find all neighbors similar to brute force", function() {
    var points = [], 
      dtree = new Dtree();

    for(var i=0; i<500; i++) {
      var v = new Vector(Math.random() * 400 - 200, Math.random() * 400 - 200);
      points.push(v);
      dtree.insert(v);
    }

    for(var j=0; j<points.length; j++) {
      var point = points[j],
        bruteNeighbors = [];

      var treeNeighbors = dtree.neighbors(point, 60);

      for(var k=0; k<points.length; k++) {
        var other = points[k];
        if(point.distance(other) < 60) {
          bruteNeighbors.push(other);
        }
      }

      assert(bruteNeighbors.length === treeNeighbors.length);

      for(var l=0; l<bruteNeighbors.length; l++) {
        assert(arrayContains(treeNeighbors, bruteNeighbors[l]));
      }
    }

  });

  function arrayContains(arr, val) {
    for(var i=0; i<arr.length; i++) {
      if(arr[i] === val)
        return true;
    }

    return false;
  }
});
