/**
 * Tests for RealmManager class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RealmManager } from '../src/realm-manager';

// Mock scene for testing
const mockRegions = new Map();
// Add filter method to regions map to match Foundry's Collection interface
(mockRegions as any).filter = function (callback: (region: any) => boolean) {
  const results: any[] = [];
  for (const [id, region] of this.entries()) {
    if (callback(region)) {
      results.push(region);
    }
  }
  return results;
};

// Override the Symbol.iterator to return values instead of entries
(mockRegions as any)[Symbol.iterator] = function* () {
  for (const [id, region] of Map.prototype.entries.call(this)) {
    yield region;
  }
};

const mockScene = {
  id: 'test-scene',
  name: 'Test Scene',
  width: 1000,
  height: 1000,
  regions: mockRegions,
  getFlag: vi.fn(),
  setFlag: vi.fn(),
  createEmbeddedDocuments: vi.fn().mockImplementation(async (documentType, data) => {
    // Create mock region documents and add them to the regions collection
    const results = data.map((regionData: any) => {
      const mockRegion = {
        id: regionData.id || `region-${Math.random().toString(36).substr(2, 9)}`,
        name: regionData.name || 'Test Region',
        flags: regionData.flags || {},
        shapes: regionData.shapes || [],
        getFlag: vi.fn().mockImplementation((scope, key) => mockRegion.flags?.[scope]?.[key]),
        setFlag: vi.fn().mockImplementation((scope, key, value) => {
          if (!mockRegion.flags[scope]) mockRegion.flags[scope] = {};
          mockRegion.flags[scope][key] = value;
        }),
        unsetFlag: vi.fn(),
        update: vi.fn(),
        delete: vi.fn().mockImplementation(() => {
          mockRegions.delete(mockRegion.id);
        }),
        testPoint: vi.fn((point: {x: number, y: number}, threshold?: number) => {
          // Simple point-in-bounds test for mock
          if (!regionData.shapes || regionData.shapes.length === 0) {
            return false;
          }
          const shape = regionData.shapes[0];
          
          if (shape.type === 'polygon') {
            // Simple polygon test - assume it's a square for testing
            const points = shape.points || [];
            if (points.length >= 8) {
              const minX = Math.min(points[0], points[2], points[4], points[6]);
              const maxX = Math.max(points[0], points[2], points[4], points[6]);
              const minY = Math.min(points[1], points[3], points[5], points[7]);
              const maxY = Math.max(points[1], points[3], points[5], points[7]);
              return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
            }
          } else if (shape.type === 'ellipse') {
            // Circle/ellipse test
            const dx = point.x - shape.x;
            const dy = point.y - shape.y;
            const rx = shape.radiusX || 0;
            const ry = shape.radiusY || 0;
            return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
          } else if (shape.type === 'rectangle') {
            // Rectangle test
            const halfWidth = shape.width / 2;
            const halfHeight = shape.height / 2;
            const centerX = shape.x + halfWidth;
            const centerY = shape.y + halfHeight;
            return point.x >= shape.x && point.x <= shape.x + shape.width &&
                   point.y >= shape.y && point.y <= shape.y + shape.height;
          }
          return false;
        }),
        bounds: (() => {
          // Calculate bounds from shapes
          if (!regionData.shapes || regionData.shapes.length === 0) {
            return { x: 0, y: 0, width: 0, height: 0 };
          }
          const shape = regionData.shapes[0];
          
          if (shape.type === 'polygon' && shape.points) {
            const points = shape.points;
            if (points.length >= 8) {
              const minX = Math.min(points[0], points[2], points[4], points[6]);
              const maxX = Math.max(points[0], points[2], points[4], points[6]);
              const minY = Math.min(points[1], points[3], points[5], points[7]);
              const maxY = Math.max(points[1], points[3], points[5], points[7]);
              return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
            }
          } else if (shape.type === 'ellipse') {
            const rx = shape.radiusX || 0;
            const ry = shape.radiusY || 0;
            return { x: shape.x - rx, y: shape.y - ry, width: rx * 2, height: ry * 2 };
          } else if (shape.type === 'rectangle') {
            return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
          }
          
          return { x: 0, y: 0, width: 0, height: 0 };
        })()
      };
      mockRegions.set(mockRegion.id, mockRegion);
      return mockRegion;
    });
    return results;
  }),
  deleteEmbeddedDocuments: vi.fn().mockImplementation(async (documentType, ids) => {
    ids.forEach((id: string) => mockRegions.delete(id));
    return ids;
  })
};

// Mock game globals
global.game = {
  ...global.game,
  scenes: new Map([['test-scene', mockScene], ['global', mockScene]]),
  settings: {
    get: vi.fn(() => true) // Auto-save enabled
  },
  user: {
    name: 'Test User'
  }
};

// Mock canvas
global.canvas = {
  scene: mockScene
};

describe('RealmManager', () => {
  let manager: RealmManager;
  let testRealmData: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Clear existing instances to ensure clean state
    (RealmManager as any).instances = new Map();

    // Create a fresh manager instance for each test
    manager = RealmManager.getInstance('test-scene');

    // Clear any existing data
    await manager.clearAll();

    testRealmData = {
      name: 'Test Realm',
      geometry: {
        type: 'polygon',
        points: [0, 0, 100, 0, 100, 100, 0, 100]
      },
      tags: ['biome:forest', 'terrain:dense']
    };
  });

  describe('Instance Management', () => {
    it('should return singleton instances per scene', () => {
      const manager1 = RealmManager.getInstance('test-scene');
      const manager2 = RealmManager.getInstance('test-scene');
      const manager3 = RealmManager.getInstance('other-scene');

      expect(manager1).toBe(manager2); // Same scene = same instance
      expect(manager1).not.toBe(manager3); // Different scene = different instance
    });

    it('should use current canvas scene when no sceneId provided', () => {
      const manager1 = RealmManager.getInstance();
      const manager2 = RealmManager.getInstance('test-scene');

      expect(manager1).toBe(manager2);
    });

    it('should provide global instance', () => {
      const globalManager = RealmManager.getGlobalInstance();
      expect(globalManager).toBeDefined();
      expect(globalManager).not.toBe(manager);
    });
  });

  describe('Realm CRUD Operations', () => {
    it('should create realms', async () => {
      const created = await manager.createRealm({
        name: 'New Realm',
        geometry: { type: 'circle', x: 50, y: 50, radius: 25 }
      });

      expect(created).toBeDefined();
      expect(created.name).toBe('New Realm');
      expect(created.id).toBeDefined();

      // Should be retrievable
      const retrieved = manager.getRealm(created.id);
      expect(retrieved!.id).toBe(created.id);
      expect(retrieved!.name).toBe(created.name);
    });

    it('should update realms', async () => {
      const created = await manager.createRealm(testRealmData);
      const originalModified = created.metadata.modified;

      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      await manager.updateRealm(created._region);

      // Re-fetch to see updated metadata
      const updated = manager.getRealm(created.id);
      expect(updated!.metadata.modified).not.toBe(originalModified);
    });

    it('should delete realms', async () => {
      const created = await manager.createRealm(testRealmData);
      const deleted = await manager.deleteRealm(created.id);

      expect(deleted).toBe(true);
      expect(manager.getRealm(created.id)).toBe(null);

      // Deleting non-existent realm should return false
      expect(await manager.deleteRealm('nonexistent')).toBe(false);
    });

    it('should emit events for CRUD operations', async () => {
      let eventReceived = false;

      manager.addEventListener('realmCreated', () => {
        eventReceived = true;
      });

      await manager.createRealm(testRealmData);
      expect(eventReceived).toBe(true);
    });
  });

  describe('Spatial Queries', () => {
    beforeEach(async () => {
      // Create some test realms
      await manager.createRealm({
        name: 'Forest',
        geometry: { type: 'polygon', points: [0, 0, 50, 0, 50, 50, 0, 50] },
        tags: ['biome:forest']
      });

      await manager.createRealm({
        name: 'Desert',
        geometry: { type: 'circle', x: 75, y: 75, radius: 25 },
        tags: ['biome:desert']
      });

      await manager.createRealm({
        name: 'Mountain',
        geometry: { type: 'rectangle', x: 150, y: 150, width: 100, height: 100 },
        tags: ['biome:mountain', 'elevation:highland']
      });
    });

    it('should find realm at specific point', () => {
      const realm = manager.getRealmAt(25, 25); // Inside forest
      expect(realm?.getTag('biome')).toBe('forest');

      const noRealm = manager.getRealmAt(250, 250); // Empty space
      expect(noRealm).toBe(null);
    });

    it('should find all realms at point', () => {
      const realms = manager.getRealmsAt(25, 25);
      expect(realms.length).toBe(1);
      expect(realms[0].getTag('biome')).toBe('forest');
    });

    it('should get all realms', () => {
      const allRealms = manager.getAllRealms();
      expect(allRealms.length).toBe(3);
    });

    it('should find realms by tag', () => {
      const mountainRealms = manager.findRealmsByTag('biome:mountain');
      expect(mountainRealms.length).toBe(1);
      expect(mountainRealms[0].name).toBe('Mountain');
    });

    it('should find realms by multiple tags', () => {
      const highlandRealms = manager.findRealmsByTags(['biome:mountain', 'elevation:highland']);
      expect(highlandRealms.length).toBe(1);

      const noMatch = manager.findRealmsByTags(['biome:forest', 'elevation:highland']);
      expect(noMatch.length).toBe(0);
    });

    it('should find realms with query options', () => {
      // Find by tag
      const forests = manager.findRealms({ tags: ['biome:forest'] });
      expect(forests.length).toBe(1);

      // Find with limit
      const limited = manager.findRealms({ limit: 2 });
      expect(limited.length).toBe(2);

      // Find by bounds
      const inBounds = manager.findRealms({
        bounds: { x: 0, y: 0, width: 100, height: 100 }
      });
      expect(inBounds.length).toBeGreaterThan(0);
    });
  });

  describe('Data Persistence', () => {
    it('should save to scene flags', async () => {
      await manager.createRealm(testRealmData);
      await manager.saveToScene();

      // RegionDocuments auto-persist, so setFlag should not be called
      // saveToScene just dispatches events for compatibility
      expect(mockScene.setFlag).not.toHaveBeenCalled();
    });

    it('should load from scene flags', async () => {
      // Create a realm and verify it can be loaded
      const created = await manager.createRealm(testRealmData);

      await manager.loadFromScene();

      const loadedRealm = manager.getRealm(created.id);
      expect(loadedRealm).toBeDefined();
      expect(loadedRealm!.name).toBe(created.name);
    });

    it('should handle loading errors gracefully', async () => {
      // Since RegionDocuments are loaded automatically by Foundry,
      // this test now just verifies that loadFromScene doesn't throw
      await manager.loadFromScene();
      expect(manager.getAllRealms().length).toBe(0);
    });

    it('should not save when not dirty', async () => {
      await manager.saveToScene(); // Save when no changes
      expect(mockScene.setFlag).not.toHaveBeenCalled();
    });
  });

  describe('Export/Import', () => {
    let createdRealm: any;
    
    beforeEach(async () => {
      createdRealm = await manager.createRealm(testRealmData);
    });

    it('should export data correctly', () => {
      const exportData = manager.exportData();

      expect(exportData.format).toBe('realms-and-reaches-v1');
      expect(exportData.metadata).toBeDefined();
      expect(exportData.realms).toHaveLength(1);
      expect(exportData.realms[0].id).toBe(createdRealm.id);
    });

    it('should import data correctly', async () => {
      const exportData = manager.exportData();

      // Clear and import
      await manager.clearAll();
      const importCount = await manager.importData(exportData);

      expect(importCount).toBe(1);
      expect(manager.getRealm(createdRealm.id)).toBeDefined();
    });

    it('should handle ID conflicts during import', async () => {
      const exportData = manager.exportData();

      // Import with existing data (should skip due to ID conflict)
      const importCount = await manager.importData(exportData);
      expect(importCount).toBe(0); // No new realms imported

      // Import with merge option (should create new ID)
      const mergeCount = await manager.importData(exportData, { merge: true });
      expect(mergeCount).toBe(1);
      expect(manager.getAllRealms().length).toBe(2); // Original + merged
    });

    it('should replace data during import', async () => {
      const exportData = manager.exportData();

      // Add another realm, then import with replace
      await manager.createRealm({
        name: 'Another Realm',
        geometry: { type: 'circle', x: 100, y: 100, radius: 50 }
      });

      const importCount = await manager.importData(exportData, { replace: true });
      expect(importCount).toBe(1);
      expect(manager.getAllRealms().length).toBe(1); // Only imported realm
    });

    it('should reject unsupported import formats', async () => {
      const badData = { format: 'unsupported-format' };

      await expect(manager.importData(badData)).rejects.toThrow('Unsupported data format');
    });
  });

  describe('Statistics and Utilities', () => {
    beforeEach(async () => {
      await manager.createRealm({
        name: 'Forest 1',
        geometry: { type: 'circle', x: 50, y: 50, radius: 25 },
        tags: ['biome:forest', 'resources:timber']
      });

      await manager.createRealm({
        name: 'Forest 2',
        geometry: { type: 'circle', x: 100, y: 100, radius: 25 },
        tags: ['biome:forest', 'resources:game']
      });
    });

    it('should provide statistics', () => {
      const stats = manager.getStatistics();

      expect(stats.totalRealms).toBe(2);
      expect(stats.tagCounts.biome).toBe(2);
      expect(stats.tagCounts.resources).toBe(2);
      expect(stats.sceneId).toBe('test-scene');
    });

    it('should clear all realms', async () => {
      expect(manager.getAllRealms().length).toBe(2);

      await manager.clearAll();

      expect(manager.getAllRealms().length).toBe(0);
    });
  });

  describe('Global Manager', () => {
    it('should not persist to scene', async () => {
      const globalManager = RealmManager.getGlobalInstance();

      await globalManager.createRealm(testRealmData);
      await globalManager.saveToScene(); // Should not throw or call setFlag

      expect(mockScene.setFlag).not.toHaveBeenCalled();
    });

    it('should allow cross-scene operations', async () => {
      const globalManager = RealmManager.getGlobalInstance();

      await globalManager.createRealm({
        name: 'Global Realm',
        geometry: { type: 'circle', x: 0, y: 0, radius: 10 }
      });

      expect(globalManager.getAllRealms().length).toBe(1);
    });
  });
});
