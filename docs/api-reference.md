# API Reference

> **Developer Documentation for Realms & Reaches**

This document provides comprehensive API documentation for module developers who want to integrate with Realms & Reaches.

## Table of Contents

- [Getting Started](#getting-started)
- [Core Classes](#core-classes)
- [Public API](#public-api)
- [Tag System](#tag-system)
- [Spatial Queries](#spatial-queries)
- [Data Formats](#data-formats)
- [Events](#events)
- [Examples](#examples)

## Getting Started

### Checking Availability

Always check if Realms & Reaches is available before using the API:

```javascript
// Check if module is installed and active
const realmsModule = game.modules.get('realms-and-reaches');
if (!realmsModule?.active) {
  console.warn('Realms & Reaches not available');
  return;
}

// Access the public API
const realmsAPI = realmsModule.api;
```

### Basic Usage Pattern

```javascript
// Get realm at specific coordinates
const realm = realmsAPI.getRealmAt(x, y);

if (realm) {
  // Use realm data for your mechanics
  const biome = realm.getTag('biome');
  const speedMod = parseFloat(realm.getTag('travel_speed')) || 1.0;
  
  // Apply to your module
  applyTerrainEffects(biome, speedMod);
}
```

## Core Classes

### RealmData

Represents a single realm with geometry and tags.

#### Constructor

```typescript
new RealmData(options: Partial<RealmDataOptions>)
```

**Options:**
- `id?: string` - Unique identifier (auto-generated if not provided)
- `name: string` - Display name for the realm
- `geometry: GeometryData` - Shape definition (polygon, rectangle, or circle)
- `tags?: string[]` - Array of tags in "key:value" format

#### Properties

- `id: string` - Unique identifier
- `name: string` - Realm name
- `geometry: GeometryData` - Shape definition
- `metadata: RealmMetadata` - Created/modified timestamps and author

#### Tag Methods

```typescript
// Add a tag (validates format)
addTag(tag: string): void

// Remove a specific tag
removeTag(tag: string): boolean

// Check if realm has a tag
hasTag(tag: string): boolean

// Get tag value by key
getTag(key: string): string | null

// Get tag value as number
getTagNumber(key: string): number | null

// Get all tags
getAllTags(): string[]

// Remove all tags with a specific key
removeTagByKey(key: string): number
```

#### Spatial Methods

```typescript
// Test if point is inside realm
containsPoint(x: number, y: number): boolean

// Get bounding box
getBounds(): { x: number; y: number; width: number; height: number }
```

### RealmManager

Singleton class for managing realm data in a scene.

#### Getting Instance

```typescript
// Get manager for current scene
const manager = RealmManager.getInstance();

// Get manager for specific scene
const manager = RealmManager.getInstance(sceneId);

// Get global manager (cross-scene operations)  
const globalManager = RealmManager.getGlobalInstance();
```

#### CRUD Operations

```typescript
// Create a new realm
const realm = await manager.createRealm({
  name: 'Dark Forest',
  geometry: { type: 'polygon', points: [0,0, 100,0, 100,100, 0,100] },
  tags: ['biome:forest', 'terrain:dense']
});

// Update an existing realm
await manager.updateRealm(realm);

// Delete a realm
const success = await manager.deleteRealm(realmId);

// Get realm by ID
const realm = manager.getRealm(realmId);
```

#### Spatial Queries

```typescript
// Get first realm at coordinates
const realm = manager.getRealmAt(x, y);

// Get all realms at coordinates
const realms = manager.getRealmsAt(x, y);

// Get all realms in scene
const allRealms = manager.getAllRealms();

// Find realms by tag
const forests = manager.queryRealms({ tags: ['biome:forest'] });

// Find realms in area
const nearbyRealms = manager.queryRealms({
  bounds: { x: 100, y: 100, width: 200, height: 200 }
});
```

#### Data Management

```typescript
// Export scene data
const exportData = manager.exportScene();

// Import scene data
await manager.importScene(importData);

// Save to scene flags
await manager.saveToScene();

// Load from scene flags
await manager.loadFromScene();
```

### TagSystem

Handles tag validation, suggestions, and namespace management.

#### Validation

```typescript
const tagSystem = TagSystem.getInstance();

// Validate tag format
const result = tagSystem.validateTag('biome:forest');
if (result.valid) {
  // Tag is valid
} else {
  console.error(result.error);
}

// Static validation (returns boolean)
const isValid = TagSystem.validateTag('biome:forest');
```

#### Suggestions

The TagSystem provides intelligent tag suggestions with multiple search strategies:

```typescript
// Get suggestions for partial input (prefix matching)
const suggestions = tagSystem.getSuggestions('bio', existingTags);

// Get namespace suggestions
const biomeValues = TagSystem.getSuggestions('biome');
// Returns: ['forest', 'desert', 'mountain', 'swamp', ...]
```

#### Value-Based Search (v1.1+)

The module now supports searching tags by their values:

```typescript
// Search by value - finds tags containing the value
// This is built into the UI autocomplete automatically
// Type "swamp" → suggests "biome:swamp"
// Type "village" → suggests "settlement:village"
// Type "magical" → suggests "custom:magical"

// For custom implementations, check the updateRealmTagSuggestions
// function in module.ts for the search algorithm
```

**Search Features**:
- **Case-insensitive matching**: "SWAMP" finds "biome:swamp"
- **Partial value matching**: "swa" finds "biome:swamp"
- **Duplicate filtering**: Already applied tags are excluded
- **Combined results**: Shows both prefix and value matches

## Public API

The public API is available at `game.modules.get('realms-and-reaches').api`:

### Spatial Query Functions

```typescript
// Get realm at coordinates
getRealmAt(x: number, y: number): RealmData | null

// Get all realms in scene
getAllRealms(): RealmData[]

// Get realms by tag
getRealmsByTag(tag: string): RealmData[]

// Get realms by tag key
getRealmsByTagKey(key: string): RealmData[]
```

### CRUD Functions

```typescript
// Create realm
createRealm(realmData: Partial<RealmData>): Promise<RealmData>

// Update realm
updateRealm(realmId: string, updates: Partial<RealmData>): Promise<RealmData | null>

// Delete realm
deleteRealm(realmId: string): Promise<boolean>
```

### Tag Functions

```typescript
// Get tag suggestions
getTagSuggestions(namespace: string): string[]

// Validate tag
validateTag(tag: string): boolean
```

### Data Functions

```typescript
// Export scene data
exportScene(): any

// Import scene data
importScene(data: any): Promise<void>

// Get manager instance
getManager(): RealmManager
```

## Tag System

### Core Namespaces

The tag system defines 9 core namespaces:

| Namespace | Description | Examples | Values |
|-----------|-------------|----------|---------|
| `biome` | Primary ecosystem | `biome:forest` | forest, desert, mountain, swamp, grassland, tundra, jungle, coast |
| `terrain` | Movement difficulty | `terrain:dense` | dense, sparse, rocky, marshy, rugged, smooth, steep, flat |
| `climate` | Weather patterns | `climate:temperate` | temperate, arctic, tropical, arid, humid, seasonal |
| `travel_speed` | Speed modifier | `travel_speed:0.75` | 0.1-2.0 (decimal values) |
| `resources` | Available materials | `resources:timber` | timber, game, minerals, water, herbs, food |
| `elevation` | Altitude category | `elevation:highland` | lowland, highland, mountain, valley, plateau, peak |
| `settlement` | Human habitation | `settlement:village` | village, town, city, outpost, ruins, nomad |
| `custom` | User-defined | `custom:haunted` | Any custom values |
| `module` | Module-specific | `module:jj:encounter_chance:0.3` | Module-defined format |

### Tag Format Rules

- **Pattern**: `key:value` (exactly one colon)
- **Characters**: Alphanumeric, underscore, hyphen, period
- **Case**: Lowercase recommended for consistency
- **Module tags**: Can contain multiple colons (`module:name:property:value`)

### Validation Examples

```javascript
// Valid tags
TagSystem.validateTag('biome:forest');        // ✓
TagSystem.validateTag('travel_speed:0.75');   // ✓
TagSystem.validateTag('custom:haunted');      // ✓
TagSystem.validateTag('module:jj:encounter_chance:0.3'); // ✓

// Invalid tags
TagSystem.validateTag('forest');              // ✗ Missing colon
TagSystem.validateTag('biome:');              // ✗ Missing value
TagSystem.validateTag(':forest');             // ✗ Missing key
TagSystem.validateTag('biome forest');        // ✗ Space not allowed
TagSystem.validateTag('biome:old:growth');    // ✗ Multiple colons (unless module tag)
```

## Spatial Queries

### Point-in-Polygon Testing

The module uses efficient ray-casting algorithms for spatial queries:

```javascript
// Test if coordinates are in any realm
const realm = realmsAPI.getRealmAt(x, y);

// Performance: < 1ms for typical scenes
// Accuracy: Handles complex polygons, holes, and overlaps
```

### Geometry Types

#### Polygon
```javascript
{
  type: 'polygon',
  points: [x1, y1, x2, y2, x3, y3, ...] // Flat array of coordinates
}
```

#### Rectangle  
```javascript
{
  type: 'rectangle',
  x: 150,      // Center X
  y: 150,      // Center Y
  width: 100,  // Total width
  height: 100, // Total height
  rotation: 0  // Rotation in degrees (optional)
}
```

#### Circle
```javascript
{
  type: 'circle',
  x: 100,      // Center X
  y: 100,      // Center Y
  radius: 50   // Radius in pixels
}
```

### Query Options

```typescript
interface RealmQueryOptions {
  sceneId?: string;           // Specific scene (default: current)
  tags?: string[];            // Must have all specified tags
  bounds?: BoundingBox;       // Must intersect bounds
  limit?: number;             // Maximum results
}

// Usage
const mountainForests = manager.queryRealms({
  tags: ['biome:forest', 'elevation:highland'],
  limit: 10
});
```

## Data Formats

### Export Format

```javascript
{
  "format": "realms-and-reaches-v1",
  "metadata": {
    "author": "rayners",
    "created": "2025-05-28T12:00:00Z",
    "version": "1.0.0",
    "description": "Misty Vale realm data"
  },
  "scenes": {
    "scene-id": {
      "realms": [
        {
          "id": "realm-001",
          "name": "Ancient Forest",
          "geometry": {
            "type": "polygon",
            "points": [0, 0, 100, 0, 100, 100, 0, 100]
          },
          "tags": ["biome:forest", "terrain:dense", "travel_speed:0.75"],
          "metadata": {
            "created": "2025-05-28T12:00:00Z",
            "modified": "2025-05-28T12:00:00Z",
            "author": "rayners",
            "version": "1.0.0"
          }
        }
      ],
      "bounds": { "width": 4000, "height": 4000 }
    }
  }
}
```

### Scene Flags Storage

Realm data is stored in scene flags:

```javascript
scene.flags['realms-and-reaches'] = {
  version: "1.0.0",
  realms: {
    "realm-001": { /* RealmData */ },
    "realm-002": { /* RealmData */ }
  },
  metadata: {
    created: "2025-05-28T12:00:00Z",
    modified: "2025-05-28T12:00:00Z",
    author: "rayners"
  }
}
```

## Events

### RealmManager Events

The RealmManager dispatches custom events for data changes:

```javascript
const manager = RealmManager.getInstance();

// Listen for realm creation
manager.addEventListener('realmCreated', (event) => {
  const { realm, sceneId } = event.detail;
  console.log(`Realm created: ${realm.name}`);
});

// Listen for realm updates
manager.addEventListener('realmUpdated', (event) => {
  const { realm, sceneId } = event.detail;
  console.log(`Realm updated: ${realm.name}`);
});

// Listen for realm deletion
manager.addEventListener('realmDeleted', (event) => {
  const { realmId, sceneId } = event.detail;
  console.log(`Realm deleted: ${realmId}`);
});

// Listen for data loading
manager.addEventListener('realmsLoaded', (event) => {
  const { sceneId } = event.detail;
  console.log(`Realms loaded for scene: ${sceneId}`);
});
```

### Canvas Layer Events

```javascript
// Listen for layer state changes
Hooks.on('realmLayer.stateChanged', (data) => {
  const { active, tool, state, selectedRealm } = data;
  if (active && selectedRealm) {
    console.log(`Selected realm: ${selectedRealm.name}`);
  }
});
```

## Examples

### Travel Mechanics Integration

```javascript
// Example: Modify travel speed based on terrain
Hooks.on('updateActor', (actor, changes, options, userId) => {
  if (!actor.type === 'party') return;
  
  const realmsAPI = game.modules.get('realms-and-reaches')?.api;
  if (!realmsAPI) return;
  
  // Get realm at party location
  const realm = realmsAPI.getRealmAt(actor.x, actor.y);
  if (!realm) return;
  
  // Apply terrain effects
  const speedMod = parseFloat(realm.getTag('travel_speed')) || 1.0;
  const biome = realm.getTag('biome');
  
  // Modify travel calculations
  const baseSpeed = actor.system.travel.speed;
  const modifiedSpeed = baseSpeed * speedMod;
  
  console.log(`Travel through ${biome}: ${modifiedSpeed} km/day`);
});
```

### Encounter Table Selection

```javascript
// Example: Select encounter tables by biome
function getEncounterTable(x, y) {
  const realmsAPI = game.modules.get('realms-and-reaches')?.api;
  if (!realmsAPI) return 'default-encounters';
  
  const realm = realmsAPI.getRealmAt(x, y);
  if (!realm) return 'default-encounters';
  
  const biome = realm.getTag('biome');
  const terrain = realm.getTag('terrain');
  
  // Build table name from tags
  let tableName = `encounters-${biome}`;
  if (terrain) {
    tableName += `-${terrain}`;
  }
  
  // Check if table exists, fall back to biome or default
  return game.tables.getName(tableName) || 
         game.tables.getName(`encounters-${biome}`) ||
         game.tables.getName('default-encounters');
}
```

### Weather Effects

```javascript
// Example: Apply weather effects based on climate
function applyWeatherEffects(tokenDocument) {
  const realmsAPI = game.modules.get('realms-and-reaches')?.api;
  if (!realmsAPI) return;
  
  const realm = realmsAPI.getRealmAt(tokenDocument.x, tokenDocument.y);
  if (!realm) return;
  
  const climate = realm.getTag('climate');
  const elevation = realm.getTag('elevation');
  
  // Define weather effects
  const weatherEffects = {
    'arctic': { cold: true, wind: true, visibility: 'poor' },
    'tropical': { heat: true, humidity: true, rain: true },
    'arid': { heat: true, sandstorm: true, dehydration: true },
    'temperate': { seasonal: true, moderate: true }
  };
  
  const elevationEffects = {
    'mountain': { cold: true, wind: true, thin_air: true },
    'highland': { cool: true, wind: true },
    'lowland': { moderate: true }
  };
  
  // Combine effects
  const effects = {
    ...weatherEffects[climate],
    ...elevationEffects[elevation]
  };
  
  // Apply to token
  applyEnvironmentalEffects(tokenDocument, effects);
}
```

### Resource Gathering

```javascript
// Example: Check for available resources
function checkAvailableResources(x, y) {
  const realmsAPI = game.modules.get('realms-and-reaches')?.api;
  if (!realmsAPI) return [];
  
  const realm = realmsAPI.getRealmAt(x, y);
  if (!realm) return [];
  
  // Get all resource tags
  const resourceTags = realm.getAllTags()
    .filter(tag => tag.startsWith('resources:'))
    .map(tag => tag.split(':')[1]);
  
  // Map to gathering opportunities
  const resourceMap = {
    'timber': { skill: 'Nature', dc: 15, time: '1 hour' },
    'game': { skill: 'Survival', dc: 12, time: '4 hours' },
    'minerals': { skill: 'Investigation', dc: 18, time: '2 hours' },
    'herbs': { skill: 'Medicine', dc: 14, time: '30 minutes' }
  };
  
  return resourceTags
    .filter(resource => resourceMap[resource])
    .map(resource => ({
      type: resource,
      ...resourceMap[resource]
    }));
}
```

### Module Settings Integration

```javascript
// Example: Register module settings for realm integration
Hooks.once('init', () => {
  game.settings.register('my-module', 'useRealmData', {
    name: 'Use Realm Data',
    hint: 'Apply terrain effects from Realms & Reaches',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });
  
  game.settings.register('my-module', 'terrainSpeedMod', {
    name: 'Terrain Speed Modifier',
    hint: 'Multiplier for terrain-based speed modifications',
    scope: 'world',
    config: true,
    type: Number,
    range: { min: 0.1, max: 2.0, step: 0.1 },
    default: 1.0
  });
});

// Use in your module
function getTerrainSpeedModifier(x, y) {
  if (!game.settings.get('my-module', 'useRealmData')) {
    return 1.0;
  }
  
  const realmsAPI = game.modules.get('realms-and-reaches')?.api;
  const realm = realmsAPI?.getRealmAt(x, y);
  
  if (!realm) return 1.0;
  
  const realmSpeed = parseFloat(realm.getTag('travel_speed')) || 1.0;
  const settingMod = game.settings.get('my-module', 'terrainSpeedMod');
  
  return realmSpeed * settingMod;
}
```

## Error Handling

Always handle potential errors when working with the API:

```javascript
try {
  const realmsAPI = game.modules.get('realms-and-reaches')?.api;
  if (!realmsAPI) {
    throw new Error('Realms & Reaches not available');
  }
  
  const realm = realmsAPI.getRealmAt(x, y);
  if (!realm) {
    console.log('No realm found at coordinates');
    return;
  }
  
  // Use realm data
  processRealmData(realm);
  
} catch (error) {
  console.error('Failed to query realm data:', error);
  // Fall back to default behavior
  useDefaultBehavior();
}
```

## Performance Considerations

### Spatial Queries
- Point-in-polygon testing is optimized for < 1ms response time
- Avoid querying on every token movement; cache results when possible
- Use bounds checking for bulk operations

### Memory Usage
- RealmManager instances are singletons per scene
- Large polygon datasets use efficient storage
- Consider clearing unused managers in long-running sessions

### Best Practices
```javascript
// Good: Cache realm lookups
const realmCache = new Map();
function getCachedRealm(x, y) {
  const key = `${Math.floor(x/100)},${Math.floor(y/100)}`;
  if (realmCache.has(key)) {
    return realmCache.get(key);
  }
  
  const realm = realmsAPI.getRealmAt(x, y);
  realmCache.set(key, realm);
  return realm;
}

// Good: Batch operations
const realms = positions.map(pos => realmsAPI.getRealmAt(pos.x, pos.y));

// Bad: Query in tight loops
for (let i = 0; i < 1000; i++) {
  const realm = realmsAPI.getRealmAt(tokens[i].x, tokens[i].y); // Too frequent
}
```

---

For more examples and advanced usage, see the [User Guide](../README.md) and [Contributing Guidelines](../CONTRIBUTING.md).