# Claude Memory File for Realms & Reaches

This file contains important information and patterns to remember when working on this module.

## Project Overview

**Realms & Reaches** is a Foundry VTT module that provides a queryable biome/terrain layer for narrative-driven gameplay. Unlike modules focused on tactical movement, this is designed for exploration, travel mechanics, and system integration.

### Core Vision
- **Tag-based data**: Flexible `["biome:forest", "terrain:dense", "travel_speed:0.75"]` system
- **Spatial queries**: `getRealmAt(x,y)` returns realm data for any coordinate
- **Community sharing**: Export/import realm data between installations
- **System agnostic**: Works with any game system, integrates with J&J

### Key Differentiators
- **Data-focused**: Queryable metadata vs behavioral triggers (unlike Foundry Regions)
- **Portable**: Scene-agnostic data format for sharing
- **Extensible**: Arbitrary tags support any module's needs
- **Creator-friendly**: Efficient realm drawing and bulk operations

## Technical Architecture

### Core Components
1. **RealmLayer**: Custom CanvasLayer for drawing polygons
2. **RealmManager**: Data storage and spatial indexing
3. **TagSystem**: Tag validation and management
4. **ExportImport**: JSON-based data portability
5. **RealmUI**: Properties editor and configuration

### Data Structure
```javascript
// Scene flags storage
flags['realms-and-reaches']: {
  version: "1.0.0",
  realms: {
    "realm-001": {
      id: "realm-001",
      name: "Ancient Forest", 
      geometry: [[x1,y1], [x2,y2], ...], // polygon points
      tags: ["biome:forest", "terrain:dense", "travel_speed:0.75"],
      metadata: { created, modified, author }
    }
  },
  metadata: { author, created, modified }
}
```

### Export Format
```javascript
{
  "format": "realms-and-reaches-v1",
  "metadata": {
    "author": "rayners",
    "created": "2025-05-27T12:00:00Z", 
    "version": "1.0.0",
    "description": "Misty Vale realm data"
  },
  "scenes": {
    "dragonbane-coreset.misty-vale": {
      "realms": [...],
      "bounds": { width, height }
    }
  }
}
```

## Development Patterns

### Follow J&J Conventions
- **System-agnostic design**: Works with any game system
- **TypeScript + Rollup**: Same build toolchain as J&J
- **Scene flags storage**: Consistent with J&J's data patterns
- **Module settings**: Standard Foundry settings for configuration
- **Testing**: Unit tests + Quench E2E tests

### Canvas Layer Implementation
- Extend Foundry's `CanvasLayer` class
- Use PIXI.Graphics for polygon rendering
- Handle mouse events for drawing workflow
- Integrate with Foundry's layer controls
- Store geometry in scene flags immediately

### Tag System Conventions
- **Namespace pattern**: `type:value` (e.g., `biome:forest`)
- **Core tags**: `biome:*`, `terrain:*`, `travel_speed:*`, `climate:*`
- **Custom tags**: `custom:*`, `module:*`, `author:*`
- **Validation**: Prevent malformed tags, suggest common patterns

## Linear Project Management

### Issue Tracking
- **FOU-65**: Module foundation setup
- **FOU-66**: Custom canvas layer implementation
- **FOU-67**: Tag-based data system
- **FOU-68**: Realm properties UI
- **FOU-69**: Export/import functionality
- **FOU-70**: Module API design
- **FOU-71**: J&J integration

### Labels and Organization
- **module:r&r**: All R&R-related issues
- Use same priority system as J&J
- Reference issues in commits: "addresses FOU-XX"

## Integration with J&J

### API Design
```javascript
// J&J integration points
const realm = game.realmsAndReaches?.api.getRealmAt(party.x, party.y);
if (realm) {
  const speedMod = parseFloat(realm.getTag('travel_speed')) || 1.0;
  const biome = realm.getTag('biome');
  
  // Apply to J&J travel mechanics
  adjustedSpeed *= speedMod;
  encounterTable = getEncounterTable(biome);
}
```

### Soft Dependency Pattern
- J&J works without R&R installed
- Graceful degradation when R&R unavailable
- Optional integration toggle in J&J settings
- Clear documentation for setup

## Community Ecosystem

### Data Sharing Vision
- **Repository structure**: `realm-data/module-name/scene-name.json`
- **Quality curation**: Community ratings, screenshots
- **Discoverability**: Built-in browser for installed modules
- **Standards**: Common tag vocabularies

### Content Creator Focus
- **Fast entry**: Quick drawing tools, bulk operations
- **Templates**: Standard biome presets
- **Validation**: Helpful error messages and suggestions
- **Export**: One-click sharing preparation

## Testing Strategy

### Unit Tests (Vitest)
- RealmData class methods
- Spatial query algorithms
- Tag validation logic
- Export/import functions

### E2E Tests (Quench)
- Canvas layer drawing workflow
- UI interactions with realm properties
- Cross-scene data persistence
- Import/export round-trip testing

### Test Patterns
```typescript
describe('RealmData', () => {
  it('should manage tags correctly', () => {
    const realm = new RealmData();
    realm.addTag('biome:forest');
    expect(realm.getTag('biome')).toBe('forest');
    expect(realm.hasTag('biome:forest')).toBe(true);
  });
});
```

## Known Technical Challenges

### Performance Considerations
- **Spatial queries**: Point-in-polygon must be fast (< 1ms)
- **Canvas rendering**: Efficient PIXI.Graphics updates
- **Memory usage**: Large polygon datasets
- **Real-time updates**: UI responsiveness during editing

### Canvas Layer Gotchas
- **Layer registration**: Must happen in correct Foundry hook
- **Mouse event handling**: Coordinate transformation complexities
- **Visual feedback**: Preview states during drawing
- **Persistence**: Save geometry changes immediately

### Data Migration
- **Version compatibility**: Handle format changes gracefully
- **Scene matching**: Robust identifier matching for imports
- **Tag evolution**: Backward compatibility for tag changes
- **Error recovery**: Graceful handling of corrupted data

## Module Release Strategy

### Version Planning
- **v0.1.0**: MVP with basic functionality (FOU-65 through FOU-69)
- **v0.2.0**: Enhanced UX and J&J integration (FOU-70, FOU-71)
- **v0.3.0**: Community features and data sharing
- **v1.0.0**: Stable API and comprehensive documentation

### Quality Gates
- All Linear tickets completed and tested
- Documentation complete and accurate
- Performance benchmarks met
- Community feedback incorporated
- Integration examples working

## Repository Structure

```
fvtt-realms-and-reaches/
├── src/
│   ├── realm-layer.ts          # Custom canvas layer
│   ├── realm-manager.ts        # Data storage and queries
│   ├── realm-data.ts           # RealmData class
│   ├── tag-system.ts           # Tag validation and management
│   ├── export-import.ts        # JSON data portability
│   ├── realm-ui.ts             # Properties editor
│   ├── api.ts                  # Public module API
│   ├── settings.ts             # Module configuration
│   ├── module.ts               # Main module entry
│   └── types/
│       └── realm-types.d.ts    # TypeScript definitions
├── templates/
│   └── realm-properties.hbs    # Properties editor UI
├── styles/
│   └── realms-and-reaches.scss # Module styling
├── test/
│   ├── realm-data.test.ts      # Unit tests
│   └── quench-tests.ts         # E2E tests
├── CLAUDE.md                   # This file
├── README.md                   # User documentation
├── module.json                 # Foundry manifest
├── package.json                # Build dependencies
├── tsconfig.json               # TypeScript config
└── rollup.config.js            # Build configuration
```

## Important Implementation Notes

### Scene Identification
- Use `${module}.${scene-key}` format for scene IDs
- Handle module prefix changes gracefully
- Support manual scene mapping for edge cases

### Tag Namespace Standards
- Reserve `biome:*`, `terrain:*`, `climate:*` for core functionality
- Encourage `module:*` prefix for module-specific tags
- Document tag conventions clearly for community

### Spatial Indexing
- Consider R-tree or quad-tree for large datasets
- Benchmark simple vs optimized approaches
- Balance complexity vs performance needs

### UI/UX Principles
- **Content creator first**: Optimize for realm creation workflow
- **Progressive disclosure**: Simple by default, powerful when needed
- **Visual feedback**: Clear indication of drawing states and selections
- **Accessibility**: Keyboard shortcuts and screen reader support

This memory file should be updated as the project evolves and new patterns emerge.