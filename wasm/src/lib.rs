extern crate wasm_bindgen;
extern crate web_sys;

mod utils;
mod vec2d;

use std::ptr;

use crate::utils::set_panic_hook;
use crate::vec2d::Vec2d;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[allow(unused)]
#[derive(PartialEq)]
pub struct Boid {
    position: vec2d::Vec2d,
    speed: vec2d::Vec2d,
}

#[wasm_bindgen]
pub struct Opts {
    speed_limit: Option<f64>,
    acceleration_limit: Option<f64>,
    separation_force: Option<f64>,
}

impl Default for Opts {
    fn default() -> Self {
        Self {
            speed_limit: Some(1.0),
            acceleration_limit: Some(0.03),
            separation_force: Some(2.0),
        }
    }
}

#[wasm_bindgen]
pub struct Boids {
    boids: Vec<Boid>,
    acceleration_limit: f64,
    speed_limit: f64,
    separation_force: f64,
}

impl Boid {
    fn new(pos_x: f64, pos_y: f64, speed_x: f64, speed_y: f64) -> Boid {
        Boid {
            position: Vec2d::new(pos_x, pos_y),
            speed: Vec2d::new(speed_x, speed_y),
        }
    }
}

#[wasm_bindgen]
impl Boids {
    pub fn new(opts: Opts) -> Boids {
        set_panic_hook();
        Boids {
            boids: vec![],
            acceleration_limit: opts.acceleration_limit.unwrap_or(0.03),
            speed_limit: opts.speed_limit.unwrap_or(1.0),
            separation_force: opts.separation_force.unwrap_or(2.0),
        }
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

    pub fn tick(&mut self) {
        let mut accelerations = vec![];
        for boid in self.boids.iter() {
            let mut total = Vec2d::new(0.0, 0.0);
            for target in self.boids.iter() {
                if !ptr::eq(boid, target) {
                    total = total.add(&target.position.subtract(&boid.position).normalize())
                }
            }

            accelerations.push(
                total
                    .divide_by((self.boids.len() - 1) as f64)
                    .normalize()
                    .add(&boid.speed)
                    .limit(self.acceleration_limit)
                    .multiply_by(self.separation_force),
            );
        }

        for (i, boid) in self.boids.iter_mut().enumerate() {
            boid.speed = boid
                .speed
                .subtract(&accelerations[i])
                .limit(self.speed_limit);
            boid.position = boid.position.add(&boid.speed);
        }
    }
}

#[cfg(test)]
mod tests {
    use std::ptr;

    use crate::{Boid, Boids, Opts};

    fn nth_boid<'a>(ptr: *const Boid, count: usize) -> &'a Boid {
        // SAFETY: Available only within test code, and tests should ensure bounds
        unsafe { ptr.add(count).as_ref().unwrap() }
    }

    #[test]
    fn add_boid() {
        let mut boids = Boids::new(Opts::default());
        assert_eq!(boids.len(), 0);
        boids.add_boid(1.5, 2.5, 0.5, 0.25);
        boids.add_boid(2.5, 3.5, 1.5, 1.25);
        assert_eq!(boids.len(), 2);

        let boids_ptr = boids.get_boids_ptr();
        let first_boid = nth_boid(boids_ptr, 0);
        assert_eq!(first_boid.position.x, 1.5);
        assert_eq!(first_boid.position.y, 2.5);
        assert_eq!(first_boid.speed.x, 0.5);
        assert_eq!(first_boid.speed.y, 0.25);

        let second_boid = nth_boid(boids_ptr, 1);
        assert_eq!(second_boid.position.x, 2.5);
        assert_eq!(second_boid.position.y, 3.5);
        assert_eq!(second_boid.speed.x, 1.5);
        assert_eq!(second_boid.speed.y, 1.25);
    }

    #[test]
    fn tick_should_move() {
        let mut opts = Opts::default();
        opts.separation_force = Some(0.0);
        let mut boids = Boids::new(opts);
        boids.add_boid(1.5, 2.5, 0.5, 0.25);
        boids.tick();

        let boid = nth_boid(boids.get_boids_ptr(), 0);
        assert_eq!(boid.position.x, 2.0);
        assert_eq!(boid.position.y, 2.75);
    }

    #[test]
    fn should_slow_down_for_boids_in_front() {
        let mut opts = Opts::default();
        opts.separation_force = Some(1.0);
        let mut boids = Boids::new(opts);
        boids.add_boid(0.0, 0.0, 0.5, 0.5);
        boids.add_boid(10.0, 10.0, 0.0, 0.0);
        boids.tick();
        let boid = nth_boid(boids.get_boids_ptr(), 0);
        assert_eq!(boid.position.x, 0.4787867965644036);
        assert_eq!(boid.position.y, 0.4787867965644036);
    }

    #[test]
    fn test_boid_equality() {
        let boid1 = Boid::new(1.5, 2.5, 0.5, 0.25);
        let boid2 = Boid::new(1.5, 2.5, 0.5, 0.25);
        assert!(!ptr::eq(&boid1, &boid2));
    }
}
