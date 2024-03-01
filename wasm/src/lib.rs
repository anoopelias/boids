extern crate wasm_bindgen;
extern crate web_sys;

mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

pub struct Boid {
    pos_x: f64,
    pos_y: f64,
    vel_x: f64,
    vel_y: f64,
}

#[wasm_bindgen]
pub struct Boids {
    boids: Vec<Boid>,
}

impl Boid {
    fn new() -> Boid {
        Boid {
            pos_x: 20.5,
            pos_y: 40.2,
            vel_x: 50.9,
            vel_y: 51.9,
        }
    }
}

#[wasm_bindgen]
impl Boids {
    pub fn new() -> Boids {
        let boids = vec![Boid::new(), Boid::new()];
        Boids { boids }
    }
    pub fn get_boids(&self) -> *const Boid {
        self.boids.as_ptr()
    }
}
