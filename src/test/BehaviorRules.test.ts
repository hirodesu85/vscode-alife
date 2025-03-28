import { BehaviorRules } from "../core/BehaviorRules";
import { Boid } from "../core/Boid";
import { ConfigManager } from "../core/ConfigManager";
import { Vector2D } from "../utils/Vector2D";

describe("BehaviorRules", () => {
  let rules: BehaviorRules;
  let boid: Boid;
  let neighbors: Boid[];
  let config: ConfigManager;

  beforeEach(() => {
    // シングルトンをリセット
    (ConfigManager as any).instance = undefined;
    config = ConfigManager.getInstance();
    rules = new BehaviorRules();
    boid = new Boid(100, 100);
    neighbors = [];
  });

  describe("applySeparation", () => {
    test("returns zero vector when no neighbors", () => {
      const force = rules.applySeparation(boid, []);
      expect(force.x).toBe(0);
      expect(force.y).toBe(0);
    });

    test("applies separation force when neighbors are too close", () => {
      const neighbor = new Boid(110, 110); // 近すぎる位置に配置
      const force = rules.applySeparation(boid, [neighbor]);

      // 分離力は負の方向（離れる方向）を示すはず
      expect(force.x).toBeLessThan(0);
      expect(force.y).toBeLessThan(0);
    });

    test("ignores neighbors outside separation radius", () => {
      const neighbor = new Boid(300, 300); // 遠い位置に配置
      const force = rules.applySeparation(boid, [neighbor]);
      expect(force.magnitude()).toBe(0);
    });
  });

  describe("applyAlignment", () => {
    test("returns zero vector when no neighbors", () => {
      const force = rules.applyAlignment(boid, []);
      expect(force.x).toBe(0);
      expect(force.y).toBe(0);
    });

    test("aligns with neighbor velocities within radius", () => {
      const neighbor = new Boid(120, 120);
      neighbor.velocity = new Vector2D(1, 0); // 右向きの速度
      boid.velocity = new Vector2D(0, 1); // 上向きの速度

      const force = rules.applyAlignment(boid, [neighbor]);

      // 力は neighbor の方向に向かうはず
      expect(force.x).toBeGreaterThan(0);
    });

    test("ignores neighbors outside alignment radius", () => {
      const neighbor = new Boid(300, 300);
      neighbor.velocity = new Vector2D(1, 0);
      const force = rules.applyAlignment(boid, [neighbor]);
      expect(force.magnitude()).toBe(0);
    });
  });

  describe("applyCohesion", () => {
    test("returns zero vector when no neighbors", () => {
      const force = rules.applyCohesion(boid, []);
      expect(force.x).toBe(0);
      expect(force.y).toBe(0);
    });

    test("moves towards center of mass of neighbors", () => {
      const neighbor1 = new Boid(120, 120); // boidの近くに配置
      const force = rules.applyCohesion(boid, [neighbor1]);

      // 力は neighborの方向を向いているはず
      expect(force.x).toBeGreaterThan(0);
      expect(force.y).toBeGreaterThan(0);
      expect(force.magnitude()).toBeGreaterThan(0);
    });

    test("ignores neighbors outside cohesion radius", () => {
      const neighbor = new Boid(300, 300);
      const force = rules.applyCohesion(boid, [neighbor]);
      expect(force.magnitude()).toBe(0);
    });
  });

  describe("applyRules", () => {
    test("combines all forces", () => {
      const neighbor = new Boid(110, 110);
      neighbor.velocity = new Vector2D(1, 1);

      const totalForce = rules.applyRules(boid, [neighbor]);

      // 合力は0ではないはず
      expect(totalForce.magnitude()).toBeGreaterThan(0);
    });

    test("returns zero force when no neighbors", () => {
      const totalForce = rules.applyRules(boid, []);
      expect(totalForce.magnitude()).toBe(0);
    });
  });
});
