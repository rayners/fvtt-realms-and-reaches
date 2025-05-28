/**
 * Realms & Reaches - Main Module Entry Point
 * 
 * A queryable biome and terrain layer for narrative-driven gameplay,
 * exploration mechanics, and system integration.
 */

// Type augmentations for Foundry VTT - only add what's missing
declare global {
  namespace foundry {
    namespace utils {
      function randomID(): string;
      function mergeObject(target: any, source: any, options?: any): any;
    }
  }
}

import { registerSettings } from './settings';
import { RealmManager } from './realm-manager';
import { RealmPropertiesDialog } from './realm-properties-dialog';
import * as API from './api';
import { TagSystem } from './tag-system';

// Import styles
import '../styles/realms-and-reaches.scss';

console.log('Realms & Reaches | Initializing module...');

/**
 * Initialize the module when Foundry is ready
 */
Hooks.once('init', async () => {
  console.log('Realms & Reaches | Module initialization started');
  
  // Register module settings
  registerSettings();
  
  // Note: Realm document types are automatically registered by Foundry
  // via the documentTypes field in module.json
  
  // Register module API with additional exports
  const moduleAPI = {
    ...API,
    RealmManager,
    RealmPropertiesDialog,
    TagSystem
  };
  (game.modules.get('realms-and-reaches') as any).api = moduleAPI;
  
  console.log('Realms & Reaches | Module initialization complete');
});

/**
 * Setup module after Foundry is fully ready
 */
Hooks.once('ready', async () => {
  console.log('Realms & Reaches | Module ready');
  
  // Initialize realm manager for current scene
  if (canvas?.scene) {
    RealmManager.getInstance().initialize(canvas.scene.id);
  }
  
  console.log('Realms & Reaches | Module setup complete');
});

/**
 * Handle scene changes and initialize realm data
 */
Hooks.on('canvasReady', (canvas) => {
  console.log('Realms & Reaches | Canvas ready - using built-in Region layer');
  
  // Load realm data for current scene
  if (canvas?.scene) {
    RealmManager.getInstance().initialize(canvas.scene.id);
  }
});

/**
 * Helper function to detect travel scale from scene distance units and grid type
 */
function detectTravelScale(scene: Scene): 'realm' | 'region' | 'none' {
  // Check if travel controls are disabled for this scene
  const travelEnabled = scene.getFlag('realms-and-reaches', 'travelEnabled');
  if (travelEnabled === false) return 'none';
  
  // Check for manual override first
  const manualScale = scene.getFlag('realms-and-reaches', 'travelScale');
  if (manualScale && ['realm', 'region', 'none'].includes(manualScale)) {
    return manualScale as 'realm' | 'region' | 'none';
  }
  
  // Auto-detect based on grid type and distance units
  const distanceUnit = scene.grid?.units?.toLowerCase() || '';
  const gridType = scene.grid?.type; // FOUNDRY_GRID_TYPES: GRIDLESS=0, SQUARE=1, HEXAGONAL=2
  
  // Grid type takes precedence - hex grids are for overland travel
  if (gridType === 2) { // HEXAGONAL
    return 'realm';
  }
  
  // Square grids are for tactical/local scale
  if (gridType === 1) { // SQUARE  
    return 'region';
  }
  
  // Fallback to distance units for gridless scenes
  // Realm scale: kilometers, miles, leagues
  if (distanceUnit.includes('km') || 
      distanceUnit.includes('kilometer') || 
      distanceUnit.includes('mile') || 
      distanceUnit.includes('league')) {
    return 'realm';
  }
  
  // Region scale: feet, meters, yards
  if (distanceUnit.includes('ft') || 
      distanceUnit.includes('feet') || 
      distanceUnit.includes('m') || 
      distanceUnit.includes('meter') || 
      distanceUnit.includes('yard')) {
    return 'region';
  }
  
  // Default to none if no recognizable indicators
  return 'none';
}

/**
 * Add intelligent travel controls based on scene scale detection
 */
Hooks.on('getSceneControlButtons', (controls: Record<string, any>) => {
  // Only show controls if user is GM
  if (!game.user?.isGM) return;

  // Get current scene
  const currentScene = canvas.scene;
  if (!currentScene) return;

  const travelScale = detectTravelScale(currentScene);
  
  // Only add controls if travel scale is detected
  if (travelScale === 'none') return;

  const tools: any[] = [];
  
  if (travelScale === 'realm') {
    tools.push(
      {
        name: 'realm-select',
        title: 'Select Realm',
        icon: 'fas fa-mountain',
        onClick: () => {
          // Activate regions layer and enable select tool
          if ((canvas as any)?.regions) {
            (canvas as any).regions.activate();
            ui.notifications?.info('Click on a realm to select it');
          }
        },
        button: true
      },
      {
        name: 'realm-create',
        title: 'Create Realm',
        icon: 'fas fa-plus',
        onClick: () => openRealmCreationDialog(),
        button: true
      }
    );
  } else if (travelScale === 'region') {
    tools.push(
      {
        name: 'region-select',
        title: 'Select Region',
        icon: 'fas fa-map',
        onClick: () => {
          // Activate regions layer and enable select tool
          if ((canvas as any)?.regions) {
            (canvas as any).regions.activate();
            ui.notifications?.info('Click on a region to select it');
          }
        },
        button: true
      },
      {
        name: 'region-create', 
        title: 'Create Region',
        icon: 'fas fa-plus',
        onClick: () => {
          // For regions, create standard regions (not realms)
          if ((canvas as any)?.regions) {
            (canvas as any).regions.activate();
            ui.notifications?.info('Use the standard region tools to create local areas');
          }
        },
        button: true
      }
    );
  }

  // Add the travel controls group
  if (tools.length > 0) {
    controls['realms-travel'] = {
      name: 'realms-travel',
      title: `${travelScale.charAt(0).toUpperCase() + travelScale.slice(1)} Travel`,
      icon: travelScale === 'realm' ? 'fas fa-mountain' : 'fas fa-map',
      layer: 'RegionLayer',
      tools: tools.reduce((acc, tool) => {
        acc[tool.name] = tool;
        return acc;
      }, {})
    };
  }
});

/**
 * Add travel scale configuration to scene config form
 */
Hooks.on('renderSceneConfig', (app: any, html: any, data: any) => {
  // Only show for GMs
  if (!game.user?.isGM) return;

  // Helper function for auto-detection display
  const autoDetectTravelScale = (scene: Scene): 'realm' | 'region' | 'none' => {
    const distanceUnit = scene.grid?.units?.toLowerCase() || '';
    const gridType = scene.grid?.type;
    
    if (gridType === 2) return 'realm'; // HEXAGONAL
    if (gridType === 1) return 'region'; // SQUARE
    
    if (distanceUnit.includes('km') || distanceUnit.includes('kilometer') || 
        distanceUnit.includes('mile') || distanceUnit.includes('league')) {
      return 'realm';
    }
    
    if (distanceUnit.includes('ft') || distanceUnit.includes('feet') || 
        distanceUnit.includes('m') || distanceUnit.includes('meter') || 
        distanceUnit.includes('yard')) {
      return 'region';
    }
    
    return 'none';
  };

  // Get current settings
  const travelEnabled = app.object.getFlag('realms-and-reaches', 'travelEnabled') !== false;
  const manualScale = app.object.getFlag('realms-and-reaches', 'travelScale') || 'auto';
  const autoDetected = autoDetectTravelScale(app.object);
  
  const travelControlsHtml = `
    <div class="form-group">
      <label>Travel Controls</label>
      <input type="checkbox" name="flags.realms-and-reaches.travelEnabled" ${travelEnabled ? 'checked' : ''}>
      <label class="checkbox">Enable travel controls for this scene</label>
    </div>
    <div class="form-group">
      <label>Travel Scale</label>
      <select name="flags.realms-and-reaches.travelScale">
        <option value="auto" ${manualScale === 'auto' ? 'selected' : ''}>Auto-detect</option>
        <option value="realm" ${manualScale === 'realm' ? 'selected' : ''}>Realm</option>
        <option value="region" ${manualScale === 'region' ? 'selected' : ''}>Region</option>
        <option value="none" ${manualScale === 'none' ? 'selected' : ''}>None</option>
      </select>
      <p class="notes">
        Auto-detect uses grid type (hex=Realm, square=Region) and distance units (km/miles=Realm, ft/meters=Region).
        Current auto-detection: <strong>${autoDetected === 'none' ? 'None (unrecognized grid/units)' : autoDetected.charAt(0).toUpperCase() + autoDetected.slice(1)}</strong>
      </p>
    </div>
  `;
  
  // Convert html to jQuery if it's not already
  const $html = html.jquery ? html : $(html);
  
  // Insert after the "Initial View Position" section
  const insertAfter = $html.find('input[name="initial.scale"]').closest('.form-group');
  if (insertAfter.length) {
    insertAfter.after(travelControlsHtml);
  } else {
    // Fallback: insert at the end of the first tab
    $html.find('.tab[data-tab="basic"] .form-group').last().after(travelControlsHtml);
  }
});

/**
 * Create a realm using the specified tool
 */
function createRealmTool(toolType: 'polygon' | 'rectangle' | 'circle') {
  console.log('Realms & Reaches | Creating realm with tool:', toolType);
  
  try {
    // Activate the regions layer
    if (!(canvas as any)?.regions) {
      ui.notifications?.error('Regions layer not available');
      return;
    }
    
    (canvas as any).regions.activate();
    ui.notifications?.info(`Draw your ${toolType} realm shape, then right-click or press Enter to finish`);
    
    // For now, let's use the standard Region creation and convert it afterwards
    // We'll hook into the region creation to set the proper type
    const originalCreate = (canvas as any).scene.createEmbeddedDocuments;
    (canvas as any).scene.createEmbeddedDocuments = async function(documentType: string, data: any[], options: any = {}) {
      if (documentType === 'Region' && Array.isArray(data)) {
        // Modify region data to be realm (using flags instead of type)
        data = data.map(regionData => ({
          ...regionData,
          name: regionData.name || 'New Realm',
          color: regionData.color || '#ff6b35',
          flags: {
            ...regionData.flags,
            'realms-and-reaches': {
              isRealm: true,
              tags: [],
              metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                author: (game as any).user?.name || 'Unknown'
              }
            }
          }
        }));
      }
      
      const result = await originalCreate.call(this, documentType, data, options);
      
      // Restore original function
      (canvas as any).scene.createEmbeddedDocuments = originalCreate;
      
      // Open realm properties for the created realm
      if (documentType === 'Region' && result.length > 0) {
        setTimeout(() => {
          RealmPropertiesDialog.open(result[0]);
        }, 100);
      }
      
      return result;
    };
    
  } catch (error) {
    console.error('Realms & Reaches | Error in createRealmTool:', error);
    ui.notifications?.error('Failed to start realm creation');
  }
}

/**
 * Open realm creation dialog
 */
function openRealmCreationDialog() {
  console.log('Realms & Reaches | Opening realm creation dialog');
  
  const dialog = new Dialog({
    title: 'Create Realm',
    content: `
      <form>
        <div class="form-group">
          <label>Realm Name:</label>
          <input type="text" name="name" value="New Realm" />
        </div>
        <div class="form-group">
          <label>Creation Method:</label>
          <select name="method">
            <option value="polygon">Draw Polygon</option>
            <option value="rectangle">Draw Rectangle</option>
            <option value="circle">Draw Circle</option>
            <option value="properties">Properties Only</option>
          </select>
        </div>
      </form>
    `,
    buttons: {
      create: {
        label: 'Create',
        callback: (html: any) => {
          console.log('Realms & Reaches | Create button clicked');
          try {
            const form = html.find('form')[0];
            if (!form) {
              console.error('Realms & Reaches | Form not found');
              return;
            }
            
            const formData = new FormData(form);
            const name = formData.get('name') as string;
            const method = formData.get('method') as string;
            
            console.log('Realms & Reaches | Form data:', { name, method });
            
            if (method === 'properties') {
              // Create a small default realm and open properties
              createDefaultRealm(name);
            } else {
              // Start drawing workflow
              createRealmTool(method as any);
            }
          } catch (error) {
            console.error('Realms & Reaches | Error in dialog callback:', error);
            ui.notifications?.error('Failed to process realm creation');
          }
        }
      },
      cancel: {
        label: 'Cancel',
        callback: () => {
          console.log('Realms & Reaches | Dialog cancelled');
        }
      }
    },
    default: 'create'
  });
  
  dialog.render(true);
}

/**
 * Create a default realm and open properties
 */
async function createDefaultRealm(name: string) {
  console.log('Realms & Reaches | Creating default realm:', name);
  
  try {
    const scene = (canvas as any)?.scene;
    if (!scene) {
      ui.notifications?.error('No active scene found');
      return;
    }
    
    // Create a small default polygon in the center of the scene
    const centerX = scene.width / 2;
    const centerY = scene.height / 2;
    const size = 200;
    
    const regionData = {
      name: name || 'New Realm',
      color: '#ff6b35',
      shapes: [{
        type: 'polygon',
        points: [
          centerX - size, centerY - size,
          centerX + size, centerY - size,
          centerX + size, centerY + size,
          centerX - size, centerY + size
        ]
      }],
      flags: {
        'realms-and-reaches': {
          isRealm: true,
          tags: [],
          metadata: {
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            author: (game as any).user?.name || 'Unknown'
          }
        }
      }
    };
    
    console.log('Realms & Reaches | Creating region with data:', regionData);
    
    const regions = await scene.createEmbeddedDocuments('Region', [regionData]);
    console.log('Realms & Reaches | Created regions:', regions);
    
    if (regions.length > 0) {
      setTimeout(() => {
        RealmPropertiesDialog.open(regions[0]);
      }, 100);
      ui.notifications?.info('Realm created! Adjust the shape and add tags in the properties dialog.');
    } else {
      ui.notifications?.error('Failed to create realm region');
    }
  } catch (error) {
    console.error('Realms & Reaches | Error creating default realm:', error);
    ui.notifications?.error('Failed to create realm: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Add context menu option to regions for realm properties
 */
Hooks.on('getRegionContextOptions', (html: JQuery, options: any[]) => {
  // Add "Realm Properties" option for realm-flagged regions
  options.push({
    name: 'Realm Properties',
    icon: '<i class="fas fa-cog"></i>',
    condition: (li: JQuery) => {
      const regionId = li.data('document-id');
      const region = canvas?.scene?.regions.get(regionId);
      return region?.flags?.['realms-and-reaches']?.isRealm === true;
    },
    callback: (li: JQuery) => {
      const regionId = li.data('document-id');
      const region = canvas?.scene?.regions.get(regionId);
      if (region && region.flags?.['realms-and-reaches']?.isRealm) {
        RealmPropertiesDialog.open(region as any);
      }
    }
  });
});

/**
 * Optionally override Region sheet for realm types to show custom UI
 */
Hooks.on('renderRegionConfig', (app: any, html: any, data: any) => {
  try {
    const region = app.document;
    if (!region?.flags?.['realms-and-reaches']?.isRealm) {
      return;
    }
    
    // Convert html to jQuery if it's not already
    const $html = html.jquery ? html : $(html);
    
    // Add a "Realm Tags" section to the Identity tab
    const identityTab = $html.find('.tab[data-tab="identity"]');
    if (identityTab.length) {
      const tags = region.flags['realms-and-reaches']?.tags || [];
      const tagsHtml = `
        <div class="form-group">
          <label>Realm Tags</label>
          <div class="realm-tags-display">
            ${tags.map((tag: string) => `<span class="realm-tag">${tag}</span>`).join('')}
          </div>
          <button type="button" class="edit-realm-tags">
            <i class="fas fa-edit"></i> Edit Realm Properties
          </button>
        </div>
      `;
      identityTab.append(tagsHtml);
      
      // Add click handler for edit button
      $html.find('.edit-realm-tags').on('click', () => {
        RealmPropertiesDialog.open(region as any);
      });
    }
  } catch (error) {
    console.error('Realms & Reaches | Error in renderRegionConfig hook:', error);
  }
});