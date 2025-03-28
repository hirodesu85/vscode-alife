import { Vector2D } from "../utils/Vector2D";
import { Boid } from "./Boid";
import { ConfigManager } from "./ConfigManager";

export class BehaviorRules {
  private config: ConfigManager;

  constructor() {
    this.config = ConfigManager.getInstance();
  }

  applySeparation(boid: Boid, neighbors: Boid[]): Vector2D {
    if (neighbors.length === 0) {
      return new Vector2D(0, 0);
    }

    const separationForce = new Vector2D(0, 0);
    const { separation } = this.config.getConfig();
    let count = 0;

    for (const other of neighbors) {
      const distance = boid.distanceTo(other);
      if (distance > 0 && distance < separation.radius) {
        const diff = boid.position.subtract(other.position);
        const normalized = diff.normalize();
        separationForce.x += normalized.x / distance;
        separationForce.y += normalized.y / distance;
        count++;
      }
    }

    if (count === 0) {
      return separationForce;
    }

    return separationForce
      .divide(count)
      .normalize()
      .multiply(separation.factor);
  }

  applyAlignment(boid: Boid, neighbors: Boid[]): Vector2D {
    if (neighbors.length === 0) {
      return new Vector2D(0, 0);
    }

    const averageVelocity = new Vector2D(0, 0);
    const { alignment } = this.config.getConfig();
    let count = 0;

    for (const other of neighbors) {
      const distance = boid.distanceTo(other);
      if (distance > 0 && distance < alignment.radius) {
        averageVelocity.x += other.velocity.x;
        averageVelocity.y += other.velocity.y;
        count++;
      }
    }

    if (count === 0) {
      return averageVelocity;
    }

    return averageVelocity.divide(count).normalize().multiply(alignment.factor);
  }

  applyCohesion(boid: Boid, neighbors: Boid[]): Vector2D {
    if (neighbors.length === 0) {
      return new Vector2D(0, 0);
    }

    const centerOfMass = new Vector2D(0, 0);
    const { cohesion } = this.config.getConfig();
    let count = 0;

    for (const other of neighbors) {
      const distance = boid.distanceTo(other);
      if (distance > 0 && distance < cohesion.radius) {
        centerOfMass.x += other.position.x;
        centerOfMass.y += other.position.y;
        count++;
      }
    }

    if (count === 0) {
      return centerOfMass;
    }

    centerOfMass.x /= count;
    centerOfMass.y /= count;

    return centerOfMass
      .subtract(boid.position)
      .normalize()
      .multiply(cohesion.factor);
  }

  applyRules(boid: Boid, neighbors: Boid[]): Vector2D {
    const separation = this.applySeparation(boid, neighbors);
    const alignment = this.applyAlignment(boid, neighbors);
    const cohesion = this.applyCohesion(boid, neighbors);

    const totalForce = separation.add(alignment).add(cohesion);
    return totalForce;
  }
}
