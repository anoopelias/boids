describe("Dtree", function() {

  var Dtree = require('../js/dtree');
  var Vector = require('../js/vector');
  var assert = require('assert');

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

});
