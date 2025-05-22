export default class Boid {
  constructor(position, speed) {
    this.position = position;
    this.speed = speed;
  }

  compare(that, isEven) {
    return this.position.compare(that.position, isEven);
  }

  toString() {
    return this.position.toString();
  }
}
