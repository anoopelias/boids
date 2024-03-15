import { Boids } from '../wasm/pkg/wasm.js';
import { memory } from '../wasm/pkg/wasm_bg.wasm';

let boids = Boids.new();
boids.add_boid(1.5, 2.5, 0.5, 0.25);
boids.add_boid(1.5, 2.5, 0.5, 0.23);
let boidsPtr = boids.get_boids_ptr();
const boids2 = new Float64Array(memory.buffer, boidsPtr, 8);
console.log(boids2);
