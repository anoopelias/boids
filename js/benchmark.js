function benchmark(boids) {
  function test(count, ticks) {
    var b = boids({ boids: count }),
      i = ticks,
      start;

    var warmup = 10000;
    while (warmup--) b.tick();

    start = +new Date();
    while (i--) b.tick();

    return ticks / ((new Date() - start) / 1000);
  }

  for (var i = 50; i <= 500; i += 50) {
    console.log(i + ' boids: ' + ~~test(i, 5000) + ' ticks/sec');
  }
}


function dtreeBenchmark(Dtree) {
  var Vector = require('./vector');
  var Obj = require('./boid');

  var objects = [],
    dtree = new Dtree(),
    radius = 60,
    n = 5000,
    treeTime = 0,
    bruteTime = 0;

  for(var i=0; i<n; i++) {
    var v = new Obj(new Vector(Math.random() * 25, Math.random() * 25));
    objects.push(v);
    dtree.insert(v);
  }

  for(var j=0; j<objects.length; j++) {
    var obj = objects[j],
      bruteNeighbors = [];

    var start = +new Date();
    var treeNeighbors = dtree.neighbors(obj.position, radius);
    treeTime += (new Date() - start);

    start = +new Date();
    for(var k=0; k<objects.length; k++) {
      var other = objects[k];
      if(obj.position.distance(other.position) < radius) {
        bruteNeighbors.push(other);
      }
    }
    bruteTime += (new Date() - start);
  }

  console.log('treeTime:' + treeTime + ' bruteTime:' + bruteTime);

}


benchmark(require('./'));
//dtreeBenchmark(require('./dtree'));
