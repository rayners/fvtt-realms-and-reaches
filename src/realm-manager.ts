/**
 * RealmManager - Spatial indexing and data management for realms
 * 
 * Provides fast spatial queries, data persistence, and event management
 * for the realm system. Uses Region documents with type "realm".
 */


// RealmData is now replaced by Region documents with realm flag
// Custom data is stored in flags["realms-and-reaches"]
type RealmRegion = RegionDocument & {
  flags: {
    "realms-and-reaches"?: {
      isRealm?: boolean;
      tags?: string[];
      metadata?: {
        created: string;
        modified: string;
        author: string;
      };
    };
  };
};

// SceneRealmData is no longer needed - data is stored in Region documents

export interface RealmQueryOptions {
  sceneId?: string;
  tags?: string[];
  bounds?: { x: number; y: number; width: number; height: number };
  limit?: number;
}

/**
 * Helper functions for working with realm regions
 */
class RealmHelpers {
  /**
   * Get tags from a realm region
   */
  static getTags(region: RealmRegion): string[] {
    return region.flags["realms-and-reaches"]?.tags || [];
  }

  /**
   * Add a tag to a realm region
   */
  static async addTag(region: RealmRegion, tag: string): Promise<void> {
    const currentTags = this.getTags(region);
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag];
      await region.setFlag("realms-and-reaches", "tags", newTags);
    }
  }

  /**
   * Remove a tag from a realm region
   */
  static async removeTag(region: RealmRegion, tag: string): Promise<void> {
    const currentTags = this.getTags(region);
    const newTags = currentTags.filter(t => t !== tag);
    await region.setFlag("realms-and-reaches", "tags", newTags);
  }

  /**
   * Check if a realm region has a specific tag
   */
  static hasTag(region: RealmRegion, tag: string): boolean {
    return this.getTags(region).includes(tag);
  }

  /**
   * Get a tag value (part after the colon)
   */
  static getTag(region: RealmRegion, key: string): string | null {
    const tags = this.getTags(region);
    const tag = tags.find(t => t.startsWith(key + ':'));
    return tag ? tag.split(':', 2)[1] : null;
  }

  /**
   * Check if a point is inside a realm region
   */
  static containsPoint(region: RealmRegion, x: number, y: number): boolean {
    // Use Foundry's built-in Region.testPoint method
    return region.testPoint({x, y}, 0.01);
  }

  /**
   * Get the bounding box of a realm region
   */
  static getBounds(region: RealmRegion): { x: number; y: number; width: number; height: number } {
    // Use Foundry's built-in Region bounds
    const bounds = region.bounds;
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    };
  }

  /**
   * Update metadata for a realm region
   */
  static async touch(region: RealmRegion): Promise<void> {
    const metadata = region.flags["realms-and-reaches"]?.metadata || {};
    metadata.modified = new Date().toISOString();
    await region.setFlag("realms-and-reaches", "metadata", metadata);
  }
}

/**
 * RealmManager handles spatial indexing, persistence, and queries for realms
 * Uses Region documents with type "realm" instead of custom documents
 */
export class RealmManager extends EventTarget {
  private static instances = new Map<string, RealmManager>();
  
  private sceneId: string;
  
  private constructor(sceneId: string) {
    super();
    this.sceneId = sceneId;
  }

  /**
   * Get the RealmManager instance for a specific scene
   */
  static getInstance(sceneId?: string): RealmManager {
    const id = sceneId || canvas?.scene?.id || 'global';
    
    if (!RealmManager.instances.has(id)) {
      const manager = new RealmManager(id);
      RealmManager.instances.set(id, manager);
      manager.loadFromScene();
    }
    
    return RealmManager.instances.get(id)!;
  }

  /**
   * Get the global RealmManager (for cross-scene operations)
   */
  static getGlobalInstance(): RealmManager {
    return RealmManager.getInstance('global');
  }

  // Realm CRUD Operations

  /**
   * Create a new realm
   */
  async createRealm(realmData: {
    name?: string;
    shapes?: any[];
    tags?: string[];
    color?: string;
  }): Promise<RealmRegion> {
    const scene = game.scenes?.get(this.sceneId);
    if (!scene) {
      throw new Error(`Scene ${this.sceneId} not found`);
    }

    // Create Region document with realm flag
    const regionData = {
      name: realmData.name || 'New Realm',
      color: realmData.color || '#ff0000',
      shapes: realmData.shapes || [],
      flags: {
        'realms-and-reaches': {
          isRealm: true,
          tags: realmData.tags || [],
          metadata: {
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            author: game.user?.name || 'Unknown'
          }
        }
      }
    };

    const realm = await scene.createEmbeddedDocuments('Region', [regionData]) as RealmRegion[];
    const createdRealm = realm[0];
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('realmCreated', {
      detail: { realm: createdRealm, sceneId: this.sceneId }
    }));
    
    return createdRealm;
  }

  /**
   * Update an existing realm
   */
  async updateRealm(realm: RealmRegion, updates: {
    name?: string;
    shapes?: any[];
    tags?: string[];
    color?: string;
  }): Promise<void> {
    // Update modified timestamp
    await RealmHelpers.touch(realm);
    
    // Update the region document
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.shapes !== undefined) updateData.shapes = updates.shapes;
    if (updates.color !== undefined) updateData.color = updates.color;
    
    if (updates.tags !== undefined) {
      updateData['flags.realms-and-reaches.tags'] = updates.tags;
    }
    
    await realm.update(updateData);
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('realmUpdated', {
      detail: { realm, sceneId: this.sceneId }
    }));
  }

  /**
   * Delete a realm
   */
  async deleteRealm(realmId: string): Promise<boolean> {
    const realm = this.getRealm(realmId);
    if (!realm) return false;
    
    // Delete the region document
    await realm.delete();
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('realmDeleted', {
      detail: { realm, realmId, sceneId: this.sceneId }
    }));
    
    return true;
  }

  // Query Operations

  /**
   * Get a realm by ID
   */
  getRealm(realmId: string): RealmRegion | null {
    const scene = game.scenes?.get(this.sceneId);
    if (!scene) return null;
    
    const region = scene.regions.get(realmId) as RealmRegion;
    return (region && region.type === 'realm') ? region : null;
  }

  /**
   * Get the first realm at a specific point
   */
  getRealmAt(x: number, y: number): RealmRegion | null {
    const realms = this.getRealmsAt(x, y);
    return realms[0] || null;
  }

  /**
   * Get all realms at a specific point
   */
  getRealmsAt(x: number, y: number): RealmRegion[] {
    const scene = game.scenes?.get(this.sceneId);
    if (!scene) return [];
    
    const results: RealmRegion[] = [];
    
    for (const region of scene.regions) {
      if (region.flags?.['realms-and-reaches']?.isRealm === true && RealmHelpers.containsPoint(region as RealmRegion, x, y)) {
        results.push(region as RealmRegion);
      }
    }
    
    return results;
  }

  /**
   * Get all realms
   */
  getAllRealms(): RealmRegion[] {
    const scene = game.scenes?.get(this.sceneId);
    if (!scene) return [];
    
    return scene.regions.filter(region => region.flags?.['realms-and-reaches']?.isRealm === true) as RealmRegion[];
  }

  /**
   * Find realms matching specific criteria
   */
  findRealms(options: RealmQueryOptions): RealmRegion[] {
    let results = this.getAllRealms();
    
    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      results = results.filter(realm => {
        return options.tags!.every(tag => RealmHelpers.hasTag(realm, tag));
      });
    }
    
    // Filter by bounds
    if (options.bounds) {
      results = results.filter(realm => {
        const realmBounds = RealmHelpers.getBounds(realm);
        return this.boundsIntersect(options.bounds!, realmBounds);
      });
    }
    
    // Apply limit
    if (options.limit && options.limit > 0) {
      results = results.slice(0, options.limit);
    }
    
    return results;
  }

  /**
   * Check if two bounding boxes intersect
   */
  private boundsIntersect(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    return !(a.x + a.width < b.x || b.x + b.width < a.x ||
             a.y + a.height < b.y || b.y + b.height < a.y);
  }

  /**
   * Find realms by tag
   */
  findRealmsByTag(tag: string): RealmRegion[] {
    return this.getAllRealms().filter(realm => RealmHelpers.hasTag(realm, tag));
  }

  /**
   * Find realms by multiple tags (all must match)
   */
  findRealmsByTags(tags: string[]): RealmRegion[] {
    return this.getAllRealms().filter(realm => {
      return tags.every(tag => RealmHelpers.hasTag(realm, tag));
    });
  }

  // Data Persistence - Now handled automatically by Region documents

  /**
   * Load realm data from scene - No longer needed, Region documents are automatically loaded
   */
  async loadFromScene(): Promise<void> {
    // No-op: Region documents are automatically loaded by Foundry
    // Dispatch event for compatibility
    this.dispatchEvent(new CustomEvent('realmsLoaded', {
      detail: { sceneId: this.sceneId, count: this.getAllRealms().length }
    }));
  }

  /**
   * Save realm data to scene - No longer needed, Region documents are automatically saved
   */
  async saveToScene(): Promise<void> {
    // No-op: Region documents are automatically saved by Foundry
    // Dispatch event for compatibility
    this.dispatchEvent(new CustomEvent('realmsSaved', {
      detail: { sceneId: this.sceneId, count: this.getAllRealms().length }
    }));
  }

  /**
   * Export realm data for sharing
   */
  exportData(): any {
    const realms = this.getAllRealms();
    const scene = game.scenes?.get(this.sceneId);
    
    return {
      format: 'realms-and-reaches-v1',
      metadata: {
        author: game.user?.name || 'Unknown',
        created: new Date().toISOString(),
        version: '1.0.0',
        sceneId: this.sceneId,
        sceneName: scene?.name || 'Unknown Scene'
      },
      realms: realms.map(realm => ({
        id: realm.id,
        name: realm.name,
        color: realm.color,
        shapes: realm.shapes,
        tags: RealmHelpers.getTags(realm),
        metadata: realm.flags['realms-and-reaches']?.metadata
      })),
      bounds: scene ? { width: scene.width, height: scene.height } : null
    };
  }

  /**
   * Import realm data from export format
   */
  async importData(data: any, options: { replace?: boolean; merge?: boolean } = {}): Promise<number> {
    if (data.format !== 'realms-and-reaches-v1') {
      throw new Error('Unsupported data format');
    }
    
    const scene = game.scenes?.get(this.sceneId);
    if (!scene) {
      throw new Error(`Scene ${this.sceneId} not found`);
    }
    
    if (options.replace) {
      // Delete all existing realm regions
      const existingRealms = this.getAllRealms();
      if (existingRealms.length > 0) {
        await scene.deleteEmbeddedDocuments('Region', existingRealms.map(r => r.id));
      }
    }
    
    let importedCount = 0;
    const regionData = [];
    
    for (const realmObj of data.realms) {
      try {
        // Check for ID conflicts
        let id = realmObj.id;
        if (!options.replace && this.getRealm(id)) {
          if (!options.merge) {
            continue; // Skip conflicting IDs
          }
          // Generate new ID for merge
          id = foundry.utils.randomID();
        }
        
        const regionDocData = {
          _id: id,
          name: realmObj.name || 'Imported Realm',
          color: realmObj.color || '#ff0000',
          shapes: realmObj.shapes || [],
          flags: {
            'realms-and-reaches': {
              isRealm: true,
              tags: realmObj.tags || [],
              metadata: realmObj.metadata || {
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                author: game.user?.name || 'Unknown'
              }
            }
          }
        };
        
        regionData.push(regionDocData);
        importedCount++;
      } catch (error) {
        console.warn(`Failed to import realm ${realmObj.id}:`, error);
      }
    }
    
    // Create all regions at once
    if (regionData.length > 0) {
      await scene.createEmbeddedDocuments('Region', regionData);
    }
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('realmsImported', {
      detail: { sceneId: this.sceneId, count: importedCount }
    }));
    
    return importedCount;
  }

  // Utility Methods - simplified since Region documents handle persistence

  /**
   * Get statistics about realms in this scene
   */
  getStatistics(): any {
    const realms = this.getAllRealms();
    const tagCounts = new Map<string, number>();
    
    for (const realm of realms) {
      for (const tag of RealmHelpers.getTags(realm)) {
        const key = tag.split(':')[0];
        tagCounts.set(key, (tagCounts.get(key) || 0) + 1);
      }
    }
    
    return {
      totalRealms: realms.length,
      tagCounts: Object.fromEntries(tagCounts),
      sceneId: this.sceneId
    };
  }

  /**
   * Clear all realms from this manager
   */
  async clearAll(): Promise<void> {
    const realms = this.getAllRealms();
    const count = realms.length;
    
    if (count > 0) {
      const scene = game.scenes?.get(this.sceneId);
      if (scene) {
        await scene.deleteEmbeddedDocuments('Region', realms.map(r => r.id));
      }
    }
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('realmsCleared', {
      detail: { sceneId: this.sceneId, count }
    }));
  }

  /**
   * Initialize the manager for a specific scene
   */
  async initialize(sceneId: string): Promise<void> {
    this.sceneId = sceneId;
    
    // Load existing realm data - now automatic with Region documents
    await this.loadFromScene();
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('realmsLoaded', {
      detail: { sceneId: this.sceneId }
    }));
  }

  /**
   * Export scene realm data for sharing
   */
  exportScene(): any {
    const realms = this.getAllRealms();
    
    return {
      format: 'realms-and-reaches-v1',
      metadata: {
        author: game.user?.name || 'Unknown',
        created: new Date().toISOString(),
        version: '1.0.0',
        description: `Realm data for scene ${this.sceneId}`
      },
      scenes: {
        [this.sceneId]: {
          realms: realms.map(realm => ({
            id: realm.id,
            name: realm.name,
            color: realm.color,
            shapes: realm.shapes,
            tags: RealmHelpers.getTags(realm),
            metadata: realm.flags['realms-and-reaches']?.metadata
          })),
          bounds: { width: canvas?.scene?.width || 4000, height: canvas?.scene?.height || 4000 }
        }
      }
    };
  }

  /**
   * Import realm data to current scene
   */
  async importScene(data: any): Promise<void> {
    if (data.format !== 'realms-and-reaches-v1') {
      throw new Error('Unsupported data format');
    }
    
    // Find scene data - use first scene if current not found
    const sceneData = data.scenes[this.sceneId] || Object.values(data.scenes)[0];
    if (!sceneData) {
      throw new Error('No scene data found in import');
    }
    
    const scene = game.scenes?.get(this.sceneId);
    if (!scene) {
      throw new Error(`Scene ${this.sceneId} not found`);
    }
    
    const regionData = [];
    
    // Import realms
    for (const realmObj of (sceneData as any).realms) {
      try {
        // Generate new ID to avoid conflicts
        const id = foundry.utils.randomID();
        
        const regionDocData = {
          _id: id,
          name: realmObj.name || 'Imported Realm',
          color: realmObj.color || '#ff0000',
          shapes: realmObj.shapes || [],
          flags: {
            'realms-and-reaches': {
              isRealm: true,
              tags: realmObj.tags || [],
              metadata: realmObj.metadata || {
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                author: game.user?.name || 'Unknown'
              }
            }
          }
        };
        
        regionData.push(regionDocData);
      } catch (error) {
        console.warn('Failed to import realm:', error);
      }
    }
    
    // Create all regions at once
    if (regionData.length > 0) {
      await scene.createEmbeddedDocuments('Region', regionData);
    }
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('realmsImported', {
      detail: { sceneId: this.sceneId, count: regionData.length }
    }));
  }
}