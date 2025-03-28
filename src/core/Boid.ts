import { Vector2D } from "../utils/Vector2D";
import { Size } from "../utils/types";

export class Boid {
  position: Vector2D;
  velocity: Vector2D;
  private maxSpeed: number;

  constructor(x: number, y: number, maxSpeed: number = 2) {
    this.position = new Vector2D(x, y);
    this.velocity = Vector2D.random();
    this.maxSpeed = maxSpeed;
  }

  update(): void {
    this.position = this.position.add(this.velocity);
  }

  applyForce(force: Vector2D): void {
    this.velocity = this.velocity.add(force);
    this.velocity = this.velocity.limit(this.maxSpeed);
  }

  checkBounds(bounds: Size, padding: number): void {
    const { width, height } = bounds;
    const { x, y } = this.position;

    if (
      (x < padding && this.velocity.x < 0) ||
      (x > width - padding && this.velocity.x > 0)
    ) {
      this.velocity = new Vector2D(-this.velocity.x, this.velocity.y);
    }

    if (
      (y < padding && this.velocity.y < 0) ||
      (y > height - padding && this.velocity.y > 0)
    ) {
      this.velocity = new Vector2D(this.velocity.x, -this.velocity.y);
    }
  }

  setMaxSpeed(speed: number): void {
    this.maxSpeed = speed;
    this.velocity = this.velocity.limit(this.maxSpeed);
  }

  getDirection(): number {
    return Math.atan2(this.velocity.y, this.velocity.x);
  }

  distanceTo(other: Boid): number {
    return this.position.subtract(other.position).magnitude();
  }

  clone(): Boid {
    const clone = new Boid(this.position.x, this.position.y, this.maxSpeed);
    clone.velocity = this.velocity.clone();
    return clone;
  }
}
