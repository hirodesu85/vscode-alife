import { Boid } from "../core/Boid";
import { Vector2D } from "../utils/Vector2D";

describe("Boid", () => {
  let boid: Boid;

  beforeEach(() => {
    boid = new Boid(100, 100);
  });

  test("constructor initializes position and velocity correctly", () => {
    expect(boid.position.x).toBe(100);
    expect(boid.position.y).toBe(100);
    expect(boid.velocity.magnitude()).toBeCloseTo(1);
  });

  test("update method updates position based on velocity", () => {
    const initialX = boid.position.x;
    const initialY = boid.position.y;
    const velocityX = boid.velocity.x;
    const velocityY = boid.velocity.y;

    boid.update();

    expect(boid.position.x).toBe(initialX + velocityX);
    expect(boid.position.y).toBe(initialY + velocityY);
  });

  test("applyForce method adds force to velocity and limits speed", () => {
    const force = new Vector2D(3, 4);
    boid.applyForce(force);

    expect(boid.velocity.magnitude()).toBeLessThanOrEqual(2); // default maxSpeed
  });

  test("checkBounds method reflects velocity when hitting boundaries", () => {
    const bounds = { width: 200, height: 200 };
    const padding = 10;

    // Test left boundary
    boid.position = new Vector2D(5, 100);
    boid.velocity = new Vector2D(-1, 0);
    boid.checkBounds(bounds, padding);
    expect(boid.velocity.x).toBe(1);

    // Test right boundary
    boid.position = new Vector2D(195, 100);
    boid.velocity = new Vector2D(1, 0);
    boid.checkBounds(bounds, padding);
    expect(boid.velocity.x).toBe(-1);

    // Test top boundary
    boid.position = new Vector2D(100, 5);
    boid.velocity = new Vector2D(0, -1);
    boid.checkBounds(bounds, padding);
    expect(boid.velocity.y).toBe(1);

    // Test bottom boundary
    boid.position = new Vector2D(100, 195);
    boid.velocity = new Vector2D(0, 1);
    boid.checkBounds(bounds, padding);
    expect(boid.velocity.y).toBe(-1);
  });

  test("setMaxSpeed updates max speed and limits current velocity", () => {
    boid.velocity = new Vector2D(3, 4); // magnitude = 5
    boid.setMaxSpeed(1);

    expect(boid.velocity.magnitude()).toBe(1);
  });

  test("getDirection returns correct angle in radians", () => {
    boid.velocity = new Vector2D(1, 0);
    expect(boid.getDirection()).toBe(0);

    boid.velocity = new Vector2D(0, 1);
    expect(boid.getDirection()).toBe(Math.PI / 2);
  });

  test("distanceTo calculates correct distance between boids", () => {
    const otherBoid = new Boid(103, 104);
    const distance = boid.distanceTo(otherBoid);
    expect(distance).toBe(5);
  });

  test("clone creates independent copy of boid", () => {
    const clone = boid.clone();

    expect(clone).not.toBe(boid);
    expect(clone.position).not.toBe(boid.position);
    expect(clone.velocity).not.toBe(boid.velocity);
    expect(clone.position.x).toBe(boid.position.x);
    expect(clone.position.y).toBe(boid.position.y);
    expect(clone.velocity.x).toBe(boid.velocity.x);
    expect(clone.velocity.y).toBe(boid.velocity.y);
  });
});
