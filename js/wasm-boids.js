import { Boids as WasmBoids } from '../wasm/pkg/wasm.js';
import { memory } from '../wasm/pkg/wasm_bg.wasm';

let wasmBoids = WasmBoids.new();
let boidsPtr = wasmBoids.get_boids();
const boids = new Float64Array(memory.buffer, boidsPtr, 4);
console.log(boids);
