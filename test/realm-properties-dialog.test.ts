/**
 * Tests for RealmPropertiesDialog
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock global Foundry objects BEFORE importing modules
global.foundry = {
  utils: {
    mergeObject: vi.fn((base, overrides) => ({ ...base, ...overrides }))
  }
} as any;

global.Dialog = class MockDialog {
  static get defaultOptions() {
    return {
      classes: ['dialog'],
      width: 400,
      height: 'auto'
    };
  }
  
  constructor(data: any, options: any = {}) {
    // Mock constructor
  }
  
  static confirm = vi.fn();
} as any;

global.ui = {
  notifications: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
  }
} as any;

// Now import modules after mocks are set up
import { RealmData } from '../src/realm-data';
import { RealmPropertiesDialog } from '../src/realm-properties-dialog';

describe('RealmPropertiesDialog', () => {
  let realm: RealmData;

  beforeEach(() => {
    // Create a test realm
    realm = new RealmData({
      name: 'Test Forest',
      geometry: { type: 'circle', x: 100, y: 100, radius: 50 },
      tags: ['biome:forest', 'terrain:dense']
    });
  });

  describe('Data Preparation', () => {
    it('should prepare data correctly for existing realm', () => {
      // Create dialog instance
      const dialog = new RealmPropertiesDialog(realm);
      
      // Get prepared data
      const data = dialog.getData();
      
      expect(data.realm.name).toBe('Test Forest');
      expect(data.realm.tags).toContain('biome:forest');
      expect(data.realm.tags).toContain('terrain:dense');
      expect(data.isNew).toBe(false);
    });

    it('should prepare data correctly for new realm', () => {
      const newRealm = new RealmData({
        name: '',
        geometry: { type: 'polygon', points: [] }
      });
      
      const dialog = new RealmPropertiesDialog(newRealm);
      const data = dialog.getData();
      
      expect(data.isNew).toBe(true);
    });
  });

  describe('Static Methods', () => {
    it('should have static open method', () => {
      expect(typeof RealmPropertiesDialog.open).toBe('function');
    });

    it('should have proper default options', () => {
      const options = RealmPropertiesDialog.defaultOptions;
      
      expect(options.classes).toContain('realm-properties-dialog');
      expect(options.width).toBe(500);
      expect(options.template).toBe('modules/realms-and-reaches/templates/realm-properties.hbs');
    });
  });

  describe('Dialog Configuration', () => {
    it('should set correct title for existing realm', () => {
      const dialog = new RealmPropertiesDialog(realm);
      
      // The title should include the realm name
      expect(dialog.options.title).toContain('Test Forest');
    });

    it('should set correct title for new realm', () => {
      const newRealm = new RealmData({ name: '', geometry: { type: 'polygon', points: [] } });
      const dialog = new RealmPropertiesDialog(newRealm);
      
      expect(dialog.options.title).toContain('Create New Realm');
    });

    it('should have correct CSS classes', () => {
      const dialog = new RealmPropertiesDialog(realm);
      
      expect(dialog.options.classes).toContain('realm-properties-dialog');
    });
  });
});