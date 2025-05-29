# Realms & Reaches Documentation

> **Complete documentation for the Realms & Reaches Foundry VTT module**

Welcome to the comprehensive documentation for Realms & Reaches! This module provides a queryable biome and terrain layer for narrative-driven gameplay, exploration mechanics, and system integration.

## 📚 Documentation Overview

### For New Users

**[🚀 Getting Started Guide](getting-started.md)**
- Complete walkthrough for first-time users
- Step-by-step tutorial creating your first realm
- Basic concepts and common patterns
- Troubleshooting for beginners

**Perfect for**: First-time users, quick onboarding, learning the basics

### For Regular Users

**[📖 User Guide](user-guide.md)**
- Comprehensive feature reference
- Advanced techniques and workflows
- Campaign integration strategies
- Best practices and optimization tips

**Perfect for**: GMs using the module regularly, advanced features, campaign integration

### For Developers

**[🔧 API Reference](api-reference.md)**
- Complete programming interface documentation
- Integration examples and patterns
- Event system and data formats
- Performance considerations

**Perfect for**: Module developers, custom integrations, programmatic usage

## 🎯 Quick Navigation

### By Task

| I want to... | Read this |
|--------------|-----------|
| Install and set up the module | [Getting Started → Installation](getting-started.md#installation) |
| Draw my first realm | [Getting Started → Your First Realm](getting-started.md#step-2-your-first-realm) |
| Understand the tag system | [User Guide → Tag Management](user-guide.md#tag-management) |
| Integrate with other modules | [API Reference → Module Integration](api-reference.md#examples) |
| Share realm data | [User Guide → Data Management](user-guide.md#data-management) |
| Optimize performance | [User Guide → Best Practices](user-guide.md#best-practices) |
| Report a bug | [User Guide → Troubleshooting](user-guide.md#troubleshooting) |

### By Experience Level

#### Beginner (New to the module)
1. **[Getting Started Guide](getting-started.md)** - Complete walkthrough
2. **[README Examples](../README.md#user-guide)** - Quick reference
3. **[User Guide → Interface Overview](user-guide.md#interface-overview)** - UI familiarization

#### Intermediate (Using regularly)
1. **[User Guide → Advanced Techniques](user-guide.md#advanced-techniques)** - Complex workflows
2. **[User Guide → Campaign Integration](user-guide.md#campaign-integration)** - Module synergy
3. **[User Guide → Best Practices](user-guide.md#best-practices)** - Optimization

#### Advanced (Power user/Developer)
1. **[API Reference](api-reference.md)** - Complete programming guide
2. **[User Guide → Performance Optimization](user-guide.md#performance-optimization)** - Large datasets
3. **[GitHub Issues](https://github.com/rayners/fvtt-realms-and-reaches/issues)** - Feature requests

## 🎮 Feature Overview

### Core Features

✅ **Visual Realm Drawing**
- Polygon, rectangle, and circle tools
- Real-time preview with grid snapping
- Color-coded biome display
- *Documented in: [User Guide → Drawing and Editing](user-guide.md#drawing-and-editing)*

✅ **Tag-Based Data System**
- Flexible `key:value` tag format
- 8 core namespaces (biome, terrain, climate, etc.)
- Real-time validation and autocomplete
- *Documented in: [User Guide → Tag Management](user-guide.md#tag-management)*

✅ **Spatial Query System**
- Fast point-in-polygon detection (< 1ms)
- API for other modules to query realm data
- Efficient spatial indexing for large datasets
- *Documented in: [API Reference → Spatial Queries](api-reference.md#spatial-queries)*

✅ **Data Import/Export**
- JSON-based portable format
- Community data sharing support
- Version-compatible migrations
- *Documented in: [User Guide → Data Management](user-guide.md#data-management)*

✅ **Module Integration**
- Public API for developers
- Event system for real-time updates
- Soft dependency patterns for graceful degradation
- *Documented in: [API Reference](api-reference.md)*

## 🏷️ Tag System Reference

### Quick Reference

| Namespace | Purpose | Example Values |
|-----------|---------|----------------|
| `biome:` | Ecosystem type | `forest`, `desert`, `mountain`, `swamp` |
| `terrain:` | Movement conditions | `dense`, `sparse`, `rocky`, `marshy` |
| `climate:` | Weather patterns | `temperate`, `arctic`, `tropical`, `arid` |
| `travel_speed:` | Speed modifier | `0.5` (slow), `1.0` (normal), `1.5` (fast) |
| `resources:` | Available materials | `timber`, `game`, `minerals`, `water` |
| `elevation:` | Altitude category | `lowland`, `highland`, `mountain` |
| `custom:` | Unique properties | `haunted`, `sacred`, `dangerous` |
| `module:` | Module-specific | `module:jj:encounter_chance:0.3` |

*Full documentation: [User Guide → Tag Management](user-guide.md#tag-management)*

## 🔗 Integration Examples

### Journeys & Jamborees
```javascript
// Automatic travel speed modification
const realm = realmsAPI.getRealmAt(party.x, party.y);
const speedMod = parseFloat(realm?.getTag('travel_speed')) || 1.0;
adjustedSpeed *= speedMod;
```

### Weather Systems
```javascript
// Climate-based weather effects
const climate = realm?.getTag('climate');
const weatherTable = getWeatherTable(climate);
```

### Encounter Generation
```javascript
// Biome-specific encounters
const biome = realm?.getTag('biome');
const encounterTable = `encounters-${biome}`;
```

*Full examples: [API Reference → Examples](api-reference.md#examples)*

## 🛠️ Development Resources

### For Module Developers

- **[API Reference](api-reference.md)** - Complete programming interface
- **[GitHub Repository](https://github.com/rayners/fvtt-realms-and-reaches)** - Source code and issues
- **[Module Template](https://github.com/rayners/fvtt-realms-and-reaches/blob/main/docs/api-reference.md#examples)** - Integration examples

### Community

- **[Discord](https://discord.gg/foundryvtt)** - #modules channel for questions
- **[GitHub Discussions](https://github.com/rayners/fvtt-realms-and-reaches/discussions)** - Community sharing
- **[Reddit](https://reddit.com/r/FoundryVTT)** - General Foundry community

## 📋 Common Workflows

### Session Preparation
1. **[Draw key areas](user-guide.md#drawing-and-editing)** for upcoming locations
2. **[Add appropriate tags](user-guide.md#tag-management)** for travel and encounters
3. **[Test integrations](user-guide.md#campaign-integration)** with other modules
4. **[Export data](user-guide.md#data-management)** for backup

### During Play
1. **[Select realms](user-guide.md#interface-overview)** to check properties
2. **[Reference tags](user-guide.md#tag-management)** for mechanical effects
3. **[Add new areas](user-guide.md#drawing-and-editing)** discovered in play
4. **[Update properties](user-guide.md#tag-management)** based on events

### Post-Session
1. **[Review and update](user-guide.md#best-practices)** realm data
2. **[Add story elements](user-guide.md#tag-management)** as custom tags
3. **[Export changes](user-guide.md#data-management)** for backup
4. **[Plan future areas](user-guide.md#advanced-techniques)** to detail

## 🎯 Version Information

### Current Status: Alpha Release
- **Version**: 0.1.0
- **Status**: ✅ Feature complete for MVP
- **Compatibility**: Foundry VTT v13+
- **Stability**: Ready for testing and feedback

### What's Included
- ✅ Complete drawing and editing tools
- ✅ Comprehensive tag system
- ✅ Real-time properties editor
- ✅ Data import/export
- ✅ Developer API
- ✅ Full documentation

### What's Next
- 🔄 J&J integration (FOU-71)
- 📋 Community features
- 📋 Performance optimizations
- 📋 Additional drawing tools

*See [README → Development Roadmap](../README.md#development-roadmap) for details*

## 💡 Tips for Success

### Getting Started
- **Start simple**: Begin with basic biome and terrain tags
- **Use examples**: Follow the patterns in the Getting Started guide
- **Practice first**: Try the tools on a test scene before your main campaign

### Scaling Up
- **Plan your system**: Decide on tag conventions early
- **Document choices**: Keep notes on your tagging decisions
- **Regular backups**: Export data frequently

### Performance
- **Keep it simple**: Complex polygons slow down rendering
- **Focus on gameplay**: Only tag what affects mechanics
- **Test regularly**: Check performance with your typical usage

### Community
- **Share your work**: Export and share interesting realm datasets
- **Learn from others**: Import community-created content
- **Contribute back**: Report bugs and suggest improvements

## 📞 Getting Help

### Self-Help Resources
1. **[Troubleshooting sections](user-guide.md#troubleshooting)** in each guide
2. **[FAQ patterns](getting-started.md#common-questions)** in Getting Started
3. **[GitHub Issues](https://github.com/rayners/fvtt-realms-and-reaches/issues)** for known problems

### Community Support
1. **[Foundry Discord](https://discord.gg/foundryvtt)** - #modules channel
2. **[GitHub Discussions](https://github.com/rayners/fvtt-realms-and-reaches/discussions)** - Q&A
3. **[Reddit r/FoundryVTT](https://reddit.com/r/FoundryVTT)** - General community

### Bug Reports
**[Create an issue](https://github.com/rayners/fvtt-realms-and-reaches/issues/new)** with:
- Steps to reproduce the problem
- Your Foundry VTT version and browser
- Console error messages (if any)
- Screenshots (for visual issues)

---

**Welcome to Realms & Reaches!** 🗺️

This documentation represents the complete feature set available in version 0.1.0. The module is ready for alpha testing and feedback. Start with the Getting Started guide and work your way through the features at your own pace.

Happy realm building!