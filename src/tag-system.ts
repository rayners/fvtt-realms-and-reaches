/**
 * Tag System - Validation, suggestions, and namespace management for realm tags
 *
 * Provides tag validation, auto-suggestions, and namespace conventions
 * for the flexible tag-based realm metadata system.
 */

export interface TagNamespace {
  prefix: string;
  name: string;
  description: string;
  color: string;
  examples: string[];
  validation?: (value: string) => boolean;
  suggestions?: string[];
}

export interface TagSuggestion {
  tag: string;
  description: string;
  namespace: string;
  score: number; // Relevance score for sorting
}

/**
 * Core tag namespaces and their conventions
 */
export const TAG_NAMESPACES: Record<string, TagNamespace> = {
  biome: {
    prefix: 'biome',
    name: 'Biome',
    description: 'Primary ecosystem type',
    color: '#28a745',
    examples: ['biome:forest', 'biome:desert', 'biome:mountain', 'biome:swamp'],
    suggestions: [
      'forest',
      'desert',
      'mountain',
      'swamp',
      'grassland',
      'tundra',
      'jungle',
      'coast',
      'hills',
      'valley',
      'plateau',
      'canyon'
    ]
  },

  terrain: {
    prefix: 'terrain',
    name: 'Terrain',
    description: 'Terrain difficulty and features',
    color: '#dc3545',
    examples: ['terrain:dense', 'terrain:rocky', 'terrain:marshy'],
    suggestions: [
      'dense',
      'sparse',
      'rocky',
      'marshy',
      'rugged',
      'smooth',
      'steep',
      'flat',
      'broken',
      'cultivated',
      'wild',
      'clear'
    ]
  },

  climate: {
    prefix: 'climate',
    name: 'Climate',
    description: 'Weather patterns and temperature',
    color: '#17a2b8',
    examples: ['climate:temperate', 'climate:arctic', 'climate:tropical'],
    suggestions: [
      'temperate',
      'arctic',
      'tropical',
      'arid',
      'humid',
      'dry',
      'wet',
      'mild',
      'harsh',
      'seasonal',
      'stable',
      'volatile'
    ]
  },

  travel_speed: {
    prefix: 'travel_speed',
    name: 'Travel Speed',
    description: 'Movement speed modifier (0.1 to 2.0)',
    color: '#ffc107',
    examples: ['travel_speed:0.5', 'travel_speed:1.0', 'travel_speed:1.5'],
    validation: (value: string) => {
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0.1 && num <= 2.0;
    },
    suggestions: ['0.25', '0.5', '0.75', '1.0', '1.25', '1.5', '2.0']
  },

  resources: {
    prefix: 'resources',
    name: 'Resources',
    description: 'Available natural resources',
    color: '#6f42c1',
    examples: ['resources:timber', 'resources:game', 'resources:minerals'],
    suggestions: [
      'timber',
      'game',
      'fish',
      'minerals',
      'herbs',
      'stone',
      'water',
      'food',
      'fuel',
      'rare_metals',
      'gems',
      'magical'
    ]
  },

  elevation: {
    prefix: 'elevation',
    name: 'Elevation',
    description: 'Height classification',
    color: '#6c757d',
    examples: ['elevation:lowland', 'elevation:highland', 'elevation:peak'],
    suggestions: [
      'sea_level',
      'lowland',
      'highland',
      'mountain',
      'peak',
      'underground',
      'elevated',
      'deep',
      'surface'
    ]
  },

  custom: {
    prefix: 'custom',
    name: 'Custom',
    description: 'User-defined properties',
    color: '#e83e8c',
    examples: ['custom:haunted', 'custom:sacred', 'custom:dangerous'],
    suggestions: [
      'haunted',
      'sacred',
      'dangerous',
      'peaceful',
      'magical',
      'cursed',
      'blessed',
      'ancient',
      'ruined',
      'inhabited'
    ]
  },

  module: {
    prefix: 'module',
    name: 'Module',
    description: 'Module-specific properties (module:name:key:value)',
    color: '#fd7e14',
    examples: ['module:jj:encounter_chance:0.3', 'module:weather:severity:high'],
    validation: (value: string) => {
      // Format: module_name:property:value
      const parts = value.split(':');
      return parts.length >= 2;
    }
  }
};

/**
 * TagSystem provides validation, suggestions, and management for realm tags
 */
export class TagSystem {
  private static instance: TagSystem;

  static getInstance(): TagSystem {
    if (!TagSystem.instance) {
      TagSystem.instance = new TagSystem();
    }
    return TagSystem.instance;
  }

  /**
   * Validate a tag format and content
   * @param tag - The tag to validate
   * @returns Validation result with error message if invalid
   */
  validateTag(tag: string): { valid: boolean; error?: string } {
    // Basic format validation
    if (!tag || typeof tag !== 'string') {
      return { valid: false, error: 'Tag must be a non-empty string' };
    }

    const colonIndex = tag.indexOf(':');
    if (colonIndex <= 0) {
      return { valid: false, error: 'Tag must contain a colon (:) separating key and value' };
    }

    if (colonIndex >= tag.length - 1) {
      return { valid: false, error: 'Tag must have a value after the colon' };
    }

    // Check for multiple colons (except in module namespace)
    const [prefix, ...valueParts] = tag.split(':');
    if (prefix !== 'module' && valueParts.join(':').includes(':')) {
      return { valid: false, error: 'Tag can only contain one colon (except module tags)' };
    }

    // Character validation
    const validKeyPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validKeyPattern.test(prefix)) {
      return {
        valid: false,
        error: 'Tag key can only contain letters, numbers, underscores, and hyphens'
      };
    }

    const value = valueParts.join(':');
    // For module tags, allow colons in the value. For other tags, don't allow colons.
    const validValuePattern = prefix === 'module' 
      ? /^[a-zA-Z0-9_.:/-]+$/  // Allow colons for module tags
      : /^[a-zA-Z0-9_.-]+$/;   // No colons for other tags
    if (!validValuePattern.test(value)) {
      return {
        valid: false,
        error: `Tag value can only contain letters, numbers, underscores, periods, hyphens${prefix === 'module' ? ', colons, and forward slashes' : ''}`
      };
    }

    // Namespace-specific validation
    const namespace = TAG_NAMESPACES[prefix];
    if (namespace && namespace.validation) {
      if (!namespace.validation(value)) {
        return { valid: false, error: `Invalid value for ${namespace.name} tag` };
      }
    }

    return { valid: true };
  }

  /**
   * Get tag suggestions based on partial input
   * @param partial - Partial tag input
   * @param existingTags - Tags already applied to the realm
   * @returns Array of tag suggestions
   */
  getSuggestions(partial: string, existingTags: string[] = []): TagSuggestion[] {
    const suggestions: TagSuggestion[] = [];
    const partialLower = partial.toLowerCase();
    const existingKeys = new Set(existingTags.map(tag => tag.split(':')[0]));

    if (partial.includes(':')) {
      // Suggesting values for a specific key
      const [prefix, valuePartial] = partial.split(':', 2);
      const namespace = TAG_NAMESPACES[prefix];

      if (namespace && namespace.suggestions) {
        for (const suggestion of namespace.suggestions) {
          if (suggestion.toLowerCase().includes(valuePartial.toLowerCase())) {
            const fullTag = `${prefix}:${suggestion}`;
            suggestions.push({
              tag: fullTag,
              description: `${namespace.name}: ${suggestion}`,
              namespace: namespace.name,
              score: this.calculateRelevanceScore(suggestion, valuePartial)
            });
          }
        }
      }
    } else {
      // Suggesting namespace prefixes and matching tag values
      for (const [prefix, namespace] of Object.entries(TAG_NAMESPACES)) {
        // Check if namespace prefix matches
        const prefixMatches = prefix.toLowerCase().includes(partialLower);
        
        if (prefixMatches) {
          // Don't suggest if this namespace already has a tag (except resources and custom)
          if (existingKeys.has(prefix) && !['resources', 'custom', 'module'].includes(prefix)) {
            continue;
          }

          for (const example of namespace.examples) {
            suggestions.push({
              tag: example,
              description: `${namespace.name}: ${namespace.description}`,
              namespace: namespace.name,
              score: this.calculateRelevanceScore(prefix, partialLower)
            });
          }
        }
        
        // Also check if any tag values/examples match the input
        if (namespace.examples) {
          for (const example of namespace.examples) {
            const [, exampleValue] = example.split(':', 2);
            if (exampleValue && exampleValue.toLowerCase().includes(partialLower)) {
              // Don't suggest if this namespace already has a tag (except resources and custom)
              if (existingKeys.has(prefix) && !['resources', 'custom', 'module'].includes(prefix)) {
                continue;
              }
              
              suggestions.push({
                tag: example,
                description: `${namespace.name}: ${exampleValue}`,
                namespace: namespace.name,
                score: this.calculateRelevanceScore(exampleValue, partialLower)
              });
            }
          }
        }
        
        // Check suggestions array if it exists
        if (namespace.suggestions) {
          for (const suggestion of namespace.suggestions) {
            if (suggestion.toLowerCase().includes(partialLower)) {
              // Don't suggest if this namespace already has a tag (except resources and custom)
              if (existingKeys.has(prefix) && !['resources', 'custom', 'module'].includes(prefix)) {
                continue;
              }
              
              const fullTag = `${prefix}:${suggestion}`;
              suggestions.push({
                tag: fullTag,
                description: `${namespace.name}: ${suggestion}`,
                namespace: namespace.name,
                score: this.calculateRelevanceScore(suggestion, partialLower)
              });
            }
          }
        }
      }
    }

    // Sort by relevance score (higher is better)
    return suggestions
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  /**
   * Get namespace information for a tag
   * @param tag - The tag to analyze
   * @returns Namespace information or null
   */
  getNamespace(tag: string): TagNamespace | null {
    const prefix = tag.split(':')[0];
    return TAG_NAMESPACES[prefix] || null;
  }

  /**
   * Normalize a tag to standard format
   * @param tag - The tag to normalize
   * @returns Normalized tag
   */
  normalizeTag(tag: string): string {
    return tag.toLowerCase().trim();
  }

  /**
   * Get common tag patterns for a biome
   * @param biome - The biome type
   * @returns Array of suggested tags for this biome
   */
  getBiomeTagSuggestions(biome: string): string[] {
    const biomePatterns: Record<string, string[]> = {
      forest: [
        'terrain:dense',
        'travel_speed:0.75',
        'resources:timber',
        'resources:game',
        'climate:temperate'
      ],
      desert: ['terrain:rocky', 'travel_speed:0.5', 'resources:minerals', 'climate:arid'],
      mountain: [
        'terrain:rugged',
        'travel_speed:0.25',
        'elevation:highland',
        'resources:stone',
        'resources:minerals'
      ],
      swamp: ['terrain:marshy', 'travel_speed:0.5', 'resources:herbs', 'climate:humid'],
      grassland: ['terrain:flat', 'travel_speed:1.25', 'resources:game', 'climate:temperate']
    };

    return biomePatterns[biome.toLowerCase()] || [];
  }

  /**
   * Detect potential tag conflicts
   * @param tags - Array of tags to check
   * @returns Array of conflict warnings
   */
  detectConflicts(tags: string[]): string[] {
    const conflicts: string[] = [];
    const tagsByKey = new Map<string, string[]>();

    // Group tags by key
    for (const tag of tags) {
      const [key] = tag.split(':', 1);
      if (!tagsByKey.has(key)) {
        tagsByKey.set(key, []);
      }
      tagsByKey.get(key)!.push(tag);
    }

    // Check for conflicting values in single-value namespaces
    const singleValueKeys = ['biome', 'climate', 'travel_speed', 'elevation'];
    for (const key of singleValueKeys) {
      const keyTags = tagsByKey.get(key) || [];
      if (keyTags.length > 1) {
        conflicts.push(`Multiple ${key} tags found: ${keyTags.join(', ')}`);
      }
    }

    // Check for logical conflicts
    const travelSpeed = parseFloat(
      tags.find(t => t.startsWith('travel_speed:'))?.split(':')[1] || '1'
    );
    const hasDenseTerrain = tags.some(t => t === 'terrain:dense');
    const hasRockyTerrain = tags.some(t => t === 'terrain:rocky');

    if (travelSpeed > 1.0 && (hasDenseTerrain || hasRockyTerrain)) {
      conflicts.push('High travel speed conflicts with dense/rocky terrain');
    }

    return conflicts;
  }

  /**
   * Calculate relevance score for suggestions
   */
  private calculateRelevanceScore(suggestion: string, input: string): number {
    const suggestionLower = suggestion.toLowerCase();
    const inputLower = input.toLowerCase();

    if (suggestionLower === inputLower) return 100;
    if (suggestionLower.startsWith(inputLower)) return 80;
    if (suggestionLower.includes(inputLower)) return 60;

    // Levenshtein distance based scoring
    const distance = this.levenshteinDistance(suggestionLower, inputLower);
    const maxLength = Math.max(suggestionLower.length, inputLower.length);
    return Math.max(0, 40 - (distance / maxLength) * 40);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1)
      .fill(null)
      .map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[b.length][a.length];
  }

  // Static convenience methods for API

  /**
   * Static method to validate a tag
   */
  static validateTag(tag: string): boolean {
    return TagSystem.getInstance().validateTag(tag).valid;
  }

  /**
   * Static method to get suggestions for a namespace
   */
  static getSuggestions(namespace: string): string[] {
    const ns = TAG_NAMESPACES[namespace];
    return ns?.suggestions || [];
  }

  /**
   * Static method to get tag suggestions based on partial input
   */
  static getTagSuggestions(partial: string, existingTags: string[] = []): TagSuggestion[] {
    return TagSystem.getInstance().getSuggestions(partial, existingTags);
  }
}
