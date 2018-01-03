module.exports = Boid;

function Boid(position, speed) {
  this.position = position;
  this.speed = speed;
}

Boid.prototype.compare = function(that, isEven) {
  return this.position.compare(that.position, isEven);
};

Boid.prototype.toString = function() {
  return this.position.toString();
};
