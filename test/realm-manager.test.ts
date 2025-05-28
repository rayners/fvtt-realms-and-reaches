/**
 * Tests for RealmManager class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RealmManager } from '../src/realm-manager';
import { RealmData } from '../src/realm-data';

// Mock scene for testing
const mockScene = {
  id: 'test-scene',
  name: 'Test Scene',
  width: 1000,
  height: 1000,
  getFlag: vi.fn(),
  setFlag: vi.fn()
};

// Mock game globals
global.game = {
  ...global.game,
  scenes: {
    get: vi.fn((id) => id === 'test-scene' ? mockScene : null)
  },
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
  let testRealm: RealmData;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Clear existing instances to ensure clean state
    (RealmManager as any).instances = new Map();
    
    // Create a fresh manager instance for each test
    manager = RealmManager.getInstance('test-scene');
    
    // Clear any existing data
    await manager.clearAll();
    
    testRealm = new RealmData({
      name: 'Test Realm',
      geometry: {
        type: 'polygon',
        points: [0, 0, 100, 0, 100, 100, 0, 100]
      },
      tags: ['biome:forest', 'terrain:dense']
    });
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
      expect(retrieved).toBe(created);
    });

    it('should update realms', async () => {
      const created = await manager.createRealm(testRealm);
      const originalModified = created.metadata.modified;
      
      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));
      
      created.name = 'Updated Name';
      await manager.updateRealm(created);
      
      expect(created.metadata.modified).not.toBe(originalModified);
    });

    it('should delete realms', async () => {
      const created = await manager.createRealm(testRealm);
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
      
      await manager.createRealm(testRealm);
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
      await manager.createRealm(testRealm);
      await manager.saveToScene();
      
      expect(mockScene.setFlag).toHaveBeenCalledWith(
        'realms-and-reaches',
        'realms',
        expect.objectContaining({
          version: '1.0.0',
          realms: expect.any(Object)
        })
      );
    });

    it('should load from scene flags', async () => {
      const sceneData = {
        version: '1.0.0',
        realms: {
          [testRealm.id]: testRealm.toObject()
        },
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          author: 'Test User'
        }
      };
      
      mockScene.getFlag.mockReturnValue(sceneData);
      
      await manager.loadFromScene();
      
      const loadedRealm = manager.getRealm(testRealm.id);
      expect(loadedRealm).toBeDefined();
      expect(loadedRealm!.name).toBe(testRealm.name);
    });

    it('should handle loading errors gracefully', async () => {
      const corruptData = {
        version: '1.0.0',
        realms: {
          'bad-realm': { invalid: 'data' }
        }
      };
      
      mockScene.getFlag.mockReturnValue(corruptData);
      console.warn = vi.fn(); // Mock console.warn
      
      await manager.loadFromScene();
      
      expect(console.warn).toHaveBeenCalled();
      expect(manager.getAllRealms().length).toBe(0);
    });

    it('should not save when not dirty', async () => {
      await manager.saveToScene(); // Save when no changes
      expect(mockScene.setFlag).not.toHaveBeenCalled();
    });
  });

  describe('Export/Import', () => {
    beforeEach(async () => {
      await manager.createRealm(testRealm);
    });

    it('should export data correctly', () => {
      const exportData = manager.exportData();
      
      expect(exportData.format).toBe('realms-and-reaches-v1');
      expect(exportData.metadata).toBeDefined();
      expect(exportData.realms).toHaveLength(1);
      expect(exportData.realms[0].id).toBe(testRealm.id);
    });

    it('should import data correctly', async () => {
      const exportData = manager.exportData();
      
      // Clear and import
      await manager.clearAll();
      const importCount = await manager.importData(exportData);
      
      expect(importCount).toBe(1);
      expect(manager.getRealm(testRealm.id)).toBeDefined();
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
      
      await globalManager.createRealm(testRealm);
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