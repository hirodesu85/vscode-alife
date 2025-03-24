import { Point2D } from "./types";

export class Vector2D implements Point2D {
  constructor(public x: number, public y: number) {}

  add(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector2D): Vector2D {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  divide(scalar: number): Vector2D {
    if (scalar === 0) {
      throw new Error("Cannot divide by zero");
    }
    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) {
      return new Vector2D(0, 0);
    }
    return this.divide(mag);
  }

  limit(max: number): Vector2D {
    const mag = this.magnitude();
    if (mag > max) {
      return this.normalize().multiply(max);
    }
    return new Vector2D(this.x, this.y);
  }

  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  static fromPoint(point: Point2D): Vector2D {
    return new Vector2D(point.x, point.y);
  }

  static random(): Vector2D {
    const angle = Math.random() * Math.PI * 2;
    return new Vector2D(Math.cos(angle), Math.sin(angle));
  }
}
