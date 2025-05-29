# User Guide

> **Complete reference for Realms & Reaches features and workflows**

This comprehensive guide covers all features, advanced techniques, and best practices for using Realms & Reaches effectively in your campaigns.

## Table of Contents

- [Scene Controls](#scene-controls)
- [Interface Overview](#interface-overview)
- [Drawing and Editing](#drawing-and-editing)
- [Tag Management](#tag-management)
- [Data Management](#data-management)
- [Advanced Techniques](#advanced-techniques)
- [Campaign Integration](#campaign-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Scene Controls *(GM Only)*

Realms & Reaches provides intelligent travel controls that automatically adapt to your scene configuration.

### Auto-Detection System

The module automatically detects the appropriate travel scale for each scene:

- **Realm Travel** (hex grids, km/miles/leagues): For overland travel and wilderness exploration
- **Region Travel** (square grids, ft/meters/yards): For tactical movement and local exploration

### Detection Priority

1. **Grid Type** *(primary)*: Hex grids → Realm, Square grids → Region
2. **Distance Units** *(fallback)*: km/miles/leagues → Realm, ft/meters/yards → Region  
3. **Manual Override** *(highest)*: Always respected when configured

### Configuring Scene Travel

1. **Right-click a scene** and select **Configure**
2. **Enable travel controls** checkbox to activate the feature
3. **Choose travel scale**:
   - **Auto-detect** *(default)*: Uses grid type and distance units
   - **Realm**: Force realm-scale travel controls
   - **Region**: Force region-scale travel controls  
   - **None**: Disable travel controls entirely

### Using Scene Controls

When enabled, travel controls appear in the scene toolbar:

#### Realm Scale Controls
- **Select Realm**: Click to select existing realm areas
- **Create Realm**: Launch realm creation dialog with drawing tools

#### Region Scale Controls  
- **Select Region**: Click to select existing local regions
- **Create Region**: Access standard Foundry region tools for tactical areas

### Integration with Standard Tools

- **Realm controls** integrate with the existing Region layer for polygon drawing
- **Region controls** use Foundry's built-in region creation workflow
- **Seamless workflow** between different scales of travel and exploration

This system allows GMs to work with travel data at the appropriate scale without manual configuration in most cases.

## Interface Overview

### Layer Controls

The Realms & Reaches controls appear in the left sidebar when the module is active:

![Layer Controls](images/layer-controls.png)

| Tool | Icon | Purpose | Shortcut |
|------|------|---------|----------|
| Select | ↖️ | Select and manipulate existing realms | S |
| Polygon | 🔷 | Draw irregular shapes | P |
| Rectangle | ⬜ | Draw rectangular regions | R |
| Circle | ⭕ | Draw circular areas | C |
| Properties | ⚙️ | Edit selected realm properties | E |
| Export | 📤 | Save realm data to file | - |
| Import | 📥 | Load realm data from file | - |

### Visual Feedback

#### Realm Display
- **Inactive realms**: Semi-transparent fill with colored border
- **Selected realm**: Bright border with higher opacity fill
- **During drawing**: Red preview outline shows current shape

#### Color Coding
Realms are automatically colored based on their primary biome tag:
- **Forest** 🟢: Green
- **Desert** 🟡: Goldenrod
- **Mountain** ⚪: Gray
- **Swamp** 🟤: Dark olive
- **Grassland** 🟩: Yellow-green
- **Arctic** 🔷: Sky blue
- **Unknown** 🔵: Default blue

## Drawing and Editing

### Polygon Tool

Perfect for irregular terrain features like coastlines, forest edges, or mountain ranges.

#### Basic Usage
1. **Select the Polygon tool** from controls
2. **Click to place each point** of your polygon
3. **Right-click or press Enter** to complete
4. **Press Escape** to cancel

#### Advanced Techniques
- **Closing hint**: When near the starting point, a completion line appears
- **Precision placement**: Use grid snapping for exact positioning
- **Complex shapes**: No limit on number of points

#### Best Practices
- Start with major landmarks and work inward
- Keep polygons reasonably simple for performance
- Use natural boundaries (rivers, ridgelines) as guides

### Rectangle Tool

Ideal for structured regions like urban districts, farmland, or administrative boundaries.

#### Basic Usage
1. **Select the Rectangle tool**
2. **Click the first corner** of your rectangle
3. **Click the opposite corner** to complete
4. **Press Escape** to cancel before second click

#### Advanced Techniques
- **Square creation**: Hold Shift while clicking second point (when supported)
- **Grid alignment**: Use grid snapping for clean borders
- **Overlapping regions**: Create layered administrative zones

#### Use Cases
- Urban districts and neighborhoods
- Agricultural fields and farmland
- Military zones and borders
- Trade route segments

### Circle Tool

Best for point-based features, magical effects, or resource deposits.

#### Basic Usage
1. **Select the Circle tool**
2. **Click the center point**
3. **Click to set the radius** (edge of circle)
4. **Press Escape** to cancel before second click

#### Advanced Techniques
- **Concentric circles**: Create multiple circles from same center
- **Radius precision**: Use grid measurements for exact sizes
- **Overlay effects**: Combine with other shapes for complex regions

#### Use Cases
- Cities and settlements
- Magical effect zones
- Resource deposits
- Points of interest
- Blast or influence areas

### Editing Existing Realms

#### Selection
- **Click with Select tool** to choose a realm
- **Double-click any realm** to open properties immediately
- **Selected realms** show bright borders and selection handles

#### Modification
- **Drag to move** (when editing tools are available)
- **Resize using handles** (planned feature)
- **Edit properties** via Properties dialog

#### Deletion
- **Select realm** and press Delete/Backspace
- **Confirm deletion** in safety dialog
- **Use Properties dialog** Delete button for alternative method

## Tag Management

### Tag Editor Interface

The Properties dialog provides a comprehensive tag editing experience:

![Tag Editor](images/tag-editor.png)

#### Components
- **Name field**: Descriptive realm name
- **Tag list**: Visual display of all current tags
- **Tag input**: Add new tags with autocomplete
- **Suggestions**: Dropdown list of common tags

### Tag Format and Validation

#### Required Format
All tags must follow the `key:value` pattern:
- ✅ `biome:forest`
- ✅ `travel_speed:0.75`
- ✅ `custom:haunted`
- ❌ `forest` (missing colon)
- ❌ `biome:` (missing value)

#### Character Rules
- **Allowed**: Letters, numbers, underscore, hyphen, period
- **Not allowed**: Spaces, special characters (except in module tags)
- **Case**: Lowercase recommended for consistency

#### Validation Feedback
- **Green border**: Valid tag format
- **Red border**: Invalid format with tooltip explanation
- **Smart Autocomplete**: Advanced tag discovery system

#### Smart Tag Search
The autocomplete system now supports multiple search methods:

**Full Tag Search**:
- Type `biome:` to see all biome options
- Type `travel_` to find travel-related tags
- Standard prefix matching for complete tag names

**Value-Based Search** ✨ *New Feature*:
- Type `swamp` → finds `biome:swamp`
- Type `village` → finds `settlement:village`
- Type `magical` → finds `custom:magical`
- Type `timber` → finds `resources:timber`

**Smart Features**:
- **Case-insensitive**: Works regardless of capitalization
- **Partial matching**: Type part of a value to find matches
- **Combined results**: Shows both full-tag and value matches
- **Duplicate filtering**: Hides already-applied tags

### Core Tag Namespaces

#### Biome Tags (`biome:`)
Define the primary ecosystem type:
- `biome:forest` - Temperate woodlands
- `biome:desert` - Arid wastelands
- `biome:mountain` - High altitude rocky terrain
- `biome:swamp` - Wetlands and marshes
- `biome:grassland` - Plains and prairies
- `biome:tundra` - Cold, treeless regions
- `biome:jungle` - Tropical rainforests
- `biome:coast` - Shoreline areas
- `biome:cultivated` - Farmland and settlements

#### Terrain Tags (`terrain:`)
Describe movement conditions and physical characteristics:
- `terrain:dense` - Thick vegetation, slow movement
- `terrain:sparse` - Open terrain, easy movement
- `terrain:rocky` - Difficult footing, climbing required
- `terrain:marshy` - Wet, unstable ground
- `terrain:rugged` - Broken terrain with obstacles
- `terrain:smooth` - Even surfaces, fast travel
- `terrain:steep` - Significant elevation changes
- `terrain:flat` - Level ground

#### Climate Tags (`climate:`)
Weather patterns and temperature ranges:
- `climate:temperate` - Moderate temperatures, seasonal variation
- `climate:arctic` - Cold, snow, ice
- `climate:tropical` - Hot, humid, wet/dry seasons
- `climate:arid` - Dry, little precipitation
- `climate:humid` - High moisture, frequent rain
- `climate:seasonal` - Strong seasonal differences

#### Travel Speed Tags (`travel_speed:`)
Movement rate modifiers for travel mechanics:
- `travel_speed:0.25` - Extremely difficult (1/4 speed)
- `travel_speed:0.5` - Difficult terrain (1/2 speed)
- `travel_speed:0.75` - Somewhat difficult (3/4 speed)
- `travel_speed:1.0` - Normal speed (baseline)
- `travel_speed:1.25` - Easy terrain (1.25x speed)
- `travel_speed:1.5` - Roads and clear paths (1.5x speed)
- `travel_speed:2.0` - Highways and magical transport (2x speed)

#### Resource Tags (`resources:`)
Available materials and opportunities (can have multiple):
- `resources:timber` - Wood for construction
- `resources:game` - Huntable animals
- `resources:minerals` - Metal ores and gems
- `resources:water` - Fresh water sources
- `resources:herbs` - Medicinal plants
- `resources:food` - Edible plants and fruits

#### Elevation Tags (`elevation:`)
Altitude and topographic categories:
- `elevation:lowland` - Sea level to 500 feet
- `elevation:highland` - 500-2000 feet
- `elevation:mountain` - 2000+ feet
- `elevation:valley` - Below surrounding terrain
- `elevation:plateau` - Elevated flat areas
- `elevation:peak` - Highest points

#### Settlement Tags (`settlement:`)
Human habitation and civilized areas (can have multiple):
- `settlement:village` - Small rural communities (50-300 people)
- `settlement:town` - Larger communities with markets (300-2000 people)
- `settlement:city` - Major urban centers (2000+ people)
- `settlement:outpost` - Frontier settlements and trading posts
- `settlement:ruins` - Abandoned or destroyed settlements
- `settlement:nomad` - Temporary or seasonal encampments

#### Custom Tags (`custom:`)
User-defined properties for unique features:
- `custom:haunted` - Supernatural presence
- `custom:sacred` - Religious significance
- `custom:dangerous` - General hazard warning
- `custom:peaceful` - Safe haven
- `custom:magical` - Arcane properties
- `custom:cursed` - Negative magical effects
- `custom:ancient` - Historical significance

#### Module Tags (`module:`)
Integration with other Foundry modules:
- `module:jj:encounter_chance:0.3` - Journeys & Jamborees encounter rate
- `module:weather:storm_chance:high` - Weather module integration
- `module:magic:wild_magic:true` - Magic system integration

### Tag Management Best Practices

#### Consistency
- Use standard values across your campaign
- Document your tag conventions for players
- Consider creating tag "templates" for common region types

#### Organization
- Start with core tags (biome, terrain, travel_speed)
- Add specific tags as needed
- Use custom tags sparingly for truly unique features

#### Performance
- Limit tags per realm to essential information
- Remove unused or redundant tags periodically
- Focus on tags that affect gameplay mechanics

## Data Management

### Scene Storage

Realm data is automatically stored in scene flags and persists with your world:

#### Automatic Saving
- **Real-time**: Changes save immediately
- **Scene flags**: Data stored in `scene.flags['realms-and-reaches']`
- **World backup**: Included in standard Foundry world backups

#### Manual Control
- **Export button**: Save to external JSON file
- **Import button**: Load from external JSON file
- **No manual save required**: Everything is automatic

### Export System

#### Export Process
1. **Click Export** in layer controls
2. **Choose filename** (defaults to scene name)
3. **Select location** to save file
4. **File contains** all realm data plus metadata

#### Export Format
```json
{
  "format": "realms-and-reaches-v1",
  "metadata": {
    "author": "GM Name",
    "created": "2025-05-28T12:00:00Z",
    "version": "1.0.0",
    "description": "Adventure location realm data"
  },
  "scenes": {
    "scene-id": {
      "realms": [...],
      "bounds": { "width": 4000, "height": 4000 }
    }
  }
}
```

#### Use Cases
- **Backup**: Regular export for data safety
- **Sharing**: Send to other GMs or players
- **Publishing**: Include with adventure modules
- **Migration**: Move data between worlds

### Import System

#### Import Process
1. **Click Import** in layer controls
2. **Select JSON file** to import
3. **Preview data** and conflicts
4. **Choose merge strategy**:
   - **Merge**: Add new realms, keep existing
   - **Replace**: Delete existing, add imported
   - **Skip conflicts**: Only add non-conflicting realms
5. **Confirm import**

#### Conflict Resolution
When importing data that conflicts with existing realms:
- **Name conflicts**: Multiple realms with same name
- **Area conflicts**: Overlapping geometry
- **ID conflicts**: Duplicate realm identifiers

The import dialog shows previews and lets you choose how to handle each conflict.

### Version Management

#### Format Versioning
- **Current format**: `realms-and-reaches-v1`
- **Backward compatibility**: Older formats automatically upgraded
- **Future versions**: Migration paths preserved

#### Data Migration
- **Automatic**: Happens during import/load
- **Safe**: Original data never modified
- **Logged**: Migration steps recorded in console

## Advanced Techniques

### Layered Regions

Create complex environmental effects by overlapping realms:

#### Example: Mountain Forest
```
Base layer: biome:mountain, elevation:highland, travel_speed:0.6
Forest layer: biome:forest, terrain:dense, resources:timber
Combined effect: Mountain forest with slow travel and timber resources
```

#### Strategy
- **Large base regions**: Major biomes and elevation
- **Overlay details**: Specific features and hazards
- **Query priority**: First match determines primary properties

### Complex Geometries

#### Irregular Coastlines
- Use polygon tool with many points
- Follow actual map features closely
- Consider performance vs. detail trade-offs

#### Urban Districts
- Rectangular regions for structured areas
- Overlapping circles for neighborhood boundaries
- Custom tags for district characteristics

#### River Valleys
- Long, narrow polygons following water courses
- Multiple segments for different sections
- Tags for water access and fertile soil

### Bulk Operations

#### Template Creation
1. **Create master realm** with standard tags
2. **Export the data**
3. **Modify coordinates** in JSON for multiple locations
4. **Import modified data**

#### Tag Updates
1. **Export scene data**
2. **Use text editor** to find/replace tag values
3. **Import updated data** with replace strategy

### Performance Optimization

#### Large Datasets
- **Simplify geometry**: Reduce polygon point count
- **Strategic placement**: Focus on gameplay-relevant areas
- **Regular cleanup**: Remove unused or obsolete realms

#### Memory Management
- **Scene separation**: Keep realm data per scene
- **Export old data**: Archive completed areas
- **Monitor performance**: Watch for lag during drawing

## Campaign Integration

### Journeys & Jamborees Integration

#### Automatic Effects
When J&J integration is enabled:
- **Travel speeds** automatically modified by `travel_speed:` tags
- **Encounter tables** selected based on `biome:` tags
- **Weather effects** influenced by `climate:` tags

#### Setup
1. **Install both modules**
2. **Enable J&J integration** in settings
3. **Create realm data** with appropriate tags
4. **J&J automatically queries** realm data during travel

#### Tag Mapping
- `travel_speed:0.75` → 75% normal movement rate
- `biome:forest` → Forest encounter table
- `climate:arctic` → Cold weather effects

### Custom Module Integration

#### API Usage
Other modules can query realm data:
```javascript
const realm = game.modules.get('realms-and-reaches')?.api.getRealmAt(x, y);
if (realm) {
  const biome = realm.getTag('biome');
  // Apply module-specific effects
}
```

#### Event Integration
Listen for realm changes:
```javascript
RealmManager.getInstance().addEventListener('realmUpdated', (event) => {
  // React to realm modifications
});
```

### Content Creation

#### Adventure Modules
- **Include realm data** with published adventures
- **Standard tags** for compatibility
- **Documentation** explaining realm effects

#### Community Sharing
- **Export interesting areas** for sharing
- **Use descriptive filenames**: `adventure-name-realms.json`
- **Include documentation** explaining tag choices

## Best Practices

### Design Principles

#### Start Simple
- Begin with basic biome and terrain tags
- Add complexity gradually as needed
- Focus on gameplay-relevant properties

#### Be Consistent
- Use the same tag values across your campaign
- Document your conventions for other GMs
- Consider standardization with published content

#### Plan for Growth
- Design tag systems that can expand
- Leave room for module-specific additions
- Consider how players will interact with the data

### Workflow Recommendations

#### Session Preparation
1. **Review upcoming areas** and add missing realm data
2. **Test integrations** with travel and encounter systems
3. **Prepare descriptions** based on realm properties

#### During Play
1. **Use Select tool** to quickly check realm properties
2. **Reference tags** for travel time calculations
3. **Add custom tags** for story events that emerge

#### Post-Session
1. **Add new areas** discovered during play
2. **Update existing realms** based on player actions
3. **Export changed data** for backup

### Tagging Strategies

#### Minimal Viable Tags
For quick setup, focus on:
- `biome:` for basic environment
- `travel_speed:` for movement mechanics
- One or two custom tags for flavor

#### Comprehensive Tagging
For detailed campaigns, include:
- All core namespace tags
- Multiple resource tags
- Custom story tags
- Module integration tags

#### Situational Tagging
Add tags as they become relevant:
- `custom:dangerous` after a combat encounter
- `resources:water` when players need to find it
- `module:weather:shelter:available` during storms

### Common Patterns

#### Wilderness Hexcrawl
```
Forest: biome:forest, terrain:dense, travel_speed:0.75, resources:timber, resources:game
Plains: biome:grassland, terrain:sparse, travel_speed:1.25, resources:food
Mountains: biome:mountain, terrain:rocky, elevation:highland, travel_speed:0.5, resources:minerals
```

#### Urban Campaign
```
Noble District: biome:cultivated, terrain:smooth, travel_speed:1.5, custom:wealthy, custom:safe
Docks: biome:coast, terrain:flat, travel_speed:1.0, resources:water, custom:rough
Slums: biome:cultivated, terrain:dense, travel_speed:0.75, custom:dangerous, custom:poor
```

#### Dungeon Integration
```
Natural Caves: biome:mountain, terrain:rocky, travel_speed:0.5, custom:dark
Worked Stone: biome:cultivated, terrain:smooth, travel_speed:1.0, custom:artificial
Flooded Areas: terrain:marshy, travel_speed:0.25, custom:underwater
```

## Troubleshooting

### Common Issues

#### "Realms not appearing"
**Symptoms**: Drew a realm but can't see it
**Solutions**:
- Check the Realms layer is active (map icon highlighted)
- Verify you completed the shape (right-click or Enter)
- Look for transparent regions (may be very faint)
- Try selecting with Select tool to highlight

#### "Properties dialog won't open"
**Symptoms**: Double-click or Properties button doesn't work
**Solutions**:
- Ensure you have GM permissions
- Make sure a realm is selected (bright border)
- Try clicking directly on the realm area, not the border
- Check browser console for JavaScript errors

#### "Tags showing as invalid"
**Symptoms**: Red border around tag input
**Solutions**:
- Check format: must be `key:value` with exactly one colon
- Verify characters: only letters, numbers, underscore, hyphen, period
- Check for typos in common tags (e.g., `forrest` vs `forest`)
- Try suggested values from autocomplete

#### "Import failed"
**Symptoms**: Error during data import
**Solutions**:
- Verify file format (JSON from Realms & Reaches export)
- Check file isn't corrupted (open in text editor)
- Try importing smaller datasets
- Check for disk space and permissions

#### "Performance problems"
**Symptoms**: Lag when drawing or selecting realms
**Solutions**:
- Reduce polygon complexity (fewer points)
- Delete unnecessary realms
- Use simpler shapes where possible
- Check browser hardware acceleration
- Close other applications

### Technical Issues

#### Browser Compatibility
- **Recommended**: Chrome, Firefox, Safari, Edge (latest versions)
- **Minimum**: Support for ES2020, WebGL, Canvas API
- **Hardware acceleration**: Required for best performance

#### Module Conflicts
- **Check load order**: Realms & Reaches should load before modules that depend on it
- **Disable conflicting modules**: Test with minimal module set
- **Check console**: Look for JavaScript errors and warnings

#### Data Corruption
- **Regular backups**: Export data frequently
- **World backups**: Use Foundry's backup system
- **Validation**: Import exported data to verify integrity
- **Recovery**: Restore from most recent working backup

### Getting Help

#### Documentation
- **User Guide**: This document
- **API Reference**: For developers
- **Getting Started**: For new users
- **GitHub Wiki**: Community-contributed guides

#### Community Support
- **Discord**: #modules channel in Foundry VTT server
- **Reddit**: r/FoundryVTT community
- **GitHub Discussions**: Q&A and community sharing

#### Bug Reports
Include this information:
- **Foundry VTT version**
- **Browser and version**
- **Steps to reproduce**
- **Error messages** from browser console
- **Screenshot** if visual issue

---

This guide covers the complete feature set of Realms & Reaches. For the latest updates and community-contributed content, check the [GitHub repository](https://github.com/rayners/fvtt-realms-and-reaches) and join the community discussions.