/**
 * RealmData - Core data structure for storing realm information
 *
 * Manages realm geometry, tags, and metadata with efficient tag-based queries.
 */

export interface RealmGeometry {
  type: 'polygon' | 'rectangle' | 'circle';
  points?: number[]; // [x1, y1, x2, y2, ...] for polygons
  x?: number; // Center x for circles/rectangles
  y?: number; // Center y for circles/rectangles
  width?: number; // Width for rectangles
  height?: number; // Height for rectangles
  radius?: number; // Radius for circles
  rotation?: number; // Rotation in radians
}

export interface RealmMetadata {
  created: string; // ISO timestamp
  modified: string; // ISO timestamp
  author: string; // User ID or name
  version: string; // Data version for migration
}

export interface RealmDataOptions {
  id?: string;
  name?: string;
  geometry?: RealmGeometry;
  tags?: string[];
  metadata?: Partial<RealmMetadata>;
}

/**
 * RealmData class manages realm properties using a flexible tag system
 */
export class RealmData {
  public readonly id: string;
  public name: string;
  public geometry: RealmGeometry;
  private _tags: Set<string>;
  public metadata: RealmMetadata;

  constructor(options: RealmDataOptions = {}) {
    this.id = options.id || foundry.utils.randomID();
    this.name = options.name || `Realm ${this.id.substring(0, 8)}`;
    this.geometry = options.geometry || {
      type: 'polygon',
      points: []
    };
    this._tags = new Set(options.tags || []);

    const now = new Date().toISOString();
    this.metadata = {
      created: now,
      modified: now,
      author: game.user?.name || 'Unknown',
      version: '1.0.0',
      ...options.metadata
    };
  }

  // Tag Management Methods

  /**
   * Get all tags as an array
   */
  getTags(): string[] {
    return Array.from(this._tags).sort();
  }

  /**
   * Get the value for a specific tag key
   * @param key - The tag key (before the colon)
   * @returns The tag value or null if not found
   */
  getTag(key: string): string | null {
    const tagPrefix = `${key}:`;
    for (const tag of this._tags) {
      if (tag.startsWith(tagPrefix)) {
        return tag.substring(tagPrefix.length);
      }
    }
    return null;
  }

  /**
   * Get the value for a tag key, parsed as a number
   * @param key - The tag key
   * @returns The numeric value or null if not found/parseable
   */
  getTagNumber(key: string): number | null {
    const value = this.getTag(key);
    if (value === null) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  /**
   * Check if a specific tag exists
   * @param tag - The full tag (key:value) or just key
   */
  hasTag(tag: string): boolean {
    if (tag.includes(':')) {
      return this._tags.has(tag);
    } else {
      // Check if any tag starts with this key
      const tagPrefix = `${tag}:`;
      for (const existingTag of this._tags) {
        if (existingTag.startsWith(tagPrefix)) {
          return true;
        }
      }
      return false;
    }
  }

  /**
   * Add a tag to the realm
   * @param tag - The tag to add (key:value format)
   */
  addTag(tag: string): void {
    if (!this.isValidTag(tag)) {
      throw new Error(`Invalid tag format: "${tag}". Use "key:value" pattern.`);
    }

    // For single-value namespaces, remove existing tag with same key
    const [key] = tag.split(':', 2);
    const singleValueKeys = ['biome', 'climate', 'travel_speed', 'elevation'];

    if (singleValueKeys.includes(key)) {
      this.removeTagByKey(key);
    }

    this._tags.add(tag);
    this.touch();
  }

  /**
   * Add multiple tags at once
   * @param tags - Array of tags to add
   */
  addTags(tags: string[]): void {
    for (const tag of tags) {
      this.addTag(tag);
    }
  }

  /**
   * Remove a specific tag
   * @param tag - The full tag to remove (key:value)
   */
  removeTag(tag: string): boolean {
    const removed = this._tags.delete(tag);
    if (removed) {
      this.touch();
    }
    return removed;
  }

  /**
   * Remove all tags with a specific key
   * @param key - The tag key to remove
   */
  removeTagByKey(key: string): number {
    const tagPrefix = `${key}:`;
    const toRemove = Array.from(this._tags).filter(tag => tag.startsWith(tagPrefix));

    for (const tag of toRemove) {
      this._tags.delete(tag);
    }

    if (toRemove.length > 0) {
      this.touch();
    }

    return toRemove.length;
  }

  /**
   * Get all tags that start with a specific prefix
   * @param prefix - The prefix to search for
   */
  getTagsWithPrefix(prefix: string): string[] {
    const prefixWithColon = prefix.endsWith(':') ? prefix : `${prefix}:`;
    return Array.from(this._tags)
      .filter(tag => tag.startsWith(prefixWithColon))
      .sort();
  }

  /**
   * Clear all tags
   */
  clearTags(): void {
    if (this._tags.size > 0) {
      this._tags.clear();
      this.touch();
    }
  }

  // Geometry Methods

  /**
   * Check if a point is inside this realm's geometry
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns True if point is inside the realm
   */
  containsPoint(x: number, y: number): boolean {
    switch (this.geometry.type) {
      case 'polygon':
        return this.pointInPolygon(x, y, this.geometry.points || []);
      case 'rectangle':
        return this.pointInRectangle(x, y);
      case 'circle':
        return this.pointInCircle(x, y);
      default:
        return false;
    }
  }

  /**
   * Get the bounding box of this realm
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    switch (this.geometry.type) {
      case 'polygon': {
        const points = this.geometry.points || [];
        if (points.length < 6) return { x: 0, y: 0, width: 0, height: 0 };

        let minX = points[0],
          maxX = points[0];
        let minY = points[1],
          maxY = points[1];

        for (let i = 2; i < points.length; i += 2) {
          minX = Math.min(minX, points[i]);
          maxX = Math.max(maxX, points[i]);
          minY = Math.min(minY, points[i + 1]);
          maxY = Math.max(maxY, points[i + 1]);
        }

        return {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        };
      }
      case 'rectangle': {
        const { x = 0, y = 0, width = 0, height = 0 } = this.geometry;
        return { x: x - width / 2, y: y - height / 2, width, height };
      }
      case 'circle': {
        const { x = 0, y = 0, radius = 0 } = this.geometry;
        return {
          x: x - radius,
          y: y - radius,
          width: radius * 2,
          height: radius * 2
        };
      }
      default:
        return { x: 0, y: 0, width: 0, height: 0 };
    }
  }

  // Utility Methods

  /**
   * Update the modified timestamp
   */
  touch(): void {
    this.metadata.modified = new Date().toISOString();
  }

  /**
   * Validate tag format
   * @param tag - Tag to validate
   * @returns True if valid
   */
  private isValidTag(tag: string): boolean {
    // Must contain exactly one colon, not at start or end
    const colonIndex = tag.indexOf(':');
    if (colonIndex <= 0 || colonIndex >= tag.length - 1) {
      return false;
    }

    // No additional colons allowed
    if (tag.indexOf(':', colonIndex + 1) !== -1) {
      return false;
    }

    // Basic character validation
    const validPattern = /^[a-zA-Z0-9_-]+:[a-zA-Z0-9_.-]+$/;
    return validPattern.test(tag);
  }

  /**
   * Point-in-polygon test using ray casting algorithm
   */
  private pointInPolygon(x: number, y: number, points: number[]): boolean {
    if (points.length < 6) return false; // Need at least 3 points (6 coordinates)

    let inside = false;
    const numPoints = points.length / 2;

    for (let i = 0, j = numPoints - 1; i < numPoints; j = i++) {
      const xi = points[i * 2];
      const yi = points[i * 2 + 1];
      const xj = points[j * 2];
      const yj = points[j * 2 + 1];

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }

    return inside;
  }

  /**
   * Point-in-rectangle test
   */
  private pointInRectangle(x: number, y: number): boolean {
    const { x: cx = 0, y: cy = 0, width = 0, height = 0, rotation = 0 } = this.geometry;

    if (rotation === 0) {
      // Simple case - no rotation
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      return (
        x >= cx - halfWidth && x <= cx + halfWidth && y >= cy - halfHeight && y <= cy + halfHeight
      );
    } else {
      // Rotate the point back to axis-aligned space
      const cos = Math.cos(-rotation);
      const sin = Math.sin(-rotation);
      const dx = x - cx;
      const dy = y - cy;
      const rotatedX = dx * cos - dy * sin;
      const rotatedY = dx * sin + dy * cos;

      const halfWidth = width / 2;
      const halfHeight = height / 2;
      return (
        rotatedX >= -halfWidth &&
        rotatedX <= halfWidth &&
        rotatedY >= -halfHeight &&
        rotatedY <= halfHeight
      );
    }
  }

  /**
   * Point-in-circle test
   */
  private pointInCircle(x: number, y: number): boolean {
    const { x: cx = 0, y: cy = 0, radius = 0 } = this.geometry;
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= radius * radius;
  }

  // Serialization

  /**
   * Convert to plain object for storage
   */
  toObject(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      geometry: { ...this.geometry },
      tags: this.getTags(),
      metadata: { ...this.metadata }
    };
  }

  /**
   * Create from plain object
   */
  static fromObject(data: Record<string, any>): RealmData {
    return new RealmData({
      id: data.id,
      name: data.name,
      geometry: data.geometry,
      tags: data.tags,
      metadata: data.metadata
    });
  }

  /**
   * Create a copy of this realm
   */
  clone(): RealmData {
    return RealmData.fromObject(this.toObject());
  }
}
