import { BoidSystem } from "../core/BoidSystem";
import { ConfigManager } from "../core/ConfigManager";
import { Size } from "../utils/types";

describe("BoidSystem", () => {
  let system: BoidSystem;
  let bounds: Size;
  let config: ConfigManager;

  beforeEach(() => {
    bounds = { width: 800, height: 600 };
    // シングルトンをリセット
    (ConfigManager as any).instance = undefined;
    config = ConfigManager.getInstance();
    system = new BoidSystem(bounds);
  });

  describe("initialization", () => {
    test("creates empty system with given bounds", () => {
      expect(system.getBoids()).toHaveLength(0);
      const state = system.getState();
      expect(state.boids).toHaveLength(0);
    });
  });

  describe("boid management", () => {
    test("adds boid within maxBoids limit", () => {
      const { maxBoids } = config.getConfig();

      // maxBoidsまでBoidを追加
      for (let i = 0; i < maxBoids; i++) {
        system.addBoid(100, 100);
      }
      expect(system.getBoids()).toHaveLength(maxBoids);

      // 制限を超えて追加しても無視される
      system.addBoid(100, 100);
      expect(system.getBoids()).toHaveLength(maxBoids);
    });

    test("removes boid at specified index", () => {
      system.addBoid(100, 100);
      system.addBoid(200, 200);
      expect(system.getBoids()).toHaveLength(2);

      system.removeBoid(0);
      expect(system.getBoids()).toHaveLength(1);

      const state = system.getState();
      expect(state.boids[0].x).toBe(200);
      expect(state.boids[0].y).toBe(200);
    });

    test("ignores invalid removal index", () => {
      system.addBoid(100, 100);
      system.removeBoid(-1);
      system.removeBoid(1);
      expect(system.getBoids()).toHaveLength(1);
    });

    test("clears all boids", () => {
      system.addBoid(100, 100);
      system.addBoid(200, 200);
      expect(system.getBoids()).toHaveLength(2);

      system.clear();
      expect(system.getBoids()).toHaveLength(0);
    });
  });

  describe("update and configuration", () => {
    test("updates boid positions", () => {
      system.addBoid(100, 100);
      const initialState = system.getState();
      const initialX = initialState.boids[0].x;
      const initialY = initialState.boids[0].y;

      system.update();

      const newState = system.getState();
      // 位置が更新されているはず
      expect(newState.boids[0].x).not.toBe(initialX);
      expect(newState.boids[0].y).not.toBe(initialY);
    });

    test("responds to config changes", () => {
      system.addBoid(100, 100);
      const newConfig = {
        ...config.getConfig(),
        maxSpeed: 1,
        bounds: {
          padding: 30,
        },
      };

      config.updateConfig(newConfig);

      // 次の更新で新しい設定が反映される
      system.update();
      const state = system.getState();
      const boid = system.getBoids()[0];
      expect(boid.velocity.magnitude()).toBeLessThanOrEqual(newConfig.maxSpeed);
    });

    test("updates bounds", () => {
      const newBounds: Size = { width: 1000, height: 800 };
      system.setBounds(newBounds);

      system.addBoid(900, 700); // 新しい境界内の位置
      system.update();

      const state = system.getState();
      expect(state.boids[0].x).toBeLessThanOrEqual(newBounds.width);
      expect(state.boids[0].y).toBeLessThanOrEqual(newBounds.height);
    });
  });

  describe("state reporting", () => {
    test("returns correct boid state", () => {
      system.addBoid(100, 100);
      const state = system.getState();

      expect(state.boids).toHaveLength(1);
      expect(state.boids[0]).toHaveProperty("x");
      expect(state.boids[0]).toHaveProperty("y");
      expect(state.boids[0]).toHaveProperty("direction");
    });

    test("boid array is readonly", () => {
      system.addBoid(100, 100);
      const boids = system.getBoids();

      // 配列の変更を試みる
      expect(() => {
        (boids as any).push({ x: 200, y: 200 });
      }).toThrow();
    });
  });
});
