/**
 * Module Settings Registration
 */


export function registerSettings(): void {
  // Auto-save realms when modified
  game.settings.register('realms-and-reaches', 'autoSave', {
    name: 'Auto-save Realms',
    hint: 'Automatically save realm changes to scene flags',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  // Default realm tags
  game.settings.register('realms-and-reaches', 'defaultTags', {
    name: 'Default Realm Tags',
    hint: 'Comma-separated list of tags applied to new realms',
    scope: 'world', 
    config: true,
    type: String,
    default: 'biome:unknown'
  });

  // Enable grid snapping
  game.settings.register('realms-and-reaches', 'snapToGrid', {
    name: 'Snap to Grid',
    hint: 'Snap realm drawing to grid points',
    scope: 'client',
    config: true,
    type: Boolean,
    default: true
  });
}