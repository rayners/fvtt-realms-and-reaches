/**
 * Basic module tests to verify setup
 */

describe('Realms & Reaches Module', () => {
  it('should initialize without errors', () => {
    expect(true).toBe(true);
  });

  it('should have foundry globals available', () => {
    expect(global.foundry).toBeDefined();
    expect(global.game).toBeDefined();
    expect(global.canvas).toBeDefined();
    expect(global.Hooks).toBeDefined();
  });

  it('should have PIXI globals available', () => {
    expect(global.PIXI).toBeDefined();
    expect(global.PIXI.Graphics).toBeDefined();
  });

  it('should have CanvasLayer available', () => {
    expect(global.CanvasLayer).toBeDefined();
  });
});
