/**
 * Tests for TagSystem class
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TagSystem, TAG_NAMESPACES } from '../src/tag-system';

describe('TagSystem', () => {
  let tagSystem: TagSystem;

  beforeEach(() => {
    tagSystem = TagSystem.getInstance();
  });

  describe('Tag Validation', () => {
    it('should validate correct tag formats', () => {
      const validTags = [
        'biome:forest',
        'terrain:dense',
        'travel_speed:0.75',
        'custom:haunted',
        'module:jj:encounter_chance:0.3'
      ];

      for (const tag of validTags) {
        const result = tagSystem.validateTag(tag);
        expect(result.valid).toBe(true);
      }
    });

    it('should reject invalid tag formats', () => {
      const invalidTags = [
        '', // Empty
        'no_colon', // No colon
        ':no_key', // No key
        'no_value:', // No value
        'key::double_colon', // Double colon (non-module)
        'invalid chars!:value', // Invalid characters in key
        'key:invalid chars!', // Invalid characters in value
      ];

      for (const tag of invalidTags) {
        const result = tagSystem.validateTag(tag);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      }
    });

    it('should validate namespace-specific rules', () => {
      // travel_speed should be numeric 0.1-2.0
      expect(tagSystem.validateTag('travel_speed:0.75').valid).toBe(true);
      expect(tagSystem.validateTag('travel_speed:0.05').valid).toBe(false); // Too low
      expect(tagSystem.validateTag('travel_speed:3.0').valid).toBe(false); // Too high
      expect(tagSystem.validateTag('travel_speed:abc').valid).toBe(false); // Non-numeric
    });

    it('should allow module tags with multiple colons', () => {
      const moduleTag = 'module:jj:encounter_chance:0.3';
      const result = tagSystem.validateTag(moduleTag);
      expect(result.valid).toBe(true);
    });
  });

  describe('Tag Suggestions', () => {
    it('should suggest namespace prefixes for partial input', () => {
      const suggestions = tagSystem.getSuggestions('bio');
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.tag.startsWith('biome:'))).toBe(true);
    });

    it('should suggest values for specific namespaces', () => {
      const suggestions = tagSystem.getSuggestions('biome:for');
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.tag === 'biome:forest')).toBe(true);
    });

    it('should exclude already used single-value namespaces', () => {
      const existingTags = ['biome:forest'];
      const suggestions = tagSystem.getSuggestions('bio', existingTags);
      
      // Should not suggest biome since it's already used
      expect(suggestions.some(s => s.tag.startsWith('biome:'))).toBe(false);
    });

    it('should allow multiple resource tags', () => {
      const existingTags = ['resources:timber'];
      const suggestions = tagSystem.getSuggestions('resources:', existingTags);
      
      // Should still suggest more resource tags
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.tag.includes('resources:'))).toBe(true);
    });

    it('should sort suggestions by relevance', () => {
      const suggestions = tagSystem.getSuggestions('forest');
      
      // More relevant suggestions should come first
      expect(suggestions[0].score).toBeGreaterThanOrEqual(suggestions[1]?.score || 0);
    });

    it('should limit suggestion count', () => {
      const suggestions = tagSystem.getSuggestions('');
      expect(suggestions.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Namespace Management', () => {
    it('should identify tag namespaces correctly', () => {
      expect(tagSystem.getNamespace('biome:forest')?.prefix).toBe('biome');
      expect(tagSystem.getNamespace('custom:haunted')?.prefix).toBe('custom');
      expect(tagSystem.getNamespace('unknown:tag')).toBe(null);
    });

    it('should provide namespace information', () => {
      const biomeNamespace = tagSystem.getNamespace('biome:forest');
      expect(biomeNamespace).toBeDefined();
      expect(biomeNamespace!.name).toBe('Biome');
      expect(biomeNamespace!.description).toBeDefined();
      expect(biomeNamespace!.color).toBeDefined();
      expect(biomeNamespace!.examples.length).toBeGreaterThan(0);
    });
  });

  describe('Tag Normalization', () => {
    it('should normalize tags to lowercase', () => {
      expect(tagSystem.normalizeTag('BIOME:FOREST')).toBe('biome:forest');
      expect(tagSystem.normalizeTag('  Terrain:Dense  ')).toBe('terrain:dense');
    });
  });

  describe('Biome Tag Suggestions', () => {
    it('should provide appropriate tags for forest biome', () => {
      const suggestions = tagSystem.getBiomeTagSuggestions('forest');
      
      expect(suggestions).toContain('terrain:dense');
      expect(suggestions).toContain('resources:timber');
      expect(suggestions).toContain('resources:game');
    });

    it('should provide appropriate tags for desert biome', () => {
      const suggestions = tagSystem.getBiomeTagSuggestions('desert');
      
      expect(suggestions).toContain('terrain:rocky');
      expect(suggestions).toContain('climate:arid');
    });

    it('should handle unknown biomes gracefully', () => {
      const suggestions = tagSystem.getBiomeTagSuggestions('unknown_biome');
      expect(suggestions).toEqual([]);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect multiple biome tags', () => {
      const tags = ['biome:forest', 'biome:desert'];
      const conflicts = tagSystem.detectConflicts(tags);
      
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts.some(c => c.includes('Multiple biome tags'))).toBe(true);
    });

    it('should detect logical conflicts', () => {
      const tags = ['travel_speed:1.5', 'terrain:dense'];
      const conflicts = tagSystem.detectConflicts(tags);
      
      expect(conflicts.some(c => c.includes('High travel speed conflicts'))).toBe(true);
    });

    it('should allow multiple resource tags', () => {
      const tags = ['resources:timber', 'resources:game'];
      const conflicts = tagSystem.detectConflicts(tags);
      
      expect(conflicts.length).toBe(0);
    });

    it('should detect multiple climate tags', () => {
      const tags = ['climate:temperate', 'climate:arctic'];
      const conflicts = tagSystem.detectConflicts(tags);
      
      expect(conflicts.some(c => c.includes('Multiple climate tags'))).toBe(true);
    });
  });

  describe('Namespace Configuration', () => {
    it('should have all expected core namespaces', () => {
      const expectedNamespaces = [
        'biome', 'terrain', 'climate', 'travel_speed', 
        'resources', 'elevation', 'custom', 'module'
      ];
      
      for (const namespace of expectedNamespaces) {
        expect(TAG_NAMESPACES[namespace]).toBeDefined();
      }
    });

    it('should have valid namespace configurations', () => {
      for (const [key, namespace] of Object.entries(TAG_NAMESPACES)) {
        expect(namespace.prefix).toBe(key);
        expect(namespace.name).toBeDefined();
        expect(namespace.description).toBeDefined();
        expect(namespace.color).toMatch(/^#[0-9a-f]{6}$/i);
        expect(namespace.examples.length).toBeGreaterThan(0);
        
        // Each example should be valid for its namespace
        for (const example of namespace.examples) {
          expect(example.startsWith(`${key}:`)).toBe(true);
        }
      }
    });

    it('should have suggestions for namespaces that specify them', () => {
      const namespacesWithSuggestions = Object.values(TAG_NAMESPACES)
        .filter(ns => ns.suggestions);
      
      expect(namespacesWithSuggestions.length).toBeGreaterThan(0);
      
      for (const namespace of namespacesWithSuggestions) {
        expect(namespace.suggestions!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty suggestion queries', () => {
      const suggestions = tagSystem.getSuggestions('');
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle malformed existing tags in suggestions', () => {
      const existingTags = ['invalid_tag', 'biome:forest'];
      const suggestions = tagSystem.getSuggestions('terrain', existingTags);
      
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle null/undefined validation input', () => {
      expect(tagSystem.validateTag(null as any).valid).toBe(false);
      expect(tagSystem.validateTag(undefined as any).valid).toBe(false);
    });
  });
});