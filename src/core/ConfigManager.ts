export interface SimulationConfig {
  maxBoids: number;
  maxSpeed: number;
  cohesion: {
    factor: number;
    radius: number;
  };
  separation: {
    factor: number;
    radius: number;
  };
  alignment: {
    factor: number;
    radius: number;
  };
  bounds: {
    padding: number;
  };
}

export type ConfigChangeListener = (config: SimulationConfig) => void;

export class ConfigManager {
  private static instance: ConfigManager;
  private config: SimulationConfig;
  private listeners: Set<ConfigChangeListener>;

  private constructor() {
    this.config = {
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
    };
    this.listeners = new Set();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  getConfig(): SimulationConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<SimulationConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
    this.notifyListeners();
  }

  subscribe(listener: ConfigChangeListener): void {
    this.listeners.add(listener);
  }

  unsubscribe(listener: ConfigChangeListener): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const config = this.getConfig();
    this.listeners.forEach((listener) => listener(config));
  }
}
