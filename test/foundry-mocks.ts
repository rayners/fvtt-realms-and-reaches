/**
 * Comprehensive Foundry VTT Mock Setup
 *
 * This file provides a complete mock environment for Foundry VTT testing.
 * It can be shared between multiple projects that need Foundry mocks.
 *
 * Usage:
 * ```typescript
 * import './foundry-mocks';
 * // Or import specific parts:
 * import { setupFoundryMocks, mockFoundryDocuments } from './foundry-mocks';
 * ```
 */

import { vi } from 'vitest';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface MockScene {
  id: string;
  name: string;
  width: number;
  height: number;
  regions: Map<string, MockRegion>;
  getFlag: ReturnType<typeof vi.fn>;
  setFlag: ReturnType<typeof vi.fn>;
  unsetFlag: ReturnType<typeof vi.fn>;
  createEmbeddedDocuments: ReturnType<typeof vi.fn>;
  deleteEmbeddedDocuments: ReturnType<typeof vi.fn>;
  grid: {
    units: string;
    type: number;
  };
}

export interface MockRegion {
  id: string;
  name: string;
  shapes: any[];
  flags: Record<string, any>;
  getFlag: ReturnType<typeof vi.fn>;
  setFlag: ReturnType<typeof vi.fn>;
  unsetFlag: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  testPoint: ReturnType<typeof vi.fn>;
}

export interface MockActor {
  id: string;
  name: string;
  type: string;
  uuid: string;
  system: any;
  items: MockItem[];
  flags: Record<string, any>;
  getFlag: ReturnType<typeof vi.fn>;
  setFlag: ReturnType<typeof vi.fn>;
  unsetFlag: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

export interface MockItem {
  id: string;
  name: string;
  type: string;
  system: any;
  flags: Record<string, any>;
}

export interface MockUser {
  id: string;
  isGM: boolean;
  getFlag: ReturnType<typeof vi.fn>;
  setFlag: ReturnType<typeof vi.fn>;
  unsetFlag: ReturnType<typeof vi.fn>;
}

export interface MockRollTable {
  id: string;
  name: string;
  folder: string | null;
  results: any[];
  flags: Record<string, any>;
  roll: ReturnType<typeof vi.fn>;
  getFlag: ReturnType<typeof vi.fn>;
  setFlag: ReturnType<typeof vi.fn>;
}

export interface MockFolder {
  id: string;
  name: string;
  type: string;
  color: string;
  description: string;
}

// ============================================================================
// MOCK FACTORIES
// ============================================================================

export function createMockScene(options: Partial<MockScene> = {}): MockScene {
  const regions = options.regions || new Map();

  // Add filter method to regions map to match Foundry's Collection interface
  (regions as any).filter = function (callback: (region: any) => boolean) {
    const results: any[] = [];
    for (const [id, region] of this.entries()) {
      if (callback(region)) {
        results.push(region);
      }
    }
    return results;
  };

  return {
    id: options.id || 'test-scene',
    name: options.name || 'Test Scene',
    width: options.width || 4000,
    height: options.height || 3000,
    regions: regions,
    getFlag: vi.fn(),
    setFlag: vi.fn(),
    unsetFlag: vi.fn(),
    createEmbeddedDocuments: vi.fn().mockResolvedValue([]),
    deleteEmbeddedDocuments: vi.fn().mockResolvedValue([]),
    grid: {
      units: 'feet',
      type: 1, // SQUARE
      ...(options.grid || {})
    }
  };
}

export function createMockRegion(options: Partial<MockRegion> = {}): MockRegion {
  return {
    id: options.id || 'test-region',
    name: options.name || 'Test Region',
    shapes: options.shapes || [],
    flags: options.flags || {},
    getFlag: vi.fn().mockImplementation((scope, key) => {
      return options.flags?.[scope]?.[key];
    }),
    setFlag: vi.fn(),
    unsetFlag: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    testPoint: vi.fn().mockReturnValue(true)
  };
}

export function createMockActor(options: Partial<MockActor> = {}): MockActor {
  return {
    id: options.id || 'test-actor',
    name: options.name || 'Test Actor',
    type: options.type || 'character',
    uuid: options.uuid || `Actor.${options.id || 'test-actor'}`,
    system: options.system || {},
    items: options.items || [],
    flags: options.flags || {},
    getFlag: vi.fn(),
    setFlag: vi.fn(),
    unsetFlag: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  };
}

export function createMockUser(options: Partial<MockUser> = {}): MockUser {
  return {
    id: options.id || 'test-user',
    isGM: options.isGM ?? false,
    getFlag: vi.fn(),
    setFlag: vi.fn(),
    unsetFlag: vi.fn()
  };
}

export function createMockRollTable(options: Partial<MockRollTable> = {}): MockRollTable {
  return {
    id: options.id || 'test-table',
    name: options.name || 'Test Table',
    folder: options.folder || null,
    results: options.results || [],
    flags: options.flags || {},
    roll: vi.fn().mockResolvedValue({
      results: [{ text: 'Test Result', name: 'Test Result' }],
      total: 1
    }),
    getFlag: vi.fn(),
    setFlag: vi.fn()
  };
}

export function createMockFolder(options: Partial<MockFolder> = {}): MockFolder {
  return {
    id: options.id || 'test-folder',
    name: options.name || 'Test Folder',
    type: options.type || 'RollTable',
    color: options.color || '#000000',
    description: options.description || 'Test folder'
  };
}

// ============================================================================
// FOUNDRY DOCUMENT CLASSES
// ============================================================================

export class MockActorClass {
  static async create(data: any): Promise<MockActor> {
    return createMockActor(data);
  }

  static async createDocuments(data: any[]): Promise<MockActor[]> {
    return data.map(d => createMockActor(d));
  }
}

export class MockRollTableClass {
  static async create(data: any): Promise<MockRollTable> {
    return createMockRollTable(data);
  }

  static async createDocuments(data: any[]): Promise<MockRollTable[]> {
    return data.map(d => createMockRollTable(d));
  }
}

export class MockFolderClass {
  static async create(data: any): Promise<MockFolder> {
    return createMockFolder(data);
  }

  static async createDocuments(data: any[]): Promise<MockFolder[]> {
    return data.map(d => createMockFolder(d));
  }
}

export class MockDialogClass {
  constructor(options: any = {}) {
    this.options = options;
  }

  options: any;

  static async confirm(options: any = {}): Promise<boolean> {
    return options.defaultYes !== false;
  }

  static async prompt(options: any = {}): Promise<any> {
    return options.defaultValue || null;
  }

  render(force?: boolean): void {
    // Mock render
  }

  close(): void {
    // Mock close
  }
}

// ============================================================================
// FOUNDRY GLOBALS SETUP
// ============================================================================

export function setupFoundryGlobals() {
  // Foundry utility functions
  globalThis.foundry = {
    abstract: {
      TypeDataModel: class MockTypeDataModel {
        constructor(data = {}) {
          Object.assign(this, data);
        }
        prepareDerivedData() {}
      }
    },
    data: {
      fields: {
        HTMLField: class {
          constructor(options = {}) {
            this.options = options;
          }
        },
        StringField: class {
          constructor(options = {}) {
            this.options = options;
          }
        },
        NumberField: class {
          constructor(options = {}) {
            this.options = options;
            if (typeof options.initial === 'function') {
              this.initial = options.initial();
            } else {
              this.initial = options.initial || 0;
            }
          }
        },
        BooleanField: class {
          constructor(options = {}) {
            this.options = options;
            this.initial = options.initial || false;
          }
        },
        ObjectField: class {
          constructor(options = {}) {
            this.options = options;
          }
        },
        SchemaField: class {
          constructor(schema = {}) {
            this.schema = schema;
          }
        },
        ArrayField: class {
          constructor(element) {
            this.element = element;
          }
        },
        DocumentIdField: class {
          constructor(options = {}) {
            this.options = options;
          }
        },
        FilePathField: class {
          constructor(options = {}) {
            this.options = options;
          }
        }
      }
    },
    utils: {
      mergeObject: vi.fn((original, other, options = {}) => ({ ...original, ...other })),
      duplicate: vi.fn(obj => JSON.parse(JSON.stringify(obj))),
      setProperty: vi.fn(),
      getProperty: vi.fn(),
      hasProperty: vi.fn(),
      expandObject: vi.fn(),
      flattenObject: vi.fn(),
      isNewerVersion: vi.fn(),
      randomID: vi.fn(() => Math.random().toString(36).substr(2, 9))
    },
    documents: {
      BaseRegion: class MockBaseRegion {
        constructor(data = {}) {
          Object.assign(this, data);
        }
        static defineSchema() {
          return {};
        }
      }
    },
    canvas: {
      layers: {
        RegionLayer: class MockRegionLayer {
          constructor(options = {}) {
            this.options = options;
          }
          activate() {}
          deactivate() {}
          draw() {}
          tearDown() {}
        }
      }
    }
  };

  // Template functions
  globalThis.loadTemplates = vi.fn().mockResolvedValue({});
  globalThis.renderTemplate = vi.fn().mockResolvedValue('<div>Mock Template</div>');
  globalThis.getTemplate = vi.fn().mockResolvedValue(() => '<div>Mock Template</div>');

  // Utility functions (map to foundry.utils)
  globalThis.mergeObject = globalThis.foundry.utils.mergeObject;
  globalThis.duplicate = globalThis.foundry.utils.duplicate;
  globalThis.setProperty = globalThis.foundry.utils.setProperty;
  globalThis.getProperty = globalThis.foundry.utils.getProperty;
  globalThis.hasProperty = globalThis.foundry.utils.hasProperty;
  globalThis.expandObject = globalThis.foundry.utils.expandObject;
  globalThis.flattenObject = globalThis.foundry.utils.flattenObject;
  globalThis.isNewerVersion = globalThis.foundry.utils.isNewerVersion;

  // Document lookup functions
  globalThis.fromUuid = vi.fn();
  globalThis.fromUuidSync = vi.fn();

  // Text editor
  globalThis.TextEditor = {
    enrichHTML: vi.fn(content => content)
  };

  // Handlebars
  globalThis.Handlebars = {
    registerHelper: vi.fn(),
    registerPartial: vi.fn()
  };

  // Hooks system
  globalThis.Hooks = {
    on: vi.fn(),
    once: vi.fn(),
    off: vi.fn(),
    call: vi.fn(),
    callAll: vi.fn()
  };

  // PIXI Graphics (for canvas-based tests)
  globalThis.PIXI = {
    Graphics: vi.fn(() => ({
      beginFill: vi.fn(),
      drawPolygon: vi.fn(),
      endFill: vi.fn(),
      clear: vi.fn(),
      destroy: vi.fn()
    })),
    Point: vi.fn((x, y) => ({ x, y }))
  };

  // Canvas Layer base class
  globalThis.CanvasLayer = class MockCanvasLayer {
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

  // CONST object
  globalThis.CONST = {
    KEYBINDING_SCOPES: {
      GLOBAL: 'global',
      CLIENT: 'client'
    }
  };
}

export function setupFoundryDocuments() {
  // Document classes
  globalThis.Actor = MockActorClass;
  globalThis.RollTable = MockRollTableClass;
  globalThis.Folder = MockFolderClass;
  globalThis.Dialog = MockDialogClass;

  // Sheet classes
  globalThis.ActorSheet = class MockActorSheet {};
  globalThis.Application = class MockApplication {};
  globalThis.FormApplication = class MockFormApplication {};

  // Other document classes
  globalThis.ChatMessage = class MockChatMessage {
    static async create() {}
  };

  // Roll class
  globalThis.Roll = class MockRoll {
    constructor(formula: string) {
      this.formula = formula;
      this.total = 10; // Default total
    }

    formula: string;
    total: number;

    async evaluate() {
      return this;
    }
  };
}

export function setupFoundryGame(
  options: {
    systemId?: string;
    user?: Partial<MockUser>;
    scenes?: MockScene[];
  } = {}
) {
  const mockUser = createMockUser(options.user);
  const mockScenes = options.scenes || [createMockScene()];

  globalThis.game = {
    user: mockUser,
    userId: mockUser.id,
    users: new Map([[mockUser.id, mockUser]]),
    actors: new Map(),
    scenes: new Map(mockScenes.map(s => [s.id, s])),
    tables: new Map(),
    folders: new Map(),
    modules: new Map(),
    settings: {
      get: vi.fn(),
      set: vi.fn(),
      register: vi.fn()
    },
    i18n: {
      localize: vi.fn((key: string) => key),
      format: vi.fn((key: string, data?: any) => key)
    },
    system: {
      id: options.systemId || 'test-system',
      title: 'Test System',
      data: {}
    },
    documentTypes: {
      Actor: ['character', 'npc'],
      Item: ['weapon', 'armor'],
      RollTable: ['RollTable']
    }
  };
}

export function setupFoundryUI() {
  globalThis.ui = {
    notifications: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    }
  };
}

export function setupFoundryCanvas(scene?: MockScene) {
  const mockScene = scene || createMockScene();

  globalThis.canvas = {
    scene: mockScene,
    regions: {
      activate: vi.fn(),
      deactivate: vi.fn()
    },
    ready: true
  };
}

export function setupFoundryConfig() {
  globalThis.CONFIG = {
    Actor: {
      documentClass: MockActorClass,
      typeLabels: {}
    },
    debug: {
      hooks: false
    },
    DND5E: {
      skills: {
        acr: { label: 'Acrobatics' },
        ani: { label: 'Animal Handling' },
        arc: { label: 'Arcana' },
        ath: { label: 'Athletics' },
        dec: { label: 'Deception' },
        his: { label: 'History' },
        ins: { label: 'Insight' },
        inti: { label: 'Intimidation' },
        inv: { label: 'Investigation' },
        med: { label: 'Medicine' },
        nat: { label: 'Nature' },
        prc: { label: 'Perception' },
        per: { label: 'Performance' },
        prs: { label: 'Persuasion' },
        rel: { label: 'Religion' },
        slt: { label: 'Sleight of Hand' },
        ste: { label: 'Stealth' },
        sur: { label: 'Survival' }
      }
    }
  };
}

// ============================================================================
// COMPLETE SETUP FUNCTION
// ============================================================================

/**
 * Set up a complete Foundry VTT mock environment
 */
export function setupFoundryMocks(
  options: {
    systemId?: string;
    user?: Partial<MockUser>;
    scenes?: MockScene[];
    includeCanvas?: boolean;
    includeRegions?: boolean;
  } = {}
) {
  setupFoundryGlobals();
  setupFoundryDocuments();
  setupFoundryGame(options);
  setupFoundryUI();
  setupFoundryConfig();

  if (options.includeCanvas !== false) {
    setupFoundryCanvas(options.scenes?.[0]);
  }
}

// ============================================================================
// AUTO-SETUP (when imported)
// ============================================================================

// Automatically set up basic mocks when this file is imported
setupFoundryMocks();
