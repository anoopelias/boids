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

tickBenchmark();
