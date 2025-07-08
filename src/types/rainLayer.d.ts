declare module 'mapbox-gl-rain-layer' {
  export default class RainLayer {
    constructor(options: unknown);
    on(type: string, listener: (...args: unknown[]) => void): void;
    off(type: string, listener: (...args: unknown[]) => void): void;
    once(type: string, listener: (...args: unknown[]) => void): void;
    getLegendHTML(): string;
    setMeshOpacity(opacity: number): this;
    setRainColor(color: string): this;
    setSnowColor(color: string): this;
  }
} 