extern crate wasm_bindgen;
extern crate web_sys;

mod utils;
mod vec2d;

use crate::utils::set_panic_hook;
use crate::vec2d::Vec2d;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[allow(unused)]
pub struct Boid {
    pos: vec2d::Vec2d,
    speed: vec2d::Vec2d,
}

#[wasm_bindgen]
pub struct Boids {
    boids: Vec<Boid>,
}

impl Boid {
    fn new(pos_x: f64, pos_y: f64, speed_x: f64, speed_y: f64) -> Boid {
        set_panic_hook();
        Boid {
            pos: Vec2d::new(pos_x, pos_y),
            speed: Vec2d::new(speed_x, speed_y),
        }
    }
}

#[wasm_bindgen]
impl Boids {
    pub fn new() -> Boids {
        let boids = vec![];
        Boids { boids }
    }

    pub fn len(&self) -> usize {
        self.boids.len()
    }

    pub fn get_boids_ptr(&self) -> *const Boid {
        self.boids.as_ptr()
    }

    pub fn add_boid(&mut self, pos_x: f64, pos_y: f64, vel_x: f64, vel_y: f64) {
        self.boids.push(Boid::new(pos_x, pos_y, vel_x, vel_y))
    }
}

#[cfg(test)]
mod tests {
    use crate::{Boid, Boids};

    fn nth_boid<'a>(ptr: *const Boid, count: usize) -> &'a Boid {
        // SAFETY: Available only within test code, and tests should ensure bounds
        unsafe { ptr.add(count).as_ref().unwrap() }
    }

    #[test]
    fn add_boid() {
        let mut boids = Boids::new();
        assert_eq!(boids.len(), 0);
        boids.add_boid(1.5, 2.5, 0.5, 0.25);
        boids.add_boid(2.5, 3.5, 1.5, 1.25);
        assert_eq!(boids.len(), 2);

        let boids_ptr = boids.get_boids_ptr();
        let first_boid = nth_boid(boids_ptr, 0);
        assert_eq!(first_boid.pos.x, 1.5);
        assert_eq!(first_boid.pos.y, 2.5);
        assert_eq!(first_boid.speed.x, 0.5);
        assert_eq!(first_boid.speed.y, 0.25);

        let second_boid = nth_boid(first_boid, 1);
        assert_eq!(second_boid.pos.x, 2.5);
        assert_eq!(second_boid.pos.y, 3.5);
        assert_eq!(second_boid.speed.x, 1.5);
        assert_eq!(second_boid.speed.y, 1.25);
    }
}
