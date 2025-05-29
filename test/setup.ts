/**
 * Test setup for Realms & Reaches
 * 
 * Uses the shared foundry-mocks.ts for comprehensive Foundry VTT mocking.
 */

import { setupFoundryMocks, createMockScene, createMockRegion } from './foundry-mocks';

// Set up Foundry mocks with R&R-specific configuration
setupFoundryMocks({
  systemId: 'dnd5e', // R&R typically works with D&D 5e
  user: { isGM: true, id: 'test-gm' },
  includeCanvas: true, // R&R needs canvas for region layer
  includeRegions: true
});

// Ensure foundry.utils.randomID is available for realm-data.ts
if (!globalThis.foundry?.utils?.randomID) {
  console.error('foundry.utils.randomID not available!', globalThis.foundry?.utils);
}

// R&R-specific enhancements
if (globalThis.game) {
  // Create a test scene with regions support
  const testScene = createMockScene({
    id: 'test-scene',
    name: 'Test Scene',
    width: 4000,
    height: 3000
  });

  // Add a test region
  const testRegion = createMockRegion({
    id: 'test-region',
    name: 'Test Realm',
    flags: {
      'realms-and-reaches': {
        isRealm: true,
        tags: ['forest', 'dangerous']
      }
    }
  });

  testScene.regions.set(testRegion.id, testRegion);
  globalThis.game.scenes.set(testScene.id, testScene);

  // Set up canvas with the test scene
  if (globalThis.canvas) {
    globalThis.canvas.scene = testScene;
    globalThis.canvas.regions = {
      activate: () => {},
      deactivate: () => {}
    };
  }
}
