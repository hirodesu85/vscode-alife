import { Boid } from "./Boid";
import { BehaviorRules } from "./BehaviorRules";
import { ConfigManager } from "./ConfigManager";
import { Size } from "../utils/types";

export class BoidSystem {
  private boids: Boid[];
  private rules: BehaviorRules;
  private config: ConfigManager;
  private bounds: Size;
  private boundsPadding: number;

  constructor(bounds: Size) {
    this.boids = [];
    this.rules = new BehaviorRules();
    this.config = ConfigManager.getInstance();
    this.bounds = bounds;
    this.boundsPadding = this.config.getConfig().bounds.padding;

    // 設定変更のサブスクライブ
    this.config.subscribe((newConfig) => {
      this.boundsPadding = newConfig.bounds.padding;
      this.boids.forEach((boid) => boid.setMaxSpeed(newConfig.maxSpeed));
    });
  }

  addBoid(x: number, y: number): void {
    const { maxBoids, maxSpeed } = this.config.getConfig();
    if (this.boids.length >= maxBoids) {
      return;
    }
    this.boids.push(new Boid(x, y, maxSpeed));
  }

  removeBoid(index: number): void {
    if (index >= 0 && index < this.boids.length) {
      this.boids.splice(index, 1);
    }
  }

  update(): void {
    this.boids.forEach((boid) => {
      // 近傍のBoidを取得
      const neighbors = this.boids.filter((other) => other !== boid);

      // 行動ルールを適用
      const force = this.rules.applyRules(boid, neighbors);
      boid.applyForce(force);

      // 位置を更新
      boid.update();

      // 境界チェック
      boid.checkBounds(this.bounds, this.boundsPadding);
    });
  }

  setBounds(bounds: Size): void {
    this.bounds = bounds;
  }

  getBoids(): readonly Boid[] {
    return Object.freeze([...this.boids]);
  }

  clear(): void {
    this.boids = [];
  }

  getState(): { boids: { x: number; y: number; direction: number }[] } {
    return {
      boids: this.boids.map((boid) => ({
        x: boid.position.x,
        y: boid.position.y,
        direction: boid.getDirection(),
      })),
    };
  }
}
