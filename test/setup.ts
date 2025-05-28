/**
 * Test setup for Realms & Reaches
 *
 * Configures the testing environment with mocks for Foundry VTT globals.
 */

import { vi } from 'vitest';

// Mock Foundry globals
global.foundry = {
  utils: {
    mergeObject: vi.fn((original, other) => ({ ...original, ...other })),
    duplicate: vi.fn(obj => JSON.parse(JSON.stringify(obj))),
    randomID: vi.fn(() => Math.random().toString(36).substr(2, 9))
  }
};

global.game = {
  modules: new Map(),
  settings: {
    register: vi.fn(),
    get: vi.fn()
  },
  scenes: {
    get: vi.fn(),
    current: null
  },
  user: {
    isGM: true
  },
  i18n: {
    localize: vi.fn(key => key)
  }
};

global.canvas = {
  scene: null,
  realms: null
};

global.ui = {
  notifications: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
};

global.Hooks = {
  once: vi.fn(),
  on: vi.fn(),
  callAll: vi.fn()
};

// Mock PIXI
global.PIXI = {
  Graphics: vi.fn(() => ({
    beginFill: vi.fn(),
    drawPolygon: vi.fn(),
    endFill: vi.fn(),
    clear: vi.fn(),
    destroy: vi.fn()
  })),
  Point: vi.fn((x, y) => ({ x, y }))
};

// Mock CanvasLayer
global.CanvasLayer = class MockCanvasLayer {
  constructor(options = {}) {
    this.options = options;
    this.name = options.name || 'mock';
  }

  static get layerOptions() {
    return {};
  }

  activate() {}
  deactivate() {}
  draw() {}
  tearDown() {}
};
