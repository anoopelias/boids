describe("Dtree", function() {

  var Dtree = require('../js/dtree'),
    Vector = require('../js/vector'),
    assert = require('assert');

  function Obj(x, y) {
    this.position = new Vector(x, y);
  }

  Obj.prototype.compare = function(that, isEven) {
    return this.position.compare(that.position, isEven);
  }

  Obj.prototype.toString = function() {
    return this.position.toString();
  }

  it("should be able to search on root node", function() {
    var dtree = new Dtree();
    dtree.insert(new Obj(5, 15));
    assert(dtree.contains(new Obj(5, 15)));
    assert(!dtree.contains(new Obj(10, 15)));
  });

  it("should be able to search on left or right node", function() {
    var dtree = new Dtree();
    dtree.insert(new Obj(5, 15));
    dtree.insert(new Obj(1, 25));
    dtree.insert(new Obj(7, 5));

    assert(dtree.contains(new Obj(7, 5)));
    assert(dtree.contains(new Obj(1, 25)));

    assert(!dtree.contains(new Obj(7, 25)));
    assert(!dtree.contains(new Obj(1, 5)));
  });

  it("should be able to search on third level nodes", function() {
    var dtree = new Dtree();
    dtree.insert(new Obj(5, 15));
    dtree.insert(new Obj(1, 25));
    dtree.insert(new Obj(7, 25));
    dtree.insert(new Obj(6, 35));
    dtree.insert(new Obj(6, 20));
    dtree.insert(new Obj(2, 15));
    dtree.insert(new Obj(3, 30));

    assert(dtree.contains(new Obj(6, 35)));
    assert(dtree.contains(new Obj(6, 20)));
    assert(dtree.contains(new Obj(2, 15)));
    assert(dtree.contains(new Obj(3, 30)));

    assert(!dtree.contains(new Obj(6, 15)));
    assert(!dtree.contains(new Obj(6, 30)));
    assert(!dtree.contains(new Obj(2, 30)));
    assert(!dtree.contains(new Obj(3, 15)));
  });

  it("should be able find a neighbors", function() {

    var dtree = new Dtree();

    var vec67 = new Obj(6, 7),
      vecM10 = new Obj(-1, 0),
      vec1010 = new Obj(10, 10);

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

    var vec67 = new Obj(6, 7),
      vecM10 = new Obj(-1, 0),
      vec1010 = new Obj(10, 10),
      vec33 = new Obj(3, 3);

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
    var objects = [], 
      dtree = new Dtree(),
      radius = 60,
      n = 500;

    for(var j=0; j<objects.length; j++) {
      var obj = objects[j],
        bruteNeighbors = [];

      var treeNeighbors = dtree.neighbors(obj.position, radius);

      for(var k=0; k<objects.length; k++) {
        var other = objects[k];
        if(obj.position.distance(other.position) < radius) {
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
