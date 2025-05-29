# Testing Guide for Realms & Reaches

This directory contains the test suite for the Realms & Reaches Foundry VTT module.

## Shared Foundry Mock Setup

### `foundry-mocks.ts` - Comprehensive Mock Library
A shared, reusable mock setup for Foundry VTT that provides:

- **Document Classes**: Actor, RollTable, Folder, Dialog, ChatMessage
- **Region Support**: Complete Scene.regions collection with filter() method
- **Canvas Layer**: PIXI graphics, CanvasLayer, RegionLayer mocking
- **Foundry Globals**: game, ui, canvas, CONFIG, foundry, Hooks  
- **Utility Functions**: All foundry.utils methods including randomID()

**Key Features:**
- ✅ **Shared between projects** - Used by both J&J and R&R
- ✅ **Complete Region support** - Mock Scene.regions collection
- ✅ **Canvas/Layer mocking** - Full PIXI and layer system
- ✅ **Document creation** - Async create/update/delete methods
- ✅ **System agnostic** - Works with any game system

**Usage:**
```typescript
import { setupFoundryMocks, createMockScene, createMockRegion } from './foundry-mocks';

setupFoundryMocks({
  systemId: 'dnd5e',
  user: { isGM: true },
  includeCanvas: true
});
```

### `setup.ts` - R&R Specific Configuration
Project-specific setup that configures the shared mocks for Realms & Reaches needs:
- Canvas and region layer support
- Test scenes with region collections
- GM user by default
- PIXI graphics mocking

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test realm-manager

# Run with verbose output
npm test -- --reporter=verbose
```

## Test Structure

### Mock Factories
- `createMockScene()` - Scene with regions Map that supports filter()
- `createMockRegion()` - Region documents with flags and testPoint()
- `createMockActor()` - Actor documents with proper structure

### Resolved Issues

#### Region Collection Support ✅
The mock scenes now include a proper regions collection that supports:
- `Map` interface with `get()`, `set()`, `has()`, etc.
- `filter()` method for querying regions (like Foundry's Collection class)
- Proper iteration support for `for...of` loops

#### foundry.utils.randomID() ✅
- Properly mocked foundry.utils.randomID() function
- No more "randomID is not a function" errors
- Used by RealmData constructor for generating IDs

#### Scene Document Creation ✅
- Mock scenes support createEmbeddedDocuments() and deleteEmbeddedDocuments()
- Proper async behavior with resolved promises
- Support for Region document type

## Test Files

### `realm-manager.test.ts`
Tests the core RealmManager functionality:
- Instance management and singleton behavior
- CRUD operations for realms
- Spatial queries (point-in-polygon, etc.)
- Data persistence and export/import
- Event system integration

### `realm-properties-dialog.test.ts`
Tests the RealmPropertiesDialog class:
- Data preparation and validation
- Dialog configuration and rendering
- Tag system integration
- Form submission handling

### `tag-system.test.ts`
Tests the tag system functionality:
- Tag validation and formatting
- Namespace management
- Tag suggestions and autocomplete
- Conflict detection

### `realm-data.test.ts`
Tests the RealmData class:
- Data model construction
- Tag management
- Geometry handling
- Metadata tracking

### `module.test.ts`
Tests module initialization and integration:
- Module registration
- Hook setup
- API exposure

## Best Practices

### Region Testing
```typescript
// Create a scene with region support
const scene = createMockScene();
const region = createMockRegion({
  flags: { 'realms-and-reaches': { isRealm: true } }
});
scene.regions.set(region.id, region);

// Test region filtering (this now works!)
const realms = scene.regions.filter(r => 
  r.flags['realms-and-reaches']?.isRealm
);
```

### Document Creation Testing
```typescript
// Mock document creation
scene.createEmbeddedDocuments.mockResolvedValue([newRegion]);

// Test the creation
const result = await manager.createRealm({ name: 'Test' });
expect(scene.createEmbeddedDocuments).toHaveBeenCalledWith('Region', [
  expect.objectContaining({ name: 'Test' })
]);
```

### Canvas/Layer Testing
```typescript
// Canvas layer activation works properly
canvas.regions.activate();

// PIXI graphics are mocked
const graphics = new PIXI.Graphics();
graphics.beginFill(0xff0000);
```

## Debugging Tips

1. **Use console.log** in test setup to verify mock state
2. **Check mock function calls** with `expect().toHaveBeenCalledWith()`
3. **Verify mock return values** match expected structure
4. **Test async operations** with proper await syntax

## Coverage Goals

- **Core realm management**: 90%+ coverage
- **Tag system**: 85%+ coverage  
- **Dialog system**: 80%+ coverage
- **Edge cases and error handling**: 100% coverage

## Integration with J&J

The shared foundry-mocks.ts allows both R&R and J&J to:
- Share common Foundry API mocking
- Reduce duplicate mock code
- Ensure consistent test environments
- Easily add new Foundry API support