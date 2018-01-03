describe("Vector", function() {
  var Vector = require("../js/vector"),
    assert = require("assert");

  it("should compare on x", function() {
    var c = new Vector(5, 19).compare(new Vector(10, 16), false);
    assert(c < 0);

    c = new Vector(5, 15).compare(new Vector(1, 25), false);
    assert(c > 0);
  });

  it("should compare on y if x is equal", function() {
    var c = new Vector(5, 15).compare(new Vector(5, 25), false);
    assert(c < 0);

    c = new Vector(5, 45).compare(new Vector(5, 25), false);
    assert(c > 0);
  });

  it("should compare on x by default", function() {
    var c = new Vector(5, 19).compare(new Vector(10, 16));
    assert(c < 0);

    c = new Vector(5, 15).compare(new Vector(1, 25));
    assert(c > 0);
  });

  it("should compare on y", function() {
    var c = new Vector(5, 19).compare(new Vector(10, 16), true);
    assert(c > 0);

    c = new Vector(5, 15).compare(new Vector(1, 25), true);
    assert(c < 0);
  });

  it("should compare on x if y is equal", function() {
    var c = new Vector(5, 19).compare(new Vector(10, 19), true);
    assert(c < 0);

    c = new Vector(5, 15).compare(new Vector(1, 15), true);
    assert(c > 0);
  });

  it("should return zero if both x and y are equal", function() {
    var c = new Vector(5, 19).compare(new Vector(5, 19), true);
    assert(c === 0);

    c = new Vector(5, 45).compare(new Vector(5, 45), false);
    assert(c === 0);
  });
});
