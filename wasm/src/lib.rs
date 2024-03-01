extern crate wasm_bindgen;
extern crate web_sys;

mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

struct Xy {
    x: f64,
    y: f64,
}

pub struct Boid {
    value: u8,
    value2: u8,
}

#[wasm_bindgen]
pub struct Boids {
    boids: Vec<Boid>
}

impl Boid {
    fn new() -> Boid {
        Boid {
            value: 20,
            value2: 40
        }
    }
}

#[wasm_bindgen]
impl Boids {
    pub fn new() -> Boids {
        let boids = vec![Boid::new(), Boid::new()];
        Boids {
            boids
        }
    }
    pub fn get_boids(&self) -> *const Boid {
        self.boids.as_ptr()
    }
}
