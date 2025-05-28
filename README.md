# Realms & Reaches

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

## Quick Start

1. **Install** the module from the Foundry module browser
2. **Enable** Realms & Reaches in your world
3. **Open a scene** and click the Realms layer button (🗺️) in the layer controls
4. **Draw regions** by clicking to place polygon points
5. **Configure properties** using the tag-based editor
6. **Query data** via the module API or integrate with compatible modules

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
  "biome:forest",           // Core biome type
  "terrain:dense",          // Terrain difficulty
  "travel_speed:0.75",      // Movement modifier
  "climate:temperate",      // Weather patterns
  "resources:timber",       // Available resources
  "resources:game",         // Huntable animals
  "custom:haunted",         // Custom properties
  "module:jj:encounter_chance:0.3"  // Module-specific data
]
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

### v0.1.0 - MVP (Current)
- ✅ Custom canvas layer for drawing realms
- ✅ Tag-based data system
- ✅ Basic realm properties editor
- ✅ Export/import functionality
- ✅ Core API for module integration

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