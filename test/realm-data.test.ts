/**
 * Tests for RealmData class
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RealmData } from '../src/realm-data';

describe('RealmData', () => {
  let realm: RealmData;

  beforeEach(() => {
    realm = new RealmData({
      name: 'Test Forest',
      geometry: {
        type: 'polygon',
        points: [0, 0, 100, 0, 100, 100, 0, 100] // Simple square
      },
      tags: ['biome:forest', 'terrain:dense']
    });
  });

  describe('Tag Management', () => {
    it('should initialize with provided tags', () => {
      expect(realm.getTags()).toEqual(['biome:forest', 'terrain:dense']);
    });

    it('should add tags correctly', () => {
      realm.addTag('travel_speed:0.75');
      expect(realm.hasTag('travel_speed:0.75')).toBe(true);
      expect(realm.getTag('travel_speed')).toBe('0.75');
    });

    it('should replace existing tags with same key', () => {
      realm.addTag('biome:desert');
      expect(realm.getTag('biome')).toBe('desert');
      expect(realm.hasTag('biome:forest')).toBe(false);
      expect(realm.hasTag('biome:desert')).toBe(true);
    });

    it('should remove tags correctly', () => {
      expect(realm.removeTag('biome:forest')).toBe(true);
      expect(realm.hasTag('biome:forest')).toBe(false);
      expect(realm.removeTag('nonexistent:tag')).toBe(false);
    });

    it('should remove tags by key', () => {
      realm.addTag('resources:timber');
      realm.addTag('resources:game');

      const removed = realm.removeTagByKey('resources');
      expect(removed).toBe(2);
      expect(realm.hasTag('resources')).toBe(false);
    });

    it('should get tags with prefix', () => {
      realm.addTag('resources:timber');
      realm.addTag('resources:game');
      realm.addTag('custom:haunted');

      const resourceTags = realm.getTagsWithPrefix('resources');
      expect(resourceTags).toEqual(['resources:game', 'resources:timber']);
    });

    it('should get tag values as numbers', () => {
      realm.addTag('travel_speed:0.75');
      expect(realm.getTagNumber('travel_speed')).toBe(0.75);
      expect(realm.getTagNumber('biome')).toBe(null); // Non-numeric
      expect(realm.getTagNumber('nonexistent')).toBe(null);
    });

    it('should clear all tags', () => {
      realm.clearTags();
      expect(realm.getTags()).toEqual([]);
    });

    it('should validate tag format', () => {
      expect(() => realm.addTag('invalid_tag')).toThrow('Invalid tag format');
      expect(() => realm.addTag('key:')).toThrow('Invalid tag format');
      expect(() => realm.addTag(':value')).toThrow('Invalid tag format');
      expect(() => realm.addTag('key:value:extra')).toThrow('Invalid tag format');
    });

    it('should handle hasTag with key-only queries', () => {
      expect(realm.hasTag('biome')).toBe(true);
      expect(realm.hasTag('climate')).toBe(false);
      expect(realm.hasTag('biome:forest')).toBe(true);
      expect(realm.hasTag('biome:desert')).toBe(false);
    });
  });

  describe('Geometry and Spatial Queries', () => {
    it('should detect points inside polygon', () => {
      expect(realm.containsPoint(50, 50)).toBe(true); // Center of square
      expect(realm.containsPoint(10, 10)).toBe(true); // Inside
      expect(realm.containsPoint(150, 150)).toBe(false); // Outside
      expect(realm.containsPoint(-10, 50)).toBe(false); // Outside
    });

    it('should calculate polygon bounds correctly', () => {
      const bounds = realm.getBounds();
      expect(bounds).toEqual({ x: 0, y: 0, width: 100, height: 100 });
    });

    it('should handle rectangle geometry', () => {
      const rectRealm = new RealmData({
        geometry: {
          type: 'rectangle',
          x: 50,
          y: 50,
          width: 100,
          height: 80
        }
      });

      expect(rectRealm.containsPoint(50, 50)).toBe(true); // Center
      expect(rectRealm.containsPoint(25, 25)).toBe(true); // Inside
      expect(rectRealm.containsPoint(150, 50)).toBe(false); // Outside

      const bounds = rectRealm.getBounds();
      expect(bounds).toEqual({ x: 0, y: 10, width: 100, height: 80 });
    });

    it('should handle circle geometry', () => {
      const circleRealm = new RealmData({
        geometry: {
          type: 'circle',
          x: 50,
          y: 50,
          radius: 25
        }
      });

      expect(circleRealm.containsPoint(50, 50)).toBe(true); // Center
      expect(circleRealm.containsPoint(60, 60)).toBe(true); // Inside
      expect(circleRealm.containsPoint(80, 80)).toBe(false); // Outside

      const bounds = circleRealm.getBounds();
      expect(bounds).toEqual({ x: 25, y: 25, width: 50, height: 50 });
    });

    it('should handle rotated rectangle', () => {
      const rotatedRealm = new RealmData({
        geometry: {
          type: 'rectangle',
          x: 50,
          y: 50,
          width: 100,
          height: 60,
          rotation: Math.PI / 4 // 45 degrees
        }
      });

      expect(rotatedRealm.containsPoint(50, 50)).toBe(true); // Center should always be inside
    });
  });

  describe('Metadata Management', () => {
    it('should have creation metadata', () => {
      expect(realm.metadata.created).toBeDefined();
      expect(realm.metadata.modified).toBeDefined();
      expect(realm.metadata.author).toBeDefined();
      expect(realm.metadata.version).toBe('1.0.0');
    });

    it('should update modified timestamp on touch', () => {
      const originalModified = realm.metadata.modified;

      // Small delay to ensure timestamp difference
      setTimeout(() => {
        realm.touch();
        expect(realm.metadata.modified).not.toBe(originalModified);
      }, 1);
    });

    it('should update modified timestamp when adding tags', () => {
      const originalModified = realm.metadata.modified;

      setTimeout(() => {
        realm.addTag('custom:test');
        expect(realm.metadata.modified).not.toBe(originalModified);
      }, 1);
    });
  });

  describe('Serialization', () => {
    it('should serialize to object correctly', () => {
      const obj = realm.toObject();

      expect(obj.id).toBe(realm.id);
      expect(obj.name).toBe(realm.name);
      expect(obj.geometry).toEqual(realm.geometry);
      expect(obj.tags).toEqual(realm.getTags());
      expect(obj.metadata).toEqual(realm.metadata);
    });

    it('should deserialize from object correctly', () => {
      const obj = realm.toObject();
      const newRealm = RealmData.fromObject(obj);

      expect(newRealm.id).toBe(realm.id);
      expect(newRealm.name).toBe(realm.name);
      expect(newRealm.getTags()).toEqual(realm.getTags());
      expect(newRealm.geometry).toEqual(realm.geometry);
    });

    it('should clone correctly', () => {
      const clone = realm.clone();

      expect(clone.id).toBe(realm.id);
      expect(clone.name).toBe(realm.name);
      expect(clone.getTags()).toEqual(realm.getTags());

      // Ensure it's a deep copy
      clone.addTag('custom:cloned');
      expect(realm.hasTag('custom:cloned')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty polygon', () => {
      const emptyRealm = new RealmData({
        geometry: { type: 'polygon', points: [] }
      });

      expect(emptyRealm.containsPoint(0, 0)).toBe(false);

      const bounds = emptyRealm.getBounds();
      expect(bounds).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });

    it('should handle invalid geometry type', () => {
      const invalidRealm = new RealmData({
        geometry: { type: 'invalid' as any }
      });

      expect(invalidRealm.containsPoint(0, 0)).toBe(false);
    });

    it('should generate unique IDs when not provided', () => {
      const realm1 = new RealmData();
      const realm2 = new RealmData();

      expect(realm1.id).not.toBe(realm2.id);
      expect(realm1.id).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('should handle polygon with insufficient points', () => {
      const invalidPolygon = new RealmData({
        geometry: {
          type: 'polygon',
          points: [0, 0, 100, 100] // Only 2 points (4 coordinates)
        }
      });

      expect(invalidPolygon.containsPoint(50, 50)).toBe(false);
    });
  });
});
