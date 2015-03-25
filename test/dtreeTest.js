describe("Dtree", function() {

  var Dtree = require('../js/dtree');
  var Vector = require('../js/vector');
  var assert = require('assert');

  it("should be able to search on root node", function() {
    var dtree = new Dtree();
    dtree.insert(new Vector(5, 15));

    assert(dtree.contains(new Vector(5, 15)));

  });

});
