import { ConfigManager, SimulationConfig } from "../core/ConfigManager";

describe("ConfigManager", () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    // シングルトンインスタンスをリセット
    (ConfigManager as any).instance = undefined;
    configManager = ConfigManager.getInstance();
  });

  test("getInstance returns singleton instance", () => {
    const instance1 = ConfigManager.getInstance();
    const instance2 = ConfigManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  test("getConfig returns default configuration", () => {
    const config = configManager.getConfig();
    expect(config).toEqual({
      maxBoids: 10,
      maxSpeed: 2,
      cohesion: {
        factor: 100,
        radius: 50,
      },
      separation: {
        factor: 20,
        radius: 25,
      },
      alignment: {
        factor: 8,
        radius: 40,
      },
      bounds: {
        padding: 20,
      },
    });
  });

  test("updateConfig updates configuration partially", () => {
    const newConfig: Partial<SimulationConfig> = {
      maxBoids: 20,
      maxSpeed: 3,
    };

    configManager.updateConfig(newConfig);
    const config = configManager.getConfig();

    expect(config.maxBoids).toBe(20);
    expect(config.maxSpeed).toBe(3);
    // その他のプロパティは変更されていないことを確認
    expect(config.cohesion.factor).toBe(100);
  });

  test("listeners are notified when config changes", () => {
    const listener = jest.fn();
    configManager.subscribe(listener);

    const newConfig: Partial<SimulationConfig> = {
      maxBoids: 15,
    };

    configManager.updateConfig(newConfig);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(configManager.getConfig());
  });

  test("unsubscribed listeners are not notified", () => {
    const listener = jest.fn();
    configManager.subscribe(listener);
    configManager.unsubscribe(listener);

    configManager.updateConfig({ maxBoids: 15 });
    expect(listener).not.toHaveBeenCalled();
  });

  test("getConfig returns a copy of config", () => {
    const config1 = configManager.getConfig();
    const config2 = configManager.getConfig();

    expect(config1).not.toBe(config2);
    expect(config1).toEqual(config2);
  });

  test("multiple listeners are notified", () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    configManager.subscribe(listener1);
    configManager.subscribe(listener2);

    configManager.updateConfig({ maxSpeed: 4 });

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });
});
