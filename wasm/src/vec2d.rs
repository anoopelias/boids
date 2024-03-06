#![allow(unused)]

#[derive(PartialEq, Debug)]
pub struct Vec2d {
    x: f64,
    y: f64,
}

impl Vec2d {
    fn new(x: f64, y: f64) -> Vec2d {
        Vec2d { x, y }
    }

    fn add(&self, other: &Vec2d) -> Vec2d {
        Vec2d::new(self.x + other.x, self.y + other.y)
    }

    fn dist_squared(&self, other: &Vec2d) -> f64 {
        (self.x - other.x).powf(2.0) + (self.y - other.y).powf(2.0)
    }

    fn dist(&self, other: &Vec2d) -> f64 {
        self.dist_squared(other).sqrt()
    }
}

#[cfg(test)]
mod tests {
    use crate::vec2d::Vec2d;

    #[test]
    fn add() {
        let v1 = Vec2d::new(10.0, 20.0);
        let v2 = Vec2d::new(30.0, 40.0);
        assert_eq!(v1.add(&v2), Vec2d::new(40.0, 60.0));
    }

    #[test]
    fn dist_squared() {
        let v1 = Vec2d::new(10.0, 20.0);
        let v2 = Vec2d::new(30.0, 40.0);
        assert_eq!(v1.dist_squared(&v2), 800.0);
    }

    #[test]
    fn distance() {
        let v1 = Vec2d::new(10.0, 20.0);
        let v2 = Vec2d::new(30.0, 40.0);
        assert_eq!(v1.dist(&v2), 28.284271247461902);
    }
}