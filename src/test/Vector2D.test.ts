import { Vector2D } from "../utils/Vector2D";

describe("Vector2D", () => {
  test("constructor initializes x and y correctly", () => {
    const vector = new Vector2D(1, 2);
    expect(vector.x).toBe(1);
    expect(vector.y).toBe(2);
  });

  test("add returns a new vector with summed coordinates", () => {
    const v1 = new Vector2D(1, 2);
    const v2 = new Vector2D(3, 4);
    const result = v1.add(v2);
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });

  test("subtract returns a new vector with subtracted coordinates", () => {
    const v1 = new Vector2D(3, 4);
    const v2 = new Vector2D(1, 2);
    const result = v1.subtract(v2);
    expect(result.x).toBe(2);
    expect(result.y).toBe(2);
  });

  test("multiply returns a new vector with scaled coordinates", () => {
    const vector = new Vector2D(2, 3);
    const result = vector.multiply(2);
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });

  test("divide returns a new vector with divided coordinates", () => {
    const vector = new Vector2D(4, 6);
    const result = vector.divide(2);
    expect(result.x).toBe(2);
    expect(result.y).toBe(3);
  });

  test("divide throws error when dividing by zero", () => {
    const vector = new Vector2D(4, 6);
    expect(() => vector.divide(0)).toThrow("Cannot divide by zero");
  });

  test("magnitude returns correct length of vector", () => {
    const vector = new Vector2D(3, 4);
    expect(vector.magnitude()).toBe(5);
  });

  test("normalize returns a unit vector", () => {
    const vector = new Vector2D(3, 4);
    const normalized = vector.normalize();
    expect(normalized.magnitude()).toBeCloseTo(1);
  });

  test("normalize returns zero vector for zero magnitude", () => {
    const vector = new Vector2D(0, 0);
    const normalized = vector.normalize();
    expect(normalized.x).toBe(0);
    expect(normalized.y).toBe(0);
  });

  test("limit restricts vector magnitude", () => {
    const vector = new Vector2D(3, 4);
    const limited = vector.limit(2);
    expect(limited.magnitude()).toBeLessThanOrEqual(2);
  });

  test("clone creates a new vector with same coordinates", () => {
    const original = new Vector2D(1, 2);
    const cloned = original.clone();
    expect(cloned).not.toBe(original);
    expect(cloned.x).toBe(original.x);
    expect(cloned.y).toBe(original.y);
  });

  test("fromPoint creates vector from Point2D", () => {
    const point = { x: 1, y: 2 };
    const vector = Vector2D.fromPoint(point);
    expect(vector.x).toBe(1);
    expect(vector.y).toBe(2);
  });

  test("random creates unit vector", () => {
    const vector = Vector2D.random();
    expect(vector.magnitude()).toBeCloseTo(1);
  });
});
