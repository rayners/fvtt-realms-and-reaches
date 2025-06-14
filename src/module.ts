/**
 * Realms & Reaches - Main Module Entry Point
 *
 * A queryable biome and terrain layer for narrative-driven gameplay,
 * exploration mechanics, and system integration.
 */

// Type augmentations for Foundry VTT - only add what's missing
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace foundry {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace utils {
      function randomID(): string;
      function mergeObject(target: any, source: any, options?: any): any;
    }
  }
}

import { registerSettings } from './settings';
import { RealmManager } from './realm-manager';
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
Hooks.on('canvasReady', canvas => {
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

  // Debug logging to understand the detection
  console.log('Realms & Reaches | Main travel scale detection:', {
    distanceUnit,
    gridType,
    sceneId: scene.id,
    sceneName: scene.name
  });

  // Grid type takes precedence - hex grids are for overland travel
  // All hex grid types: HEXODDR=2, HEXEVENR=3, HEXODDQ=4, HEXEVENQ=5
  if (gridType >= 2 && gridType <= 5) {
    // HEXAGONAL (any variant)
    console.log('Realms & Reaches | Detected realm scale by hex grid (type:', gridType, ')');
    return 'realm';
  }

  // Square grids are for tactical/local scale
  if (gridType === 1) {
    // SQUARE
    console.log('Realms & Reaches | Detected region scale by square grid');
    return 'region';
  }

  // Fallback to distance units for gridless scenes
  // Realm scale: kilometers, miles, leagues
  if (
    distanceUnit.includes('km') ||
    distanceUnit.includes('kilometer') ||
    distanceUnit.includes('mile') ||
    distanceUnit.includes('league')
  ) {
    console.log('Realms & Reaches | Detected realm scale by distance unit');
    return 'realm';
  }

  // Region scale: feet, meters, yards
  if (
    distanceUnit.includes('ft') ||
    distanceUnit.includes('feet') ||
    distanceUnit.includes('m') ||
    distanceUnit.includes('meter') ||
    distanceUnit.includes('yard')
  ) {
    console.log('Realms & Reaches | Detected region scale by distance unit');
    return 'region';
  }

  // Default to none if no recognizable indicators
  console.log('Realms & Reaches | No travel scale detected');
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
Hooks.on('renderSceneConfig', (app: any, html: any, _data: any) => {
  console.log('Calling into renderSceneConfig');
  // Only show for GMs
  if (!game.user?.isGM) return;

  // Ensure we have a valid scene object
  //if (!app?.object) return;

  // Helper function for auto-detection display
  const autoDetectTravelScale = (scene: Scene): 'realm' | 'region' | 'none' => {
    if (!scene) return 'none';

    const distanceUnit = scene.grid?.units?.toLowerCase() || '';
    const gridType = scene.grid?.type;

    // Debug logging to understand the detection
    console.log('Realms & Reaches | Travel scale detection:', {
      distanceUnit,
      gridType,
      sceneId: scene.id,
      sceneName: scene.name
    });

    // All hex grid types: HEXODDR=2, HEXEVENR=3, HEXODDQ=4, HEXEVENQ=5
    if (gridType >= 2 && gridType <= 5) {
      console.log('Realms & Reaches | Detected realm scale by hex grid (type:', gridType, ')');
      return 'realm'; // HEXAGONAL (any variant)
    }
    if (gridType === 1) return 'region'; // SQUARE

    if (
      distanceUnit.includes('km') ||
      distanceUnit.includes('kilometer') ||
      distanceUnit.includes('mile') ||
      distanceUnit.includes('league')
    ) {
      console.log('Realms & Reaches | Detected realm scale by distance unit');
      return 'realm';
    }

    if (
      distanceUnit.includes('ft') ||
      distanceUnit.includes('feet') ||
      distanceUnit.includes('m') ||
      distanceUnit.includes('meter') ||
      distanceUnit.includes('yard')
    ) {
      console.log('Realms & Reaches | Detected region scale by distance unit');
      return 'region';
    }

    console.log('Realms & Reaches | No travel scale detected');
    return 'none';
  };

  // Get current settings with null checks
  const travelEnabled = app.getFlag?.('realms-and-reaches', 'travelEnabled') !== false;
  const manualScale = app.getFlag?.('realms-and-reaches', 'travelScale') || 'auto';
  const autoDetected = autoDetectTravelScale(app.document);

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

  // Debug: Log what we find in the HTML
  console.log('Realms & Reaches | Scene Config Debug:', {
    hasBasicsTab: $html.find('.tab[data-tab="basics"]').length > 0,
    hasInitialViewLabel: $html.find('label:contains("Initial View")').length > 0,
    hasScaleInput: $html.find('input[id$="initial.scale"]').length > 0,
    allTabs: $html
      .find('.tab')
      .map((i, el) => $(el).attr('data-tab'))
      .get(),
    allLabels: $html
      .find('label')
      .map((i, el) => $(el).text().trim())
      .get()
      .slice(0, 10)
  });

  // Insert after the "Initial View Position" section
  // Look for the Initial View form group by its actual rendered label text
  const insertAfter = $html.find('label:contains("Initial View Position")').closest('.form-group');
  if (insertAfter.length) {
    console.log('Realms & Reaches | Inserting after Initial View Position label');
    insertAfter.after(travelControlsHtml);
  } else {
    // Fallback: look for "Initial View" (in case the text varies)
    const initialViewFallback = $html.find('label:contains("Initial View")').closest('.form-group');
    if (initialViewFallback.length) {
      console.log('Realms & Reaches | Inserting after Initial View label (fallback)');
      initialViewFallback.after(travelControlsHtml);
    } else {
      // Secondary fallback: look for initial scale input by name pattern
      const scaleInput = $html.find('input[name="initial.scale"]').closest('.form-group');
      if (scaleInput.length) {
        console.log('Realms & Reaches | Inserting after scale input');
        scaleInput.after(travelControlsHtml);
      } else {
        // Final fallback: insert at the end of any available tab
        const firstTab = $html.find('.tab').first();
        if (firstTab.length) {
          console.log('Realms & Reaches | Inserting at end of first tab');
          firstTab.append(travelControlsHtml);
        } else {
          console.log('Realms & Reaches | No suitable insertion point found');
        }
      }
    }
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
    ui.notifications?.info(
      `Draw your ${toolType} realm shape, then right-click or press Enter to finish`
    );

    // For now, let's use the standard Region creation and convert it afterwards
    // We'll hook into the region creation to set the proper type
    const originalCreate = (canvas as any).scene.createEmbeddedDocuments;
    (canvas as any).scene.createEmbeddedDocuments = async function (
      documentType: string,
      data: any[],
      options: any = {}
    ) {
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
          result[0].sheet.render(true);
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
      shapes: [
        {
          type: 'polygon',
          points: [
            centerX - size,
            centerY - size,
            centerX + size,
            centerY - size,
            centerX + size,
            centerY + size,
            centerX - size,
            centerY + size
          ]
        }
      ],
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
        regions[0].sheet.render(true);
      }, 100);
      ui.notifications?.info(
        'Realm created! Adjust the shape and add tags in the properties dialog.'
      );
    } else {
      ui.notifications?.error('Failed to create realm region');
    }
  } catch (error) {
    console.error('Realms & Reaches | Error creating default realm:', error);
    ui.notifications?.error(
      'Failed to create realm: ' + (error instanceof Error ? error.message : String(error))
    );
  }
}

/**
 * Auto-convert regions to realms in realm-scale scenes
 */
Hooks.on('createRegion', async (region: any, _options: any, _userId: string) => {
  console.log('Realms & Reaches | createRegion hook called for:', region);

  // Only process for GMs
  if (!game.user?.isGM) return;

  // Check if this scene is realm-scale
  const scene = region.parent;
  if (!scene) return;

  const travelScale = detectTravelScale(scene);
  console.log('Realms & Reaches | Scene travel scale:', travelScale);

  // Auto-convert to realm if scene is realm-scale
  if (travelScale === 'realm') {
    console.log('Realms & Reaches | Auto-converting region to realm');

    try {
      await region.setFlag('realms-and-reaches', 'isRealm', true);
      await region.setFlag('realms-and-reaches', 'tags', []);
      await region.setFlag('realms-and-reaches', 'metadata', {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        author: (game as any).user?.name || 'Unknown'
      });

      console.log('Realms & Reaches | Successfully converted region to realm');
      ui.notifications?.info('Region converted to realm automatically');
    } catch (error) {
      console.error('Realms & Reaches | Failed to convert region to realm:', error);
    }
  }
});

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
        region.sheet.render(true);
      }
    }
  });

  // Add "Convert to Realm" option for standard regions (GM only)
  if (game.user?.isGM) {
    options.push({
      name: 'Convert to Realm',
      icon: '<i class="fas fa-mountain"></i>',
      condition: (li: JQuery) => {
        const regionId = li.data('document-id');
        const region = canvas?.scene?.regions.get(regionId);
        return region?.flags?.['realms-and-reaches']?.isRealm !== true;
      },
      callback: async (li: JQuery) => {
        const regionId = li.data('document-id');
        const region = canvas?.scene?.regions.get(regionId);
        if (region) {
          try {
            await region.setFlag('realms-and-reaches', 'isRealm', true);
            await region.setFlag('realms-and-reaches', 'tags', []);
            await region.setFlag('realms-and-reaches', 'metadata', {
              created: new Date().toISOString(),
              modified: new Date().toISOString(),
              author: (game as any).user?.name || 'Unknown'
            });
            ui.notifications?.info(`"${region.name}" converted to realm`);
          } catch (error) {
            console.error('Failed to convert region to realm:', error);
            ui.notifications?.error('Failed to convert region to realm');
          }
        }
      }
    });

    // Add "Convert to Standard Region" option for realms
    options.push({
      name: 'Convert to Standard Region',
      icon: '<i class="fas fa-map"></i>',
      condition: (li: JQuery) => {
        const regionId = li.data('document-id');
        const region = canvas?.scene?.regions.get(regionId);
        return region?.flags?.['realms-and-reaches']?.isRealm === true;
      },
      callback: async (li: JQuery) => {
        const regionId = li.data('document-id');
        const region = canvas?.scene?.regions.get(regionId);
        if (region) {
          try {
            await region.unsetFlag('realms-and-reaches', 'isRealm');
            await region.unsetFlag('realms-and-reaches', 'tags');
            await region.unsetFlag('realms-and-reaches', 'metadata');
            ui.notifications?.info(`"${region.name}" converted to standard region`);
          } catch (error) {
            console.error('Failed to convert realm to standard region:', error);
            ui.notifications?.error('Failed to convert realm to standard region');
          }
        }
      }
    });
  }
});

/**
 * Customize Region Legend dialog for realm regions
 */
Hooks.on('renderRegionLegend', (app: any, html: any, _data: any) => {
  console.log('Realms & Reaches | renderRegionLegend hook called');

  try {
    // Check if we have any realm regions in the current scene
    const scene = canvas?.scene;
    if (!scene) return;

    const realmRegions = scene.regions.filter(
      (region: any) => region.flags?.['realms-and-reaches']?.isRealm === true
    );

    if (realmRegions.length === 0) {
      console.log('Realms & Reaches | No realm regions found, skipping legend customization');
      return;
    }

    console.log(
      'Realms & Reaches | Found',
      realmRegions.length,
      'realm regions, customizing legend'
    );

    // Convert html to jQuery if it's not already
    const $html = html.jquery ? html : $(html);

    // Update dialog title from localized "Region Legend" to "Realm Legend"
    const windowTitle = $html.closest('.window').find('.window-title');
    if (windowTitle.length) {
      const regionText = game.i18n.localize('DOCUMENT.Region');
      const legendText = game.i18n.localize('CONTROLS.LegendTitle') || 'Legend';
      const currentTitle = windowTitle.text();

      if (currentTitle.includes(regionText)) {
        const newTitle = currentTitle.replace(regionText, 'Realm');
        windowTitle.text(newTitle);
        console.log('Realms & Reaches | Updated legend title from:', currentTitle, 'to:', newTitle);
      }
    }

    // Add realm-specific styling to the legend
    $html.addClass('realm-legend');

    // Add a header note about realms if we have realm regions
    const headerNote = `
      <div class="realm-legend-note">
        <i class="fas fa-mountain" style="color: #ff6b35; margin-right: 6px;"></i>
        <span style="color: var(--color-text-primary, #c9c7b8); font-size: 0.9em;">
          This scene contains ${realmRegions.length} realm region${realmRegions.length !== 1 ? 's' : ''} with travel properties
        </span>
      </div>
    `;

    // Insert the note at the top of the legend content
    const legendContent = $html.find('.window-content').first();
    if (legendContent.length) {
      legendContent.prepend(headerNote);
    }

    // Style realm regions differently in the legend
    realmRegions.forEach((region: any) => {
      const regionEntry = $html.find(`[data-region-id="${region.id}"]`);
      if (regionEntry.length) {
        regionEntry.addClass('realm-legend-entry');

        // Add realm icon if not already present
        const nameElement = regionEntry.find('.region-name, .name');
        if (nameElement.length && !nameElement.find('.fa-mountain').length) {
          nameElement.prepend(
            '<i class="fas fa-mountain realm-icon" style="color: #ff6b35; margin-right: 4px; font-size: 0.8em;"></i>'
          );
        }

        // Add tag info if available
        const tags = region.flags['realms-and-reaches']?.tags || [];
        if (tags.length > 0) {
          const tagPreview = tags.slice(0, 3).join(', ') + (tags.length > 3 ? '...' : '');
          const tagInfo = `<div class="realm-tags-preview" style="font-size: 0.75em; color: var(--color-text-dark-secondary, #888); margin-top: 2px;">${tagPreview}</div>`;

          const existingPreview = regionEntry.find('.realm-tags-preview');
          if (existingPreview.length) {
            existingPreview.replaceWith(tagInfo);
          } else {
            regionEntry.append(tagInfo);
          }
        }
      }
    });
  } catch (error) {
    console.error('Realms & Reaches | Error in renderRegionLegend hook:', error);
  }
});

/**
 * Replace Behaviors tab for realm regions with realm tag editing
 */
Hooks.on('renderRegionConfig', (app: any, html: any, _data: any) => {
  console.log('Realms & Reaches | renderRegionConfig hook called');

  try {
    const region = app.document;
    console.log('Realms & Reaches | Region document:', region);
    console.log('Realms & Reaches | Region flags:', region?.flags);
    console.log('Realms & Reaches | Is realm?:', region?.flags?.['realms-and-reaches']?.isRealm);

    if (!region?.flags?.['realms-and-reaches']?.isRealm) {
      console.log('Realms & Reaches | Not a realm region, skipping');
      return;
    }

    // Convert html to jQuery if it's not already
    const $html = html.jquery ? html : $(html);

    // Debug: Log what we find in the HTML
    console.log('Realms & Reaches | Region Config Debug:', {
      allTabs: $html
        .find('.tab')
        .map((i, el) => $(el).attr('data-tab'))
        .get(),
      allNavTabs: $html
        .find('nav.sheet-navigation a')
        .map((i, el) => ({
          tab: $(el).attr('data-tab'),
          text: $(el).text().trim()
        }))
        .get(),
      behaviorsTab: $html.find('.tab[data-tab="behaviors"]').length > 0,
      behaviorsTabNav: $html.find('nav.sheet-navigation a[data-tab="behaviors"]').length > 0,
      htmlStructure: {
        hasNav: $html.find('nav.sheet-navigation').length > 0,
        hasTabContent: $html.find('.tab-content, .window-content').length > 0,
        allTabSelectors: [
          $html.find('.tab[data-tab="behavior"]').length,
          $html.find('.tab[data-tab="behaviors"]').length,
          $html.find('section[data-tab="behaviors"]').length,
          $html.find('div[data-tab="behaviors"]').length
        ]
      }
    });

    // Replace the Behaviors tab content with realm tag editing
    // Try both 'behavior' and 'behaviors' since the debug shows 'behaviors'
    let behaviorsTab = $html.find('.tab[data-tab="behaviors"]');
    if (!behaviorsTab.length) {
      behaviorsTab = $html.find('.tab[data-tab="behavior"]');
    }
    if (!behaviorsTab.length) {
      behaviorsTab = $html.find('section[data-tab="behaviors"]');
    }
    if (!behaviorsTab.length) {
      behaviorsTab = $html.find('div[data-tab="behaviors"]');
    }
    if (behaviorsTab.length) {
      console.log('Realms & Reaches | Found behaviors tab, replacing content');
      const tags = region.flags['realms-and-reaches']?.tags || [];

      // Create realm tag editing interface
      const realmTagsHtml = `
        <div class="realm-tags-editor">
          <div class="form-group">
            <label>Realm Tags</label>
            <p class="notes">Tags define biome, terrain, and travel properties for this realm.</p>
            
            <!-- Existing Tags -->
            <div class="tag-list">
              ${tags
                .map(
                  (tag: string) => `
                <div class="tag-item" data-tag="${tag}">
                  <span class="tag-text">${tag}</span>
                  <button type="button" class="tag-remove" data-tag="${tag}" title="Remove Tag">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              `
                )
                .join('')}
            </div>
            
            <!-- Add New Tag Section -->
            <div class="tag-input-section">
              <label class="input-label">Add New Tag</label>
              <div class="tag-input-group">
                <input type="text" id="new-realm-tag" placeholder="key:value (e.g., biome:forest)" list="realm-tag-suggestions">
                <button type="button" id="add-realm-tag" title="Add Tag">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
            
            <!-- Tag Suggestions -->
            <datalist id="realm-tag-suggestions">
              <!-- Options populated dynamically -->
            </datalist>
          </div>
        </div>
      `;

      // Replace the tab content
      behaviorsTab.empty().append(realmTagsHtml);

      // Update tab label to "Realm Tags" with mountain icon
      let behaviorsTabNav = $html.find('nav.sheet-tabs.tabs a[data-tab="behaviors"]');
      if (!behaviorsTabNav.length) {
        behaviorsTabNav = $html.find('nav.sheet-tabs.tabs a[data-tab="behavior"]');
      }
      // Fallback to old selector structure
      if (!behaviorsTabNav.length) {
        behaviorsTabNav = $html.find('nav.sheet-navigation a[data-tab="behaviors"]');
      }
      if (!behaviorsTabNav.length) {
        behaviorsTabNav = $html.find('nav.sheet-navigation a[data-tab="behavior"]');
      }
      if (behaviorsTabNav.length) {
        behaviorsTabNav.html(
          '<i class="fas fa-mountain" style="color: #ff6b35; margin-right: 4px;"></i>Realm Tags'
        );
        behaviorsTabNav.addClass('realm-tab');
        console.log('Realms & Reaches | Updated tab navigation label to "Realm Tags" with icon');
      }

      // Update dialog title from localized "Region" to "Realm"
      const windowTitle = $html.closest('.window').find('.window-title');
      if (windowTitle.length) {
        const regionText = game.i18n.localize('DOCUMENT.Region');
        const currentTitle = windowTitle.text();
        if (currentTitle.includes(regionText)) {
          const newTitle = currentTitle.replace(regionText, 'Realm');
          windowTitle.text(newTitle);
          console.log(
            'Realms & Reaches | Updated dialog title from:',
            currentTitle,
            'to:',
            newTitle
          );
        }
      }

      // Update buttons that contain localized "Region" text
      const regionText = game.i18n.localize('DOCUMENT.Region');
      const updateText = game.i18n.localize('DOCUMENT.Update');

      // Look for buttons with "Update Region" pattern
      $html.find('button').each(function () {
        const $btn = $(this);
        const currentText = $btn.text().trim();
        const currentHtml = $btn.html();

        // Check if button contains the localized region text
        if (currentText.includes(regionText)) {
          const newText = currentText.replace(regionText, 'Realm');
          $btn.text(newText);
          console.log('Realms & Reaches | Updated button text from:', currentText, 'to:', newText);
        }

        // Also handle HTML content (for buttons with icons)
        if (currentHtml.includes(regionText)) {
          const newHtml = currentHtml.replace(regionText, 'Realm');
          $btn.html(newHtml);
          console.log('Realms & Reaches | Updated button HTML content');
        }
      });

      // Bind event handlers for tag management
      bindRealmTagHandlers($html, region, app);
    } else {
      console.warn(
        'Realms & Reaches | No behaviors tab found! Available tabs:',
        $html
          .find('.tab')
          .map((i, el) => $(el).attr('data-tab'))
          .get()
      );

      // As a fallback, try to add realm tags as a new tab
      let tabNavigation = $html.find('nav.sheet-tabs.tabs');
      if (!tabNavigation.length) {
        tabNavigation = $html.find('nav.sheet-navigation');
      }
      if (!tabNavigation.length) {
        tabNavigation = $html.find('.sheet-navigation');
      }
      if (!tabNavigation.length) {
        tabNavigation = $html.find('nav');
      }
      console.log('Realms & Reaches | Navigation debug:', {
        navSelectors: [
          $html.find('nav.sheet-tabs.tabs').length,
          $html.find('nav.sheet-navigation').length,
          $html.find('.sheet-navigation').length,
          $html.find('nav').length
        ],
        foundNav: tabNavigation.length > 0
      });
      if (tabNavigation.length) {
        const realmTagTabId = `realm-tags-${region.id}`;

        // Add navigation tab with realm styling
        tabNavigation.append(
          `<a class="item realm-tab" data-tab="${realmTagTabId}"><i class="fas fa-mountain" style="color: #ff6b35; margin-right: 4px;"></i>Realm Tags</a>`
        );

        // Add tab content
        const tags = region.flags['realms-and-reaches']?.tags || [];
        const realmTagsHtml = `
          <div class="tab" data-tab="${realmTagTabId}">
            <div class="realm-tags-editor">
              <div class="form-group">
                <label>Realm Tags</label>
                <p class="notes">Tags define biome, terrain, and travel properties for this realm.</p>
                
                <!-- Existing Tags -->
                <div class="tag-list">
                  ${tags
                    .map(
                      (tag: string) => `
                    <div class="tag-item" data-tag="${tag}">
                      <span class="tag-text">${tag}</span>
                      <button type="button" class="tag-remove" data-tag="${tag}" title="Remove Tag">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  `
                    )
                    .join('')}
                </div>
                
                <!-- Add New Tag Section -->
                <div class="tag-input-section">
                  <label class="input-label">Add New Tag</label>
                  <div class="tag-input-group">
                    <input type="text" id="new-realm-tag" placeholder="key:value (e.g., biome:forest)" list="realm-tag-suggestions">
                    <button type="button" id="add-realm-tag" title="Add Tag">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
                
                <!-- Tag Suggestions -->
                <datalist id="realm-tag-suggestions">
                  <!-- Options populated dynamically -->
                </datalist>
              </div>
            </div>
          </div>
        `;

        // Insert the tab content
        const tabContainer = $html.find('.tab-content, .window-content').first();
        if (tabContainer.length) {
          tabContainer.append(realmTagsHtml);

          // Bind event handlers for tag management
          bindRealmTagHandlers($html, region, app);

          console.log('Realms & Reaches | Added Realm Tags tab as fallback');
        } else {
          console.warn('Realms & Reaches | Could not find tab container for fallback');
        }
      } else {
        console.warn('Realms & Reaches | No tab navigation found for fallback');
      }
    }
  } catch (error) {
    console.error('Realms & Reaches | Error in renderRegionConfig hook:', error);
  }
});

/**
 * Bind event handlers for realm tag management in region config
 */
function bindRealmTagHandlers($html: any, region: any, _app: any) {
  const tagInput = $html.find('#new-realm-tag');
  const addTagBtn = $html.find('#add-realm-tag');
  const tagList = $html.find('.tag-list');

  // Add tag button handler
  addTagBtn.on('click', async () => {
    await addRealmTag(tagInput.val() as string, tagList, region, $html);
  });

  // Enter key handler for tag input
  tagInput.on('keypress', async (event: any) => {
    if (event.which === 13) {
      event.preventDefault();
      await addRealmTag(tagInput.val() as string, tagList, region, $html);
    }
  });

  // Tag removal handlers
  $html.on('click', '.tag-remove', async (event: any) => {
    const tag = $(event.currentTarget).data('tag');
    await removeRealmTag(tag, region, $html);
  });

  // Tag input validation and suggestions
  tagInput.on('input', () => {
    updateRealmTagSuggestions(tagInput.val() as string, region, $html);
    validateRealmTagInput(tagInput);
  });

  tagInput.on('blur', () => {
    validateRealmTagInput(tagInput);
  });

  // Initial setup
  updateRealmTagSuggestions('', region, $html);
}

/**
 * Add a new tag to the realm
 */
async function addRealmTag(tagValue: string, tagList: any, region: any, $html: any): Promise<void> {
  if (!tagValue?.trim()) return;

  const tag = tagValue.trim().toLowerCase();

  // Validate tag format
  const validation = TagSystem.getInstance().validateTag(tag);
  if (!validation.valid) {
    ui.notifications?.error(`Invalid tag: ${validation.error}`);
    return;
  }

  // Get current tags
  const currentTags = region.flags['realms-and-reaches']?.tags || [];

  // Check if tag already exists
  if (currentTags.includes(tag)) {
    ui.notifications?.warn(`Tag "${tag}" already exists`);
    return;
  }

  try {
    // Add tag to region
    const newTags = [...currentTags, tag];
    await region.setFlag('realms-and-reaches', 'tags', newTags);

    // Update metadata
    const metadata = region.flags['realms-and-reaches']?.metadata || {};
    metadata.modified = new Date().toISOString();
    await region.setFlag('realms-and-reaches', 'metadata', metadata);

    // Update UI
    renderRealmTagItem(tag, tagList);

    // Clear input
    $html.find('#new-realm-tag').val('');

    ui.notifications?.info(`Added tag: ${tag}`);
  } catch (error) {
    console.error('Failed to add realm tag:', error);
    ui.notifications?.error(`Failed to add tag: ${error}`);
  }
}

/**
 * Remove a tag from the realm
 */
async function removeRealmTag(tag: string, region: any, $html: any): Promise<void> {
  try {
    // Get current tags
    const currentTags = region.flags['realms-and-reaches']?.tags || [];
    const newTags = currentTags.filter((t: string) => t !== tag);

    // Update region
    await region.setFlag('realms-and-reaches', 'tags', newTags);

    // Update metadata
    const metadata = region.flags['realms-and-reaches']?.metadata || {};
    metadata.modified = new Date().toISOString();
    await region.setFlag('realms-and-reaches', 'metadata', metadata);

    // Remove from UI
    $html.find(`[data-tag="${tag}"]`).remove();

    ui.notifications?.info(`Removed tag: ${tag}`);
  } catch (error) {
    console.error('Failed to remove realm tag:', error);
    ui.notifications?.error(`Failed to remove tag: ${error}`);
  }
}

/**
 * Render a single tag item in the tag list
 */
function renderRealmTagItem(tag: string, tagList: any): void {
  const tagHtml = `
    <div class="tag-item" data-tag="${tag}">
      <span class="tag-text">${tag}</span>
      <button type="button" class="tag-remove" data-tag="${tag}" title="Remove Tag">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  tagList.append(tagHtml);
}

/**
 * Update tag suggestions based on current input
 */
function updateRealmTagSuggestions(partial: string, region: any, $html: any): void {
  const datalist = $html.find('#realm-tag-suggestions');
  if (!datalist.length) return;

  // Get existing tags
  const existingTags = region.flags['realms-and-reaches']?.tags || [];

  // Clear all existing options
  datalist.empty();

  // If no partial input, show common suggestions
  if (!partial?.trim()) {
    const commonTags = [
      'biome:forest',
      'biome:desert',
      'biome:mountain',
      'biome:swamp',
      'biome:grassland',
      'terrain:dense',
      'terrain:sparse',
      'terrain:rocky',
      'terrain:smooth',
      'climate:temperate',
      'climate:arctic',
      'climate:tropical',
      'climate:arid',
      'settlement:village',
      'settlement:town',
      'settlement:city',
      'travel_speed:0.5',
      'travel_speed:0.75',
      'travel_speed:1.0',
      'travel_speed:1.25',
      'travel_speed:1.5',
      'resources:timber',
      'resources:game',
      'resources:minerals',
      'resources:freshwater',
      'elevation:lowland',
      'elevation:highland',
      'elevation:mountain',
      'custom:haunted',
      'custom:magical',
      'custom:dangerous'
    ];

    commonTags.forEach(tag => {
      if (!existingTags.includes(tag)) {
        datalist.append(`<option value="${tag}">`);
      }
    });
  } else {
    // Get suggestions from TagSystem for partial input
    const suggestions = TagSystem.getInstance().getSuggestions(partial, existingTags);

    // Add suggestions (limit to 15 to avoid overwhelming dropdown)
    suggestions.slice(0, 15).forEach((suggestion: any) => {
      if (!existingTags.includes(suggestion.tag)) {
        datalist.append(`<option value="${suggestion.tag}">`);
      }
    });

    // Also search for tags by their values (e.g., typing "swamp" should find "biome:swamp")
    const commonTags = [
      'biome:forest',
      'biome:desert',
      'biome:mountain',
      'biome:swamp',
      'biome:grassland',
      'terrain:dense',
      'terrain:sparse',
      'terrain:rocky',
      'terrain:smooth',
      'climate:temperate',
      'climate:arctic',
      'climate:tropical',
      'climate:arid',
      'settlement:village',
      'settlement:town',
      'settlement:city',
      'travel_speed:0.5',
      'travel_speed:0.75',
      'travel_speed:1.0',
      'travel_speed:1.25',
      'travel_speed:1.5',
      'resources:timber',
      'resources:game',
      'resources:minerals',
      'resources:freshwater',
      'elevation:lowland',
      'elevation:highland',
      'elevation:mountain',
      'custom:haunted',
      'custom:magical',
      'custom:dangerous'
    ];

    const partialLower = partial.toLowerCase();

    // Find tags where the value portion matches the partial input
    const valueMatches = commonTags.filter(tag => {
      const colonIndex = tag.indexOf(':');
      if (colonIndex === -1) return false;

      const tagValue = tag.substring(colonIndex + 1).toLowerCase();
      return tagValue.includes(partialLower) && !existingTags.includes(tag);
    });

    // Add value matches to suggestions
    valueMatches.forEach(tag => {
      datalist.append(`<option value="${tag}">`);
    });
  }
}

/**
 * Validate tag input and show feedback
 */
function validateRealmTagInput(input: any): void {
  const value = input.val() as string;
  if (!value?.trim()) {
    input.removeClass('valid invalid');
    return;
  }

  const validation = TagSystem.getInstance().validateTag(value.trim());

  if (validation.valid) {
    input.removeClass('invalid').addClass('valid');
    input.removeAttr('title');
  } else {
    input.removeClass('valid').addClass('invalid');
    input.attr('title', validation.error || 'Invalid tag format');
  }
}
