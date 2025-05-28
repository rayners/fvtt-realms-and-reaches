/**
 * Module API - Public interface for other modules
 * Now uses Region documents instead of custom RealmData objects
 */

import { RealmManager } from './realm-manager';
import { TagSystem } from './tag-system';

// Type for realm regions
type RealmRegion = RegionDocument & {
  flags: {
    'realms-and-reaches'?: {
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

// Helper functions
class RealmHelpers {
  static getTags(region: RealmRegion): string[] {
    return region.flags['realms-and-reaches']?.tags || [];
  }

  static hasTag(region: RealmRegion, tag: string): boolean {
    return this.getTags(region).includes(tag);
  }

  static getTag(region: RealmRegion, key: string): string | null {
    const tags = this.getTags(region);
    const tag = tags.find(t => t.startsWith(key + ':'));
    return tag ? tag.split(':', 2)[1] : null;
  }
}

/**
 * Get realm data at specific coordinates
 */
export function getRealmAt(x: number, y: number): RealmRegion | null {
  return RealmManager.getInstance().getRealmAt(x, y);
}

/**
 * Get all realms in current scene
 */
export function getAllRealms(): RealmRegion[] {
  return RealmManager.getInstance().getAllRealms();
}

/**
 * Get realms by tag
 */
export function getRealmsByTag(tag: string): RealmRegion[] {
  return RealmManager.getInstance()
    .getAllRealms()
    .filter(realm => RealmHelpers.hasTag(realm, tag));
}

/**
 * Get realms by tag key (e.g., 'biome' returns all realms with biome tags)
 */
export function getRealmsByTagKey(key: string): RealmRegion[] {
  return RealmManager.getInstance()
    .getAllRealms()
    .filter(realm => RealmHelpers.getTag(realm, key) !== null);
}

/**
 * Get available tag suggestions for a namespace
 */
export function getTagSuggestions(namespace: string, excludeTags: string[] = []): string[] {
  return TagSystem.getInstance()
    .getSuggestions(namespace, excludeTags)
    .map(s => s.tag);
}

/**
 * Validate a tag
 */
export function validateTag(tag: string): boolean {
  return TagSystem.getInstance().validateTag(tag).valid;
}

/**
 * Create a new realm
 */
export async function createRealm(realmData: {
  name?: string;
  shapes?: any[];
  tags?: string[];
  color?: string;
}): Promise<RealmRegion> {
  return RealmManager.getInstance().createRealm(realmData);
}

/**
 * Update an existing realm
 */
export async function updateRealm(
  realmId: string,
  updates: {
    name?: string;
    shapes?: any[];
    tags?: string[];
    color?: string;
  }
): Promise<RealmRegion | null> {
  const manager = RealmManager.getInstance();
  const realm = manager.getRealm(realmId);
  if (!realm) return null;

  await manager.updateRealm(realm, updates);
  return realm;
}

/**
 * Delete a realm
 */
export async function deleteRealm(realmId: string): Promise<boolean> {
  return RealmManager.getInstance().deleteRealm(realmId);
}

/**
 * Export current scene's realm data
 */
export function exportScene(): any {
  return RealmManager.getInstance().exportScene();
}

/**
 * Import realm data to current scene
 */
export async function importScene(data: any): Promise<void> {
  return RealmManager.getInstance().importScene(data);
}

/**
 * Get the RealmManager instance
 */
export function getManager(): RealmManager {
  return RealmManager.getInstance();
}
