function benchmark(boids) {
  function test(count, ticks) {
    const b = boids({ boids: count });
    let i = ticks;

    let warmup = 10000;
    while (warmup--) b.tick();

    const start = +new Date();
    while (i--) b.tick();

    return ticks / ((new Date() - start) / 1000);
  }

  for (let i = 50; i <= 500; i += 50) {
    console.log(i + " boids: " + ~~test(i, 5000) + " ticks/sec");
  }
}

benchmark(require("./"));
