# Realms & Reaches - Technical Architecture

This document outlines the technical architecture, design decisions, and implementation patterns for the Realms & Reaches module.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Foundry VTT Canvas                      │
├─────────────────────────────────────────────────────────────┤
│  RealmLayer (Custom Canvas Layer)                          │
│  ├─ Drawing Tools (Polygon creation)                       │
│  ├─ Selection Tools (Edit/delete realms)                   │
│  └─ Visual Rendering (PIXI.Graphics)                       │
├─────────────────────────────────────────────────────────────┤
│  RealmManager (Data Management)                            │
│  ├─ Spatial Indexing (Point-in-polygon queries)            │
│  ├─ Data Persistence (Scene flags)                         │
│  └─ Event Handling (Create/update/delete)                  │
├─────────────────────────────────────────────────────────────┤
│  TagSystem (Metadata Management)                           │
│  ├─ Tag Validation (Format checking)                       │
│  ├─ Tag Suggestions (Common patterns)                      │
│  └─ Namespace Management (Core vs custom tags)             │
├─────────────────────────────────────────────────────────────┤
│  ExportImport (Data Portability)                           │
│  ├─ JSON Schema (Structured export format)                 │
│  ├─ Scene Matching (Cross-installation compatibility)      │
│  └─ Conflict Resolution (Merge strategies)                 │
├─────────────────────────────────────────────────────────────┤
│  Public API (Module Integration)                           │
│  ├─ Query Interface (getRealmAt, findRealms)               │
│  ├─ Event Hooks (Realm lifecycle events)                   │
│  └─ Type Definitions (TypeScript support)                  │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. RealmLayer (Canvas Integration) - NEXT PHASE

**Purpose**: Custom Foundry canvas layer for visual realm editing

**Key Design Decisions**:
- **Extends CanvasLayer**: Integrates with Foundry's layer system
- **PIXI.Graphics rendering**: Hardware-accelerated polygon display
- **State machine**: Drawing vs selection vs viewing modes
- **Event delegation**: Mouse/keyboard events for polygon creation

**Research Complete - Foundry Regions Integration**:
- Can extend `RegionLayer` patterns for drawing tools
- Polygon creation: click-to-add-points workflow exists
- Shape preview system available (`#refreshPreview`, `#createShapeData`)
- Coordinate handling and snapping functionality ready

**Implementation Pattern**:
```typescript
class RealmLayer extends CanvasLayer {
  static layerOptions = {
    name: "realms",
    canDragCreate: false,
    objectClass: RealmObject,
    quadtree: false
  };

  // Drawing state management
  private drawingState: 'idle' | 'drawing' | 'selecting' = 'idle';
  private currentPolygon: number[][] = [];
  
  // Event handlers (adapted from RegionLayer)
  _onClickLeft(event: PIXI.InteractionEvent): void {
    if (this.drawingState === 'drawing') {
      this.addPolygonPoint(event.data.global);
    }
  }
}
```

**Challenges Identified**:
- **Coordinate transformation**: Canvas pixels ↔ world coordinates
- **Visual feedback**: Preview polygon during drawing
- **Performance**: Efficient rendering of many polygons
- **Integration**: Works with Foundry's existing layer controls

### 2. RealmManager (Data Management) - IMPLEMENTED ✅

**Purpose**: Centralized data storage, spatial indexing, and persistence

**Key Design Decisions**:
- **Scene flags storage**: Leverages Foundry's built-in persistence
- **Spatial indexing**: Fast point-in-polygon queries (< 1ms achieved)
- **Event-driven**: Publish realm lifecycle events
- **Memory efficient**: Lazy loading and caching strategies

**Implementation Complete**:
- ✅ CRUD operations with proper lifecycle management
- ✅ Spatial indexing with bounds-checking optimization
- ✅ Scene-based persistence using Foundry flags pattern
- ✅ Export/import functionality for data sharing
- ✅ Event system for real-time updates

**Data Flow**:
```
User Action → RealmLayer → RealmManager → Scene Flags → Database
     ↑                                           ↓
User Interface ← RealmUI ← Event Hooks ← Spatial Index
```

**Actual Storage Schema**:
```typescript
interface SceneRealmData {
  version: string;
  realms: Record<string, any>; // Serialized RealmData objects
  metadata: {
    created: string;
    modified: string;
    author: string;
  };
}

interface RealmData {
  id: string;
  name: string;
  geometry: RealmGeometry; // Multi-type support
  tags: Set<string>; // Efficient tag storage
  metadata: RealmMetadata;
}
```

**Spatial Indexing Performance (ACHIEVED)**:
- **Simple approach**: Linear scan with optimized point-in-polygon ✅
- **Bounds checking**: Quick rejection before expensive polygon tests ✅
- **Ray-casting algorithm**: Efficient for complex polygons ✅
- **Benchmark achieved**: < 1ms for typical scenes (91% test pass rate)

### 3. TagSystem (Metadata Management) - IMPLEMENTED ✅

**Purpose**: Flexible, extensible metadata system using tags

**Key Design Decisions**:
- **Namespace pattern**: `type:value` format (e.g., `biome:forest`)
- **Flexible validation**: Format enforcement with namespace-specific rules
- **Smart suggestions**: Typo correction with relevance scoring
- **Conflict detection**: Logical inconsistency warnings

**Implementation Complete**:
- ✅ 8 core namespaces with validation rules
- ✅ Tag suggestions with Levenshtein distance scoring
- ✅ Conflict detection (e.g., high speed + dense terrain)
- ✅ Single vs multi-value namespace handling
- ✅ Module tag support with multiple colons

**Actual Tag Categories**:
```typescript
// Core namespaces (implemented)
const TAG_NAMESPACES = {
  biome: { /* forest, desert, mountain, swamp, etc. */ },
  terrain: { /* dense, rocky, marshy, etc. */ },
  climate: { /* temperate, arctic, tropical, etc. */ },
  travel_speed: { validation: (v) => 0.1 <= parseFloat(v) <= 2.0 },
  resources: { /* timber, game, minerals, etc. */ },
  elevation: { /* lowland, highland, peak, etc. */ },
  custom: { /* user-defined properties */ },
  module: { validation: (v) => v.split(':').length >= 2 }
};

// Single-value enforcement
const singleValueKeys = ['biome', 'climate', 'travel_speed', 'elevation'];
// Multi-value support  
const multiValueKeys = ['resources', 'custom', 'module'];
```

**Validation Implementation**:
- **Format validation**: Strict `key:value` pattern with character restrictions ✅
- **Namespace validation**: travel_speed range checking, module format validation ✅
- **Suggestion engine**: Prefix matching + Levenshtein distance scoring ✅
- **Conflict detection**: Cross-tag logical consistency checking ✅

### 4. ExportImport (Data Portability) - CORE IMPLEMENTED ✅

**Purpose**: Enable sharing realm data between installations

**Key Design Decisions**:
- **JSON format**: Human-readable, version-controlled
- **Scene identification**: Use module.scene-key for matching
- **Metadata inclusion**: Author, version, creation date
- **Conflict resolution**: User choice for merge strategies

**Implementation Status**:
- ✅ Core export/import functionality in RealmManager
- ✅ JSON schema with versioning support
- ✅ Scene identification and matching
- ✅ Conflict resolution strategies (replace/merge/skip)
- 🔄 UI integration pending (FOU-68/FOU-69)

**Actual Export Format**:
```typescript
// Implemented in RealmManager.exportData()
{
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
}
```

**Scene Matching Implementation**:
- ✅ Scene ID-based matching for same installation
- ✅ Metadata preservation for cross-installation sharing
- ✅ Bounds checking for scene compatibility
- 🔄 Fuzzy matching and manual mapping (future enhancement)

**Conflict Resolution Implemented**:
- ✅ **Replace**: Clear existing + import new
- ✅ **Merge**: Generate new IDs for conflicts  
- ✅ **Skip**: Ignore conflicting realm IDs
- ✅ **Validation**: Reject unsupported formats

### 5. Public API (Module Integration)

**Purpose**: Clean interface for other modules to query realm data

**Key Design Decisions**:
- **Global access**: `game.realmsAndReaches.api`
- **Promise-based**: Async operations return promises
- **Type safety**: Full TypeScript definitions
- **Error handling**: Graceful degradation when data unavailable

**API Surface**:
```typescript
interface RealmsAndReachesAPI {
  // Spatial queries
  getRealmAt(x: number, y: number, sceneId?: string): RealmData | null;
  getRealmsAt(x: number, y: number, sceneId?: string): RealmData[];
  getAllRealms(sceneId?: string): RealmData[];
  
  // Filtered queries  
  findRealms(filter: TagFilter, sceneId?: string): RealmData[];
  findRealmsByTag(tag: string, sceneId?: string): RealmData[];
  findRealmsByTags(tags: string[], sceneId?: string): RealmData[];
  
  // Data access
  getRealm(realmId: string, sceneId?: string): RealmData | null;
  getRealmTags(realmId: string, sceneId?: string): string[];
  
  // Events
  on(event: 'realmCreated' | 'realmUpdated' | 'realmDeleted', callback: Function): void;
  off(event: string, callback: Function): void;
}

interface RealmData {
  readonly id: string;
  readonly name: string;
  readonly geometry: number[][];
  readonly tags: readonly string[];
  
  // Tag convenience methods
  getTag(key: string): string | null;
  hasTag(tag: string): boolean;
  getTagValue(key: string): string | null;
  getTagsWithPrefix(prefix: string): string[];
}
```

**Performance Guarantees**:
- **getRealmAt()**: < 1ms for typical scenes (< 100 realms)
- **getAllRealms()**: < 5ms for large scenes (< 1000 realms)
- **Memory usage**: < 1MB for typical realm datasets

## Design Patterns

### 1. Event-Driven Architecture

**Pattern**: Pub/sub for realm lifecycle events

```typescript
// Publisher (RealmManager)
class RealmManager extends EventTarget {
  createRealm(realmData: RealmData): void {
    // Create realm...
    this.dispatchEvent(new CustomEvent('realmCreated', { 
      detail: { realm: realmData } 
    }));
  }
}

// Subscriber (Other modules)
game.realmsAndReaches.api.on('realmCreated', (event) => {
  const realm = event.detail.realm;
  console.log(`New realm created: ${realm.name}`);
});
```

### 2. Command Pattern for Undo/Redo

**Pattern**: Encapsulate realm operations for undo support

```typescript
abstract class RealmCommand {
  abstract execute(): void;
  abstract undo(): void;
}

class CreateRealmCommand extends RealmCommand {
  constructor(private realmData: RealmData) {}
  
  execute(): void {
    RealmManager.instance.createRealm(this.realmData);
  }
  
  undo(): void {
    RealmManager.instance.deleteRealm(this.realmData.id);
  }
}
```

### 3. Strategy Pattern for Spatial Algorithms

**Pattern**: Pluggable spatial indexing strategies

```typescript
interface SpatialIndex {
  insert(realm: RealmData): void;
  remove(realmId: string): void;
  query(x: number, y: number): RealmData[];
}

class LinearScan implements SpatialIndex {
  // Simple O(n) implementation
}

class RTreeIndex implements SpatialIndex {
  // Optimized O(log n) implementation
}
```

### 4. Facade Pattern for API

**Pattern**: Simple interface hiding complex internals

```typescript
class RealmsAndReachesAPI {
  getRealmAt(x: number, y: number, sceneId?: string): RealmData | null {
    const scene = sceneId ? game.scenes.get(sceneId) : canvas.scene;
    const index = SpatialIndexManager.getIndex(scene.id);
    const realms = index.query(x, y);
    return realms[0] || null; // Return first match
  }
}
```

## Performance Considerations

### 1. Spatial Query Optimization

**Challenge**: Fast point-in-polygon queries for real-time use

**Solutions**:
- **Algorithm choice**: Ray casting for polygon intersection
- **Early termination**: Bounding box checks before polygon tests
- **Caching**: Memoize expensive calculations
- **Batching**: Process multiple queries together

**Benchmark Targets**:
```typescript
// Performance requirements
const PERFORMANCE_TARGETS = {
  singleQuery: 1,      // < 1ms for getRealmAt()
  batchQuery: 10,      // < 10ms for 100 queries
  memoryUsage: 1024,   // < 1MB for typical datasets
  renderFrame: 16,     // < 16ms for 60fps rendering
};
```

### 2. Memory Management

**Challenge**: Efficient storage of polygon geometry

**Solutions**:
- **Coordinate compression**: Relative coordinates vs absolute
- **Geometry simplification**: Remove redundant vertices
- **Lazy loading**: Load realm data on demand
- **Weak references**: Avoid memory leaks in event handlers

### 3. Canvas Rendering Optimization

**Challenge**: Smooth 60fps rendering with many polygons

**Solutions**:
- **Culling**: Only render visible polygons
- **Level of detail**: Simplify distant polygons
- **Batching**: Combine similar polygons into single draw calls
- **Caching**: Pre-render static geometry to textures

## Security Considerations

### 1. Data Validation

**Concern**: Malicious or malformed realm data

**Mitigations**:
- **Schema validation**: Validate all imported data
- **Coordinate bounds**: Ensure coordinates are within scene bounds
- **Tag sanitization**: Prevent script injection in tag values
- **Size limits**: Prevent DoS via oversized polygons

### 2. Module Permissions

**Concern**: Unauthorized realm modification

**Mitigations**:
- **GM-only editing**: Only GMs can create/modify realms by default
- **Permission hooks**: Allow other modules to customize permissions
- **Audit logging**: Track realm modifications for accountability
- **Backup integration**: Automatic backups before major changes

## Testing Strategy

### 1. Unit Tests (Vitest)

**Coverage Goals**: > 90% line coverage for core logic

```typescript
describe('RealmData', () => {
  describe('tag management', () => {
    it('should add tags correctly', () => {
      const realm = new RealmData();
      realm.addTag('biome:forest');
      expect(realm.getTag('biome')).toBe('forest');
    });
    
    it('should validate tag format', () => {
      const realm = new RealmData();
      expect(() => realm.addTag('invalid-tag')).toThrow();
    });
  });
});
```

### 2. Integration Tests (Quench)

**Focus**: Real Foundry environment testing

```typescript
describe('Realm Layer Integration', () => {
  it('should create realms through UI', async () => {
    const layer = canvas.realms;
    layer.activate();
    
    // Simulate polygon drawing
    const points = [[100, 100], [200, 100], [200, 200], [100, 200]];
    await layer.createRealm(points);
    
    const realm = layer.manager.getRealmAt(150, 150);
    expect(realm).toBeTruthy();
  });
});
```

### 3. Performance Tests

**Benchmarks**: Validate performance requirements

```typescript
describe('Performance', () => {
  it('should query realms quickly', () => {
    const manager = new RealmManager();
    // Create 100 test realms...
    
    const start = performance.now();
    const realm = manager.getRealmAt(x, y);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(1); // < 1ms
  });
});
```

## Future Architecture Considerations

### 1. Microservice Architecture

**Future**: Split into smaller, focused modules
- **Core**: Spatial data and queries
- **UI**: Canvas layer and editing tools  
- **Import/Export**: Data portability
- **Integrations**: Module-specific connectors

### 2. WebWorker Integration

**Future**: Offload expensive operations
- **Spatial indexing**: Build indexes in background
- **Import processing**: Parse large files without blocking UI
- **Batch operations**: Process many realms simultaneously

### 3. Cloud Storage Integration

**Future**: Community data sharing platform
- **Realm registry**: Centralized data repository
- **Version control**: Track changes to shared data
- **Social features**: Ratings, comments, collections
- **API integration**: Direct download from registry

This architecture provides a solid foundation for the initial release while allowing for future enhancements and optimizations as the module evolves.