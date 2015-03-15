
function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.add = function(v) {
  return new Vector(this.x + v.x, this.y + v.y);
}

Vector.prototype.distSquared = function(v) {
  return Math.pow(this.x - v.x, 2) + 
    Math.pow(this.y - v.y, 2);
}

Vector.prototype.distance = function(v) {
  return Math.sqrt(this.distSquared(v));
}

Vector.prototype.multiplyBy = function(s) {
  return new Vector(this.x * s, this.y * s);
}

Vector.prototype.neg = function(v) {
  return new Vector(-this.x, -this.y);
}

Vector.prototype.magnitude = function() {
  return this.distance(new Vector(0, 0));
}

Vector.prototype.normalize = function() {
  var magnitude = this.magnitude();
  
  if(magnitude === 0)
    return new Vector(0, 0);

  return new Vector(this.x / magnitude, this.y / magnitude);
}

Vector.prototype.subtract = function(v) {
  return this.add(v.neg());
}

Vector.prototype.divideBy = function(s) {
  return this.multiplyBy(1 / s);
}

Vector.prototype.limit = function(s) {
  if(this.magnitude() > s)
    return this.normalize().multiplyBy(s);

  return this;
}

Vector.prototype.angle = function(p1, p2) {
  var v1 = this.subtract(p1).normalize();
  var v2 = this.subtract(p2).normalize();

  return Math.acos(v1.x * v2.x + v1.y * v2.y);
}

module.exports = Vector;
