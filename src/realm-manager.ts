/**
 * RealmManager - Spatial indexing and data management for realms
 * 
 * Provides fast spatial queries, data persistence, and event management
 * for the realm system. Handles scene-based storage and cross-scene queries.
 */

import { RealmData } from './realm-data';

export interface SceneRealmData {
  version: string;
  realms: Record<string, any>; // Serialized RealmData objects
  metadata: {
    created: string;
    modified: string;
    author: string;
  };
}

export interface RealmQueryOptions {
  sceneId?: string;
  tags?: string[];
  bounds?: { x: number; y: number; width: number; height: number };
  limit?: number;
}

/**
 * Simple spatial index for fast realm lookups
 */
class SpatialIndex {
  private realms: Map<string, RealmData> = new Map();
  private bounds: Map<string, { x: number; y: number; width: number; height: number }> = new Map();

  /**
   * Add a realm to the spatial index
   */
  insert(realm: RealmData): void {
    this.realms.set(realm.id, realm);
    this.bounds.set(realm.id, realm.getBounds());
  }

  /**
   * Remove a realm from the spatial index
   */
  remove(realmId: string): void {
    this.realms.delete(realmId);
    this.bounds.delete(realmId);
  }

  /**
   * Update a realm in the spatial index
   */
  update(realm: RealmData): void {
    this.insert(realm); // Insert handles updates
  }

  /**
   * Query realms at a specific point
   */
  queryPoint(x: number, y: number): RealmData[] {
    const results: RealmData[] = [];
    
    for (const [realmId, bounds] of this.bounds) {
      // Quick bounds check first
      if (x >= bounds.x && x <= bounds.x + bounds.width &&
          y >= bounds.y && y <= bounds.y + bounds.height) {
        
        const realm = this.realms.get(realmId);
        if (realm && realm.containsPoint(x, y)) {
          results.push(realm);
        }
      }
    }
    
    return results;
  }

  /**
   * Query realms that intersect with a bounding box
   */
  queryBounds(bounds: { x: number; y: number; width: number; height: number }): RealmData[] {
    const results: RealmData[] = [];
    
    for (const [realmId, realmBounds] of this.bounds) {
      // Check for bounds intersection
      if (this.boundsIntersect(bounds, realmBounds)) {
        const realm = this.realms.get(realmId);
        if (realm) {
          results.push(realm);
        }
      }
    }
    
    return results;
  }

  /**
   * Get all realms
   */
  getAll(): RealmData[] {
    return Array.from(this.realms.values());
  }

  /**
   * Clear all realms
   */
  clear(): void {
    this.realms.clear();
    this.bounds.clear();
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
}

/**
 * RealmManager handles spatial indexing, persistence, and queries for realms
 */
export class RealmManager extends EventTarget {
  private static instances = new Map<string, RealmManager>();
  
  private sceneId: string;
  private spatialIndex = new SpatialIndex();
  private dirty = false;
  
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
  async createRealm(realmData: Partial<RealmData>): Promise<RealmData> {
    const realm = new RealmData(realmData);
    
    this.spatialIndex.insert(realm);
    this.markDirty();
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('realmCreated', {
      detail: { realm, sceneId: this.sceneId }
    }));
    
    // Auto-save if enabled
    if (this.shouldAutoSave()) {
      await this.saveToScene();
    }
    
    return realm;
  }

  /**
   * Update an existing realm
   */
  async updateRealm(realm: RealmData): Promise<void> {
    realm.touch(); // Update modified timestamp
    
    this.spatialIndex.update(realm);
    this.markDirty();
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('realmUpdated', {
      detail: { realm, sceneId: this.sceneId }
    }));
    
    // Auto-save if enabled
    if (this.shouldAutoSave()) {
      await this.saveToScene();
    }
  }

  /**
   * Delete a realm
   */
  async deleteRealm(realmId: string): Promise<boolean> {
    const realm = this.getRealm(realmId);
    if (!realm) return false;
    
    this.spatialIndex.remove(realmId);
    this.markDirty();
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('realmDeleted', {
      detail: { realm, realmId, sceneId: this.sceneId }
    }));
    
    // Auto-save if enabled
    if (this.shouldAutoSave()) {
      await this.saveToScene();
    }
    
    return true;
  }

  // Query Operations

  /**
   * Get a realm by ID
   */
  getRealm(realmId: string): RealmData | null {
    return this.spatialIndex.getAll().find(r => r.id === realmId) || null;
  }

  /**
   * Get the first realm at a specific point
   */
  getRealmAt(x: number, y: number): RealmData | null {
    const realms = this.spatialIndex.queryPoint(x, y);
    return realms[0] || null;
  }

  /**
   * Get all realms at a specific point
   */
  getRealmsAt(x: number, y: number): RealmData[] {
    return this.spatialIndex.queryPoint(x, y);
  }

  /**
   * Get all realms
   */
  getAllRealms(): RealmData[] {
    return this.spatialIndex.getAll();
  }

  /**
   * Find realms matching specific criteria
   */
  findRealms(options: RealmQueryOptions): RealmData[] {
    let results = this.getAllRealms();
    
    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      results = results.filter(realm => {
        return options.tags!.every(tag => realm.hasTag(tag));
      });
    }
    
    // Filter by bounds
    if (options.bounds) {
      results = this.spatialIndex.queryBounds(options.bounds);
    }
    
    // Apply limit
    if (options.limit && options.limit > 0) {
      results = results.slice(0, options.limit);
    }
    
    return results;
  }

  /**
   * Find realms by tag
   */
  findRealmsByTag(tag: string): RealmData[] {
    return this.getAllRealms().filter(realm => realm.hasTag(tag));
  }

  /**
   * Find realms by multiple tags (all must match)
   */
  findRealmsByTags(tags: string[]): RealmData[] {
    return this.getAllRealms().filter(realm => {
      return tags.every(tag => realm.hasTag(tag));
    });
  }

  // Data Persistence

  /**
   * Load realm data from scene flags
   */
  async loadFromScene(): Promise<void> {
    if (this.sceneId === 'global') return; // Global manager doesn't persist
    
    const scene = game.scenes?.get(this.sceneId);
    if (!scene) return;
    
    const sceneData = scene.getFlag('realms-and-reaches', 'realms') as SceneRealmData;
    if (!sceneData) return;
    
    // Clear existing data
    this.spatialIndex.clear();
    
    // Load realms
    for (const [realmId, realmObj] of Object.entries(sceneData.realms)) {
      try {
        const realm = RealmData.fromObject(realmObj);
        this.spatialIndex.insert(realm);
      } catch (error) {
        console.warn(`Failed to load realm ${realmId}:`, error);
      }
    }
    
    this.dirty = false;
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('realmsLoaded', {
      detail: { sceneId: this.sceneId, count: Object.keys(sceneData.realms).length }
    }));
  }

  /**
   * Save realm data to scene flags
   */
  async saveToScene(): Promise<void> {
    if (this.sceneId === 'global') return; // Global manager doesn't persist
    if (!this.dirty) return; // No changes to save
    
    const scene = game.scenes?.get(this.sceneId);
    if (!scene) return;
    
    const realms = this.getAllRealms();
    const realmObjects: Record<string, any> = {};
    
    for (const realm of realms) {
      realmObjects[realm.id] = realm.toObject();
    }
    
    const sceneData: SceneRealmData = {
      version: '1.0.0',
      realms: realmObjects,
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        author: game.user?.name || 'Unknown'
      }
    };
    
    await scene.setFlag('realms-and-reaches', 'realms', sceneData);
    this.dirty = false;
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('realmsSaved', {
      detail: { sceneId: this.sceneId, count: realms.length }
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
      realms: realms.map(realm => realm.toObject()),
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
    
    if (options.replace) {
      this.spatialIndex.clear();
    }
    
    let importedCount = 0;
    
    for (const realmObj of data.realms) {
      try {
        // Check for ID conflicts
        if (!options.replace && this.getRealm(realmObj.id)) {
          if (!options.merge) {
            continue; // Skip conflicting IDs
          }
          // Generate new ID for merge
          realmObj.id = foundry.utils.randomID();
        }
        
        const realm = RealmData.fromObject(realmObj);
        this.spatialIndex.insert(realm);
        importedCount++;
      } catch (error) {
        console.warn(`Failed to import realm ${realmObj.id}:`, error);
      }
    }
    
    this.markDirty();
    
    // Auto-save if enabled
    if (this.shouldAutoSave()) {
      await this.saveToScene();
    }
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('realmsImported', {
      detail: { sceneId: this.sceneId, count: importedCount }
    }));
    
    return importedCount;
  }

  // Utility Methods

  /**
   * Mark data as dirty (needs saving)
   */
  private markDirty(): void {
    this.dirty = true;
  }

  /**
   * Check if auto-save is enabled
   */
  private shouldAutoSave(): boolean {
    return game.settings?.get('realms-and-reaches', 'autoSave') ?? true;
  }

  /**
   * Get statistics about realms in this scene
   */
  getStatistics(): any {
    const realms = this.getAllRealms();
    const tagCounts = new Map<string, number>();
    
    for (const realm of realms) {
      for (const tag of realm.getTags()) {
        const key = tag.split(':')[0];
        tagCounts.set(key, (tagCounts.get(key) || 0) + 1);
      }
    }
    
    return {
      totalRealms: realms.length,
      tagCounts: Object.fromEntries(tagCounts),
      sceneId: this.sceneId,
      dirty: this.dirty
    };
  }

  /**
   * Clear all realms from this manager
   */
  async clearAll(): Promise<void> {
    const count = this.getAllRealms().length;
    this.spatialIndex.clear();
    this.markDirty();
    
    // Auto-save if enabled
    if (this.shouldAutoSave()) {
      await this.saveToScene();
    }
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('realmsCleared', {
      detail: { sceneId: this.sceneId, count }
    }));
  }
}