#![allow(unused)]

#[derive(PartialEq, Debug, Clone)]
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

    fn distance(&self, other: &Vec2d) -> f64 {
        self.dist_squared(other).sqrt()
    }

    fn multiply_by(&self, scalar: f64) -> Vec2d {
        Vec2d::new(self.x * scalar, self.y * scalar)
    }

    fn neg(&self) -> Vec2d {
        Vec2d::new(-self.x, -self.y)
    }

    fn magnitude(&self) -> f64 {
        self.distance(&Vec2d::new(0.0, 0.0))
    }

    fn divide_by(&self, scalar: f64) -> Vec2d {
        if scalar == 0.0 {
            Vec2d::new(0.0, 0.0)
        } else {
            self.multiply_by(1.0 / scalar)
        }
    }

    fn normalize(&self) -> Vec2d {
        self.divide_by(self.magnitude())
    }

    fn subtract(&self, other: &Vec2d) -> Vec2d {
        self.add(&other.neg())
    }

    fn limit(&self, scalar: f64) -> Vec2d {
        if self.magnitude() > scalar {
            self.normalize().multiply_by(scalar)
        } else {
            self.clone()
        }

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
        assert_eq!(v1.distance(&v2), 28.284271247461902);
    }
    #[test]
    fn multiply_by() {
        let v1 = Vec2d::new(10.0, 20.0);
        assert_eq!(v1.multiply_by(3.0), Vec2d::new(30.0, 60.0));
    }

    #[test]
    fn neg() {
        let v1 = Vec2d::new(10.0, 20.0);
        assert_eq!(v1.neg(), Vec2d::new(-10.0, -20.0));
    }

    #[test]
    fn magnitude() {
        let v1 = Vec2d::new(30.0, 40.0);
        assert_eq!(v1.magnitude(), 50.0);
    }

    #[test]
    fn divide_by() {
        let v1 = Vec2d::new(15.0, 20.0);
        assert_eq!(v1.divide_by(2.0), Vec2d::new(7.5, 10.0));
    }

    #[test]
    fn divide_by_zero() {
        let v1 = Vec2d::new(15.0, 20.0);
        assert_eq!(v1.divide_by(0.0), Vec2d::new(0.0, 0.0));
    }

    #[test]
    fn normalize() {
        let v1 = Vec2d::new(30.0, 40.0);
        assert_eq!(v1.normalize(), Vec2d::new(0.6, 0.8));
    }

    #[test]
    fn subtract() {
        let v1 = Vec2d::new(30.0, 40.0);
        let v2 = Vec2d::new(10.0, 15.0);
        assert_eq!(v1.subtract(&v2), Vec2d::new(20.0, 25.0));
    }

    #[test]
    fn limit() {
        let v1 = Vec2d::new(30.0, 40.0);
        assert_eq!(v1.limit(10.0), Vec2d::new(6.0, 8.0));
    }

    #[test]
    fn under_limit() {
        let v1 = Vec2d::new(30.0, 40.0);
        assert_eq!(v1.limit(60.0), Vec2d::new(30.0, 40.0));
    }

}