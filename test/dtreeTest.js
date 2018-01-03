describe("Dtree", function() {

  var Dtree = require('../js/dtree'),
    Vector = require('../js/vector'),
    assert = require('assert');

  function Obj(x, y) {
    this.position = new Vector(x, y);
  }

  Obj.prototype.compare = function(that, isEven) {
    return this.position.compare(that.position, isEven);
  };

  Obj.prototype.toString = function() {
    return this.position.toString();
  };

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

    var obj67 = new Obj(6, 7),
      objM10 = new Obj(-1, 0),
      obj1010 = new Obj(10, 10);

    dtree.insert(obj67);
    dtree.insert(objM10);
    dtree.insert(obj1010);

    var neighbors = dtree.neighbors(new Vector(3, 3), 25);
    assert(arrayContains(neighbors, obj67));
    assert(arrayContains(neighbors, objM10));
    assert(!arrayContains(neighbors, obj1010));

  });

  it("should be able find self as a neighbor", function() {
    var dtree = new Dtree();

    var obj67 = new Obj(6, 7),
      objM10 = new Obj(-1, 0),
      obj1010 = new Obj(10, 10),
      obj33 = new Obj(3, 3);

    dtree.insert(obj67);
    dtree.insert(objM10);
    dtree.insert(obj1010);
    dtree.insert(obj33);

    var neighbors = dtree.neighbors(new Vector(3, 3), 4);
    assert(arrayContains(neighbors, obj33));
    assert(!arrayContains(neighbors, obj67));
    assert(!arrayContains(neighbors, objM10));
    assert(!arrayContains(neighbors, obj1010));
  });

  it("should be able find all neighbors similar to brute force", function() {
    var objects = [],
      dtree = new Dtree(),
      radius = 60,
      n = 500;

    for(var i=0; i<n; i++) {
      var v = new Obj(Math.random() * 500 - 250, Math.random() * 500 - 250);
      objects.push(v);
      dtree.insert(v);
    }

    for(var j=0; j<objects.length; j++) {
      var obj = objects[j],
        bruteNeighbors = [];

      var treeNeighbors = dtree.neighbors(obj.position, radius * radius);

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
      if(arr[i].neighbor === val)
        return true;
    }

    return false;
  }
});
