import GPU, { input } from 'gpu.js';

function tickBenchmark() {
  const Boids = require("./");
  const boidNums = [150, 300, 450, 600, 750];

  let numReports = [];
  console.log("Running benchmark, please wait..");
  for (let n of boidNums) {
    const boids = Boids({ boids: n });

    for (let i = 0; i < 1000; i++) {
      const startTime = performance.now();
      boids.tick();
      (numReports[i] = numReports[i] || []).push(performance.now() - startTime);
    }
  }

  let report = boidNums.map(boidNum => boidNum + " Boids").join(", ") + "\n";
  report += numReports.map(numReport => numReport.join(", ")).join("\n");

  console.log(report);
}

function gpuBenchmark() {
  const gpu = new GPU({
    mode: 'gpu'
  });
  const boids = require('./tick_temp.json');

  const posX = boids.map(boid => boid.position.x);
  const posY = boids.map(boid => boid.position.y);

  console.log(boids.length);

  const opt = {
      output: [boids.length, boids.length]
  };
  const gpuDist = gpu.createKernel(function(posX, posY) {

    return Math.pow(posX[this.thread.x] - posX[this.thread.y], 2) +
      Math.pow(posY[this.thread.x] - posY[this.thread.y], 2);
  }, opt);


  var startTime = performance.now();
  const output = gpuDist(posX, posY);
  console.log('Execution time:', performance.now() - startTime);
  console.log(output);
  console.log(gpu.getMode());
}

// tickBenchmark();
gpuBenchmark()
