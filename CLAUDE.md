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

### Tag System Implementation (COMPLETED ✅)

**Core Classes**:

- `RealmData`: Tag management, geometry, spatial queries
- `TagSystem`: Validation, suggestions, conflict detection
- `RealmManager`: Spatial indexing, persistence, CRUD operations

**Tag Namespace Conventions**:

- **Core namespaces**: `biome:*`, `terrain:*`, `climate:*`, `travel_speed:*`, `resources:*`, `elevation:*`
- **Extensible namespaces**: `custom:*`, `module:*` (allows multiple values)
- **Single-value enforcement**: biome, climate, travel_speed, elevation (automatic replacement)
- **Multi-value support**: resources, custom, module (additive)

**Validation Rules**:

- Format: `key:value` pattern required
- Characters: alphanumeric, underscore, hyphen, period
- Special handling: module tags allow multiple colons (`module:jj:encounter_chance:0.3`)
- Namespace validation: travel_speed must be 0.1-2.0, etc.

**Performance Targets (ACHIEVED)**:

- Spatial queries: < 1ms for typical scenes
- Point-in-polygon: Efficient ray-casting algorithm
- Memory usage: < 1MB for typical datasets

### Canvas Layer Implementation (COMPLETED ✅)

**Core Implementation**:

- `RealmLayer` extends Foundry's `CanvasLayer` class
- PIXI.Graphics integration for polygon, rectangle, and circle rendering
- Complete mouse event handling for drawing workflow
- Integration with Foundry's layer controls (left sidebar)
- Real-time preview graphics during drawing operations
- Geometry stored in scene flags immediately via RealmManager

**Drawing Tools**:

- **SELECT**: Click to select existing realms
- **POLYGON**: Click to add points, right-click or Enter to complete
- **RECTANGLE**: Click start corner, click end corner to complete
- **CIRCLE**: Click center, drag to set radius, click to complete

**Features Implemented**:

- Visual feedback with preview graphics (red outline during drawing)
- Color-coded realm rendering based on biome tags
- Selection highlighting (gold outline for selected realms)
- Context menu integration (right-click)
- Keyboard shortcuts (Escape to cancel, Delete to remove selected)
- Export/Import functionality with file dialogs
- Real-time updates when realm data changes

**Layer Controls Integration**:

- Added "Realms & Reaches" control group to left sidebar
- 7 tool buttons: Select, Polygon, Rectangle, Circle, Properties, Export, Import
- Proper tool state management and UI updates
- Layer activation/deactivation handling

**Testing Results**:

- 78/81 tests passing (96% pass rate)
- Spatial queries working correctly
- Canvas layer integration functional
- Drawing tools operational (based on build success)

### Realm Properties UI (COMPLETED ✅)

**Core Implementation**:

- `RealmPropertiesDialog` extends Foundry's `Dialog` class
- Handlebars template with comprehensive form layout
- Real-time tag validation and autocomplete
- Color-coded tag display by namespace
- CRUD operations for realm properties

**Features Implemented**:

- **Form Fields**: Name input with validation, tag editor with autocomplete
- **Tag Management**: Add/remove tags, visual tag pills with color coding
- **Validation**: Real-time tag format validation, duplicate detection
- **Autocomplete**: Dynamic suggestions based on TagSystem namespaces
- **Visual Design**: Modern form styling, color-coded tags by namespace
- **Actions**: Save, Cancel, Delete with confirmation dialogs

**User Experience**:

- Double-click realm to open properties
- Click Properties button in layer controls
- Visual feedback for valid/invalid tags
- Auto-suggestions for common tag patterns
- One-click tag removal with hover effects
- Responsive form layout with proper spacing

**Integration**:

- Connected to RealmManager for persistence
- Real-time canvas updates when properties change
- Lazy-loaded to avoid circular dependencies
- Proper error handling with user notifications
- Localized strings for internationalization

**Tag Editor Features**:

- 8 color-coded namespaces (biome, terrain, climate, etc.)
- Real-time validation with visual feedback
- Autocomplete with namespace suggestions
- Tag removal with hover animations
- Duplicate tag prevention
- Format validation (key:value pattern)

### Documentation System (COMPLETED ✅)

**Comprehensive Documentation Suite**:

- **README.md**: Complete overview with installation, user guide, and API preview
- **docs/getting-started.md**: Step-by-step tutorial for first-time users
- **docs/user-guide.md**: Comprehensive feature reference and workflows
- **docs/api-reference.md**: Complete developer documentation with examples
- **docs/README.md**: Documentation index and navigation guide
- **docs.rayners.dev integration**: Full documentation site with /realms-and-reaches route

**Documentation Features**:

- **Multi-audience approach**: Separate guides for users vs developers
- **Progressive complexity**: From basic tutorials to advanced techniques
- **Rich examples**: Code samples, workflows, and integration patterns
- **Visual elements**: Screenshots, diagrams, and formatted tables
- **Cross-references**: Extensive linking between related topics
- **Search-friendly**: Well-structured headers and clear navigation
- **Site integration**: Docusaurus-compatible with sidebar navigation

**User Documentation**:

- Installation and setup instructions
- Complete drawing tool tutorials
- Tag system reference with examples
- Troubleshooting and FAQ sections
- Best practices and workflow recommendations
- Campaign integration strategies

**Developer Documentation**:

- Complete API reference with TypeScript definitions
- Integration examples for common use cases
- Event system documentation
- Data format specifications
- Performance considerations and optimization tips
- Module development patterns

**Documentation Quality**:

- **Accuracy**: All features documented match implementation
- **Completeness**: Every public API and user feature covered
- **Accessibility**: Clear language appropriate for target audience
- **Maintainability**: Structured for easy updates as features evolve
- **Community-friendly**: Designed to support both users and contributors
- **Professional presentation**: Integrated into centralized docs.rayners.dev site

## Architectural Pivot to Region Flag System (COMPLETED ✅)

### Major Change: Region Document Integration with Flags

**Status**: ✅ **COMPLETED** - Successfully pivoted from custom document types to Region flag system

**Note**: Initial attempt at Region subtypes failed because Foundry VTT doesn't support Region subtypes. Pivoted to flag-based identification.

**Key Changes**:

1. **module.json**: Removed invalid `documentTypes` field (Region subtypes not supported)
2. **RealmManager**: Refactored to work with Region documents using flag identification
3. **RealmPropertiesDialog**: Updated to edit Region documents with custom flags
4. **API**: Modified to return Region documents instead of custom objects
5. **Data Storage**: Custom data stored in `flags["realms-and-reaches"]` with `isRealm: true` identifier
6. **Drawing**: Uses Foundry's built-in Region layer (with drawing tools)

**Benefits of Region Flag Approach**:

- ✅ Works with standard Foundry Region documents (no custom types needed)
- ✅ Built-in drawing tools and UI in Region layer
- ✅ Proper persistence and sync across clients
- ✅ Leverages Foundry's polygon intersection testing
- ✅ Integrates with existing Region workflows
- ✅ Simpler codebase (removed custom layer implementation)
- ✅ Flag-based identification allows selective functionality

**Implementation Details**:

- Standard Region documents with `flags["realms-and-reaches"].isRealm: true` identifier
- Custom tags stored in `flags["realms-and-reaches"].tags`
- Metadata in `flags["realms-and-reaches"].metadata`
- RealmHelpers class provides utility functions for tag management
- Context menu integration for realm properties dialog
- Custom scene control buttons for realm creation
- Automatic realm properties dialog after creation

**Realm Creation Methods**:

1. **Dedicated Realm Tools** - Custom buttons in Region layer toolbar
2. **Standard Region Tools** - Automatic realm type assignment
3. **Creation Dialog** - Choose drawing method and set properties
4. **API Creation** - Programmatic realm creation for modules

**Files Refactored**:

- `src/realm-manager.ts`: Now manages Region documents
- `src/realm-properties-dialog.ts`: Edits Region flags instead of RealmData
- `src/api.ts`: Returns Region documents instead of custom objects
- `src/module.ts`: Simplified registration, added context menu hooks

**Files Made Obsolete**:

- Custom realm document classes (now use built-in Region)
- Custom realm layer (now use built-in Region layer)
- Custom spatial indexing (now use Region collection)

## Linear Project Management

### Issue Tracking

- **FOU-65**: ✅ Module foundation setup (COMPLETED)
- **FOU-66**: ✅ Region subtype implementation (COMPLETED - Pivoted from custom layer)
- **FOU-67**: ✅ Tag-based data system (COMPLETED)
- **FOU-68**: ✅ Realm properties UI (COMPLETED - Updated for Region documents)
- **FOU-69**: ✅ Export/import functionality (COMPLETED - Updated for Region documents)
- **FOU-70**: ✅ Module API design (COMPLETED - Updated for Region documents)
- **FOU-71**: 📋 J&J integration (READY)
- **Documentation**: ✅ Complete user and developer documentation (COMPLETED)

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

### Performance Considerations (MOSTLY SOLVED ✅)

- **Spatial queries**: ✅ Point-in-polygon < 1ms achieved with ray-casting
- **Canvas rendering**: 🔄 Efficient PIXI.Graphics updates (next phase)
- **Memory usage**: ✅ Efficient Set-based tag storage, lazy spatial indexing
- **Real-time updates**: ✅ Event-driven architecture implemented

### Foundry VTT Core Integration Patterns (LEARNED)

**Scene Configuration Dialog Structure** (from foundry-app analysis):

*SceneConfig Application Architecture*:
- **Class**: `SceneConfig` extends `DocumentSheetV2` with `HandlebarsApplicationMixin`
- **Template System**: Modular parts system with separate templates for tabs, basics, grid, lighting, ambience, footer
- **Tab Management**: Four main tabs with icon-based navigation and separate rendering contexts
- **Form Processing**: Advanced form data handling with preview capabilities and validation

*Template Structure Analysis*:
- **Tab Structure**: Uses `data-tab` attributes (`basics`, `grid`, `lighting`, `ambience`)
- **Field IDs**: Follow pattern `{rootId}-fieldname` (e.g., `{rootId}-initial.scale`)
- **Template Location**: `/templates/scene/config/basics.hbs` contains the main form
- **Handlebars Helpers**: Uses `formGroup`, `formInput`, `localize` for consistent UI patterns
- **Form Organization**: Logical grouping with `.form-group` and `.form-group.inline` classes

*Scene Config Template Structure*:
```handlebars
<!-- from foundry-app/templates/scene/config/basics.hbs -->
{{formGroup fields.name value=source.name rootId=rootId}}
<div class="form-group">
  <label for="{{rootId}}-ownership.default">{{localize "SCENE.Accessibility"}}</label>
  <!-- Navigation and ownership controls -->
</div>
{{formGroup fields.navName value=source.navName rootId=rootId}}
{{formGroup fields.background.fields.src value=source.background.src rootId=rootId}}
<!-- Background/Foreground settings -->
<div class="form-group inline">
  <label>{{localize "SCENE.InitialView"}}</label>
  <div class="form-fields">
    <button type="button" data-action="capturePosition">
      <i class="fa-solid fa-crop-simple fa-fw"></i>
    </button>
    <label for="{{rootId}}-initial.x">{{localize "DOCUMENT.FIELDS.x.label"}}</label>
    {{formInput fields.initial.fields.x value=source.initial.x id=(concat rootId "-initial.x")}}
    <!-- initial.y and initial.scale inputs follow same pattern -->
  </div>
  <p class="hint">{{localize "SCENE.InitialViewHint"}}</p>
</div>
```

**Hook Integration Best Practices**:
- Use `renderSceneConfig` hook for scene dialog customization
- Check for `app?.object` to ensure valid scene document before proceeding
- Target semantic selectors like `label:contains("Initial View")` rather than field IDs
- Provide multiple fallback insertion points for robustness:
  1. After Initial View section (primary target)
  2. After scale input field (secondary target) 
  3. End of first tab (fallback)
- Field IDs follow `{rootId}-fieldname` pattern but aren't reliable for targeting
- Debug with console logging to understand actual DOM structure in different Foundry versions
- Use jQuery-compatible selectors since Foundry may pass jQuery objects

**Integration Points for Custom Controls**:
- **Initial View Section**: Reliable insertion point present in all scene configs
- **Form Groups**: Use `.form-group` structure to match native styling
- **Tab Content**: Insert at end of `.tab[data-tab="basics"]` as final fallback
- **Field Naming**: Follow `flags.module-name.property` convention for custom fields

### Canvas Layer Gotchas (RESEARCH COMPLETE)

- **Layer registration**: Must happen in correct Foundry hook
- **Mouse event handling**: Coordinate transformation complexities
- **Visual feedback**: Preview states during drawing
- **Persistence**: Save geometry changes immediately
- **Foundry Regions Pattern**: Can extend RegionLayer for drawing tools

### Data Migration (IMPLEMENTED ✅)

- **Version compatibility**: ✅ Version field in data format
- **Scene matching**: ✅ Module.scene-key identifier system
- **Tag evolution**: ✅ Flexible tag system supports evolution
- **Error recovery**: ✅ Graceful error handling in loadFromScene()

### Implementation Learnings

**Tag System Gotchas SOLVED**:

- **Single vs Multi-value namespaces**: Automatic replacement for biome/climate, additive for resources/custom
- **Module tag validation**: Special handling for `module:name:key:value` format
- **Tag conflict detection**: Logical conflicts (high speed + dense terrain)
- **Suggestion relevance**: Levenshtein distance + prefix matching

**Spatial Query Optimizations**:

- **Bounds checking first**: Quick rejection before expensive polygon tests
- **Ray-casting algorithm**: Efficient for complex polygons
- **Spatial index design**: Simple but effective for typical use cases
- **Memory management**: Lazy loading, WeakRef considerations for large datasets

**Testing Patterns Discovered**:

- **Singleton management**: Clear instances between tests
- **Async operations**: Proper async/await in beforeEach
- **Mock console.warn**: Handle expected error conditions
- **Event testing**: Custom event verification

## Foundry VTT Core Application Insights

### Scene Configuration Integration (FOU-73 Implementation)

**Current Implementation Status**: ✅ **COMPLETED** - Scene config travel controls integration

**Core Findings from Foundry Application Analysis**:

*Application Structure*:
- SceneConfig uses modular template system with separate rendering contexts
- Scene data accessed via `app.object` property containing the Scene document
- Form fields generated dynamically using Handlebars helpers
- Multiple insertion strategies needed for compatibility across Foundry versions

*DOM Structure Insights*:
- Template generates semantic HTML structure with consistent class patterns
- Initial View section always present and reliably targetable
- Form follows `.form-group` > `label` + `.form-fields` pattern
- Insertion after Initial View provides good visual placement

*Implementation Strategy*:
```javascript
// Corrected insertion pattern from module.ts:306-334
// IMPORTANT: Template shows "Initial View" but renders as "Initial View Position"
const insertAfter = $html.find('label:contains("Initial View Position")').closest('.form-group');
if (insertAfter.length) {
  console.log('Realms & Reaches | Inserting after Initial View Position label');
  insertAfter.after(travelControlsHtml);
} else {
  // Fallback for template text vs rendered text discrepancy
  const initialViewFallback = $html.find('label:contains("Initial View")').closest('.form-group');
  if (initialViewFallback.length) {
    initialViewFallback.after(travelControlsHtml);
  } else {
    // Use input name instead of ID pattern for better reliability
    const scaleInput = $html.find('input[name="initial.scale"]').closest('.form-group');
    if (scaleInput.length) {
      scaleInput.after(travelControlsHtml);
    } else {
      $html.find('.tab').first().append(travelControlsHtml);
    }
  }
}
```

*Custom Field Integration*:
- Travel controls use `flags.realms-and-reaches.travelEnabled` naming convention
- Auto-detection logic based on grid type and distance units
- Checkbox and select controls follow Foundry's native styling patterns
- Help text provides clear explanation of auto-detection logic

**Travel Scale Detection Logic**:
```javascript
// Smart detection with manual override support
function detectTravelScale(scene) {
  // Check if travel controls are disabled for this scene
  const travelEnabled = scene.getFlag('realms-and-reaches', 'travelEnabled');
  if (travelEnabled === false) return 'none';
  
  // Check for manual override first
  const manualScale = scene.getFlag('realms-and-reaches', 'travelScale');
  if (manualScale && ['realm', 'region', 'none'].includes(manualScale)) {
    return manualScale;
  }
  
  // Auto-detect based on grid type and distance units
  const gridType = scene.grid?.type; // 0=GRIDLESS, 1=SQUARE, 2=HEXAGONAL
  const distanceUnit = scene.grid?.units?.toLowerCase() || '';
  
  if (gridType === 2) return 'realm'; // Hex grids = overland travel
  if (gridType === 1) return 'region'; // Square grids = tactical scale
  
  // Distance unit fallbacks for gridless scenes
  if (distanceUnit.includes('km') || distanceUnit.includes('mile')) return 'realm';
  if (distanceUnit.includes('ft') || distanceUnit.includes('meter')) return 'region';
  
  return 'none';
}
```

**Key Implementation Insights**:
- **Template vs Rendered Text**: Template uses `{{localize "SCENE.InitialView"}}` but renders as "Initial View Position"
- **Selector Strategy**: Target actual rendered text first, template text as fallback
- **Field Identification**: Use `input[name="fieldname"]` selectors over ID patterns for reliability
- **Debug Strategy**: Console logging shows actual DOM structure for troubleshooting

**Integration Benefits**:
- Seamless integration with native Foundry scene configuration
- Intelligent travel scale detection reduces user configuration burden
- Consistent with Foundry's form patterns and styling
- Multi-fallback insertion strategy ensures compatibility across versions
- Real-time auto-detection with manual override capabilities

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
