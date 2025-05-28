# Realms & Reaches

[![Test Module](https://github.com/rayners/fvtt-realms-and-reaches/actions/workflows/test.yml/badge.svg)](https://github.com/rayners/fvtt-realms-and-reaches/actions/workflows/test.yml)

> **🚧 Alpha Development**: This module is in active development. Features and APIs may change.

A Foundry VTT module that provides a queryable biome and terrain layer for narrative-driven gameplay, exploration mechanics, and system integration.

## Overview

**Realms & Reaches** lets GMs paint biome and terrain regions on any scene, then query that data for travel mechanics, encounter generation, and environmental effects. Unlike modules focused on tactical movement, this is designed for exploration, sandbox play, and integration with other modules.

### Key Features

- **🗺️ Custom Terrain Layer**: Draw polygon regions representing biomes, terrain types, and environmental zones
- **🏷️ Flexible Tagging**: Tag-based data system supports any properties (`biome:forest`, `terrain:dense`, `travel_speed:0.75`)
- **📤 Data Sharing**: Export/import realm data between installations and share with the community
- **🔌 Module Integration**: Clean API for other modules to query realm data
- **🎮 System Agnostic**: Works with any game system (D&D 5e, Pathfinder 2e, Dragonbane, etc.)

### Perfect For

- **Hexcrawl campaigns** with detailed biome effects
- **Sandbox exploration** with environmental variety
- **Travel-focused games** needing terrain modifiers
- **Module developers** wanting environmental data
- **Community content creators** sharing detailed maps

## Current Status

**🚀 Alpha Release**: Core functionality complete and ready for testing!

### What's Working

- ✅ **Tag-based realm data** with 8 core namespaces (biome, terrain, climate, etc.)
- ✅ **Spatial queries** - Fast point-in-polygon detection for coordinate-based lookups
- ✅ **Data persistence** - Automatic saving to scene flags with export/import
- ✅ **Validation system** - Smart tag suggestions and conflict detection
- ✅ **API foundation** - Full CRUD operations for programmatic access
- ✅ **Canvas drawing layer** - Visual realm creation with polygon, rectangle, and circle tools
- ✅ **Properties UI** - Complete tag editor interface with real-time validation
- ✅ **Layer controls** - Integrated drawing tools in Foundry's left sidebar

### Next Steps

- 📋 **Module integration** - J&J travel mechanics enhancement (ready to implement)
- 📋 **Community features** - Data sharing and browsing improvements
- 📋 **Performance optimization** - Large dataset handling enhancements

## Quick Start (API Preview)

```javascript
// Get realm data at coordinates
const manager = RealmManager.getInstance();
const realm = manager.getRealmAt(x, y);

if (realm) {
  const biome = realm.getTag('biome'); // "forest"
  const speed = realm.getTagNumber('travel_speed'); // 0.75
  const isHaunted = realm.hasTag('custom:haunted'); // true/false
}

// Create a new realm programmatically
await manager.createRealm({
  name: 'Dark Forest',
  geometry: { type: 'polygon', points: [0, 0, 100, 0, 100, 100, 0, 100] },
  tags: ['biome:forest', 'terrain:dense', 'travel_speed:0.5', 'custom:haunted']
});
```

## Installation

### From Foundry VTT

1. Open Foundry VTT
2. Go to **Add-on Modules** tab
3. Click **Install Module**
4. Search for "Realms & Reaches" or paste the manifest URL:
   ```
   https://github.com/rayners/fvtt-realms-and-reaches/releases/latest/download/module.json
   ```
5. Click **Install** and enable the module in your world

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/rayners/fvtt-realms-and-reaches/releases)
2. Extract the zip file to your Foundry `Data/modules/` directory
3. Restart Foundry VTT and enable the module

## User Guide

### Getting Started

1. **Enable the Module**: Make sure Realms & Reaches is enabled in your world
2. **Open the Realms Layer**: Click the map icon in the left sidebar controls
3. **Select a Drawing Tool**: Choose Polygon, Rectangle, or Circle
4. **Draw Your First Realm**: Click to place points and create shapes
5. **Edit Properties**: Double-click any realm to open the properties dialog

### Drawing Realms

#### Polygon Tool

- **Click** to add points to your polygon
- **Right-click** or **Enter** to complete the polygon
- **Escape** to cancel drawing
- Great for: Irregular biome boundaries, coastlines, mountain ranges

#### Rectangle Tool

- **Click** the first corner, then **click** the opposite corner
- Perfect for: Structured regions, urban areas, farmland

#### Circle Tool

- **Click** the center, then **click** to set the radius
- Ideal for: Points of interest, magical effects, blast zones

### Editing Realm Properties

Double-click any realm or use the Properties button to open the editor:

#### Name Field

- Give your realm a descriptive name like "Ancient Forest" or "Goblin Territory"
- Names help organize and identify realms during gameplay

#### Tag Editor

- **Add Tags**: Type in the format `key:value` (e.g., `biome:forest`)
- **Autocomplete**: Start typing to see suggestions
- **Color Coding**: Tags are automatically colored by namespace
- **Remove Tags**: Click the × button on any tag
- **Validation**: Invalid tags show red borders with error tooltips

#### Common Tag Patterns

```
biome:forest           # Primary ecosystem
terrain:dense          # Movement difficulty
travel_speed:0.75      # Speed modifier (1.0 = normal)
climate:temperate      # Weather patterns
resources:timber       # Available materials
resources:game         # Huntable animals
elevation:highland     # Altitude category
custom:haunted         # Custom properties
module:jj:encounter_chance:0.3  # Module-specific
```

### Layer Controls

The Realms & Reaches control panel provides:

- **Select Tool**: Click to select and edit existing realms
- **Polygon Tool**: Draw irregular shapes
- **Rectangle Tool**: Draw rectangular regions
- **Circle Tool**: Draw circular areas
- **Properties**: Edit the selected realm (or double-click)
- **Export**: Save realm data to JSON file
- **Import**: Load realm data from JSON file

### Keyboard Shortcuts

- **Escape**: Cancel current drawing or clear selection
- **Enter**: Complete polygon drawing
- **Delete**: Remove selected realm (with confirmation)

## Core Concepts

### Realms

A **realm** is a polygon region on a scene with associated metadata. Each realm can represent:

- **Biomes**: Forest, desert, mountain, swamp, arctic
- **Terrain**: Dense, sparse, rocky, marshy, civilized
- **Environmental effects**: Temperature, weather patterns, resources
- **Game mechanics**: Travel speeds, encounter tables, skill modifiers

### Tag System

Realms use a flexible tag-based system instead of fixed properties:

```javascript
// Example realm tags
[
  'biome:forest', // Core biome type
  'terrain:dense', // Terrain difficulty
  'travel_speed:0.75', // Movement modifier
  'climate:temperate', // Weather patterns
  'resources:timber', // Available resources
  'resources:game', // Huntable animals
  'custom:haunted', // Custom properties
  'module:jj:encounter_chance:0.3' // Module-specific data
];
```

This system allows:

- **Flexibility**: Add any properties you need
- **Extensibility**: Modules can define their own tag conventions
- **Future-proofing**: No breaking changes when adding new features
- **Community standards**: Shared tag vocabularies emerge naturally

### Spatial Queries

Other modules can query realm data by coordinates:

```javascript
// Get realm at party location
const realm = game.realmsAndReaches.api.getRealmAt(party.x, party.y);

// Use realm data for mechanics
if (realm) {
  const speedMod = parseFloat(realm.getTag('travel_speed')) || 1.0;
  const biome = realm.getTag('biome');
  const climate = realm.getTag('climate');

  // Apply to your game mechanics
  adjustedTravelSpeed *= speedMod;
  encounterTable = getEncounterTable(biome);
  weatherEffects = getWeatherEffects(climate);
}
```

## Data Sharing

### Export Realm Data

1. Open the Realms layer
2. Click **Export** in the realm tools
3. Choose **Current Scene** or **All Scenes**
4. Save the JSON file

### Import Realm Data

1. Download realm data files from the community
2. Open the Realms layer
3. Click **Import** in the realm tools
4. Select the JSON file and preview changes
5. Choose **Merge**, **Replace**, or **Skip** for conflicts

### Community Sharing

Realm data files are portable and can be shared between installations. Popular formats include:

- **Official module maps**: Pre-made realm data for published adventures
- **Community creations**: User-generated biome layouts
- **System templates**: Standard realm configurations for different game systems

## Module Integration

### Journeys & Jamborees

Realms & Reaches integrates seamlessly with [Journeys & Jamborees](https://github.com/rayners/fvtt-journeys-and-jamborees) for enhanced travel mechanics:

- **Travel speeds** modified by terrain type
- **Encounter tables** selected by biome
- **Weather effects** influenced by climate
- **Resource gathering** affected by realm properties

Enable the integration in J&J settings to automatically apply realm effects to party travel.

### Custom Integration

Module developers can integrate using the public API:

```javascript
// Check if Realms & Reaches is available
const realmsAPI = game.modules.get('realms-and-reaches')?.api;
if (realmsAPI) {
  // Query realm data
  const realm = realmsAPI.getRealmAt(x, y);
  const biome = realm?.getTag('biome');

  // Apply to your module's mechanics
  if (biome === 'desert') {
    applyDesertEffects();
  }
}
```

## Technical Details

### Performance

- **Spatial queries**: Optimized point-in-polygon algorithms (< 1ms typical)
- **Memory usage**: Efficient polygon storage and indexing
- **Canvas rendering**: Hardware-accelerated PIXI.Graphics
- **Real-time updates**: Immediate visual feedback during editing

### Data Storage

- **Scene flags**: Realm data stored in `scene.flags['realms-and-reaches']`
- **JSON format**: Human-readable export format with metadata
- **Version compatibility**: Automatic migration for format changes
- **Backup friendly**: Standard Foundry world backup includes realm data

### Browser Support

- **Foundry VTT v11+**: Full compatibility
- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Hardware acceleration**: Recommended for large datasets

## Development Roadmap

### v0.1.0 - MVP (✅ COMPLETED)

- ✅ **Tag-based data system** - Complete with validation, suggestions, conflict detection
- ✅ **Spatial indexing** - Fast point-in-polygon queries (< 1ms)
- ✅ **Data persistence** - Scene flags storage with export/import
- ✅ **Core API foundation** - RealmManager with full CRUD operations
- ✅ **Custom canvas layer** - Polygon, rectangle, and circle drawing tools
- ✅ **Realm properties editor** - Complete tag editor with real-time validation
- ✅ **UI integration** - Full layer controls integration with Foundry

### v0.2.0 - Enhanced UX

- 🔲 Smart tag editor with dropdowns
- 🔲 Tag templates and presets
- 🔲 Visual realm overlay toggle
- 🔲 Bulk operations (select multiple realms)
- 🔲 Enhanced J&J integration

### v0.3.0 - Community Features

- 🔲 Community data browser
- 🔲 Tag validation and suggestions
- 🔲 Realm data versioning
- 🔲 Advanced spatial operations
- 🔲 Module API documentation

### v1.0.0 - Stable Release

- 🔲 Complete documentation
- 🔲 Performance optimizations
- 🔲 Comprehensive test coverage
- 🔲 Community feedback integration

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/rayners/fvtt-realms-and-reaches.git
cd fvtt-realms-and-reaches

# Install dependencies
npm install

# Build the module
npm run build

# Run tests
npm test

# Start development server
npm run dev
```

### Issues and Feature Requests

- **Bug reports**: Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- **Feature requests**: Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- **Questions**: Join our [Discord community](https://discord.gg/foundryvtt)

## License

This project is licensed under the [MIT License](LICENSE) - see the license file for details.

## Acknowledgments

- **Foundry VTT**: Amazing platform for virtual tabletop gaming
- **PIXI.js**: Powerful 2D rendering engine
- **Community**: Foundry VTT developers and content creators
- **Inspiration**: Terrain Mapper, Enhanced Terrain Layer, and other terrain modules

## Links

- **Documentation**: [docs.rayners.dev/realms-and-reaches](https://docs.rayners.dev/realms-and-reaches)
- **GitHub**: [github.com/rayners/fvtt-realms-and-reaches](https://github.com/rayners/fvtt-realms-and-reaches)
- **Foundry Hub**: [foundryvtt-hub.com/package/realms-and-reaches](https://foundryvtt-hub.com/package/realms-and-reaches)
- **Discord**: [discord.gg/foundryvtt](https://discord.gg/foundryvtt)

---

**Made with ❤️ for the Foundry VTT community**
