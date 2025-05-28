/**
 * RealmLayer - Custom canvas layer for drawing and editing realm polygons
 *
 * Extends Foundry's PlaceablesLayer to provide spatial editing tools for realms.
 * Inherits all the drawing functionality from RegionLayer but stores data in scene flags.
 * Integrates with RealmManager for data persistence and spatial queries.
 */

import { RealmManager } from './realm-manager';
import { RealmData } from './realm-data';

// RegionLayer access - will be available at runtime
declare const _RegionLayer: any;

// Lazy import to avoid circular dependency
let RealmPropertiesDialog: any;

// Drawing states for the layer
enum DrawingState {
  IDLE = 'idle',
  DRAWING = 'drawing',
  SELECTING = 'selecting',
  EDITING = 'editing'
}

// Drawing tools available
enum DrawingTool {
  SELECT = 'select',
  POLYGON = 'polygon',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle'
}

/**
 * Custom canvas layer for realm editing
 * Extends RegionLayer to inherit all drawing functionality
 */
export class RealmLayer extends (globalThis.foundry?.canvas?.layers?.RegionLayer || class {}) {
  /** @override */
  static get layerOptions() {
    return foundry.utils.mergeObject(super.layerOptions, {
      name: 'realms'
      // Let RegionLayer handle the rest of the options
    });
  }

  /** @override */
  static documentName = 'Realm'; // Use Realm documents

  // Layer state
  private drawingState: DrawingState = DrawingState.IDLE;
  private activeTool: DrawingTool = DrawingTool.SELECT;
  private currentPolygon: number[] = []; // [x1, y1, x2, y2, ...]
  private selectedRealm: RealmData | null = null;

  // PIXI graphics objects for realm rendering
  private realmGraphics = new Map<string, PIXI.Graphics>(); // realmId -> graphics

  // RealmManager integration
  private realmManager: RealmManager;

  constructor() {
    super();
    this.realmManager = RealmManager.getInstance();

    // Listen for realm data changes
    this.realmManager.addEventListener('realmCreated', this.onRealmCreated.bind(this));
    this.realmManager.addEventListener('realmUpdated', this.onRealmUpdated.bind(this));
    this.realmManager.addEventListener('realmDeleted', this.onRealmDeleted.bind(this));
    this.realmManager.addEventListener('realmsLoaded', this.onRealmsLoaded.bind(this));
  }

  // Layer Lifecycle

  /** @override */
  async _draw(options: any = {}) {
    // Call RegionLayer's _draw to get all the built-in functionality
    await super._draw(options);

    // Draw existing realms using our custom rendering
    this.drawAllRealms();
  }

  /** @override */
  async _tearDown(options: any = {}) {
    // Clean up our custom graphics objects
    this.realmGraphics.clear();

    // Call RegionLayer's teardown
    await super._tearDown(options);
  }

  /** @override */
  _activate() {
    // Call RegionLayer's activation
    super._activate();

    // Show realm controls
    this.updateUI();

    // Refresh realm display
    this.refresh();
  }

  /** @override */
  _deactivate() {
    // Cancel any active drawing
    this.cancelDrawing();

    // Call RegionLayer's deactivation
    super._deactivate();

    // Hide realm controls
    this.updateUI();
  }

  /** Public activation method for external calls */
  activate() {
    this._activate();
  }

  /** Public deactivation method for external calls */
  deactivate() {
    this._deactivate();
  }

  // Drawing Tool Management

  /**
   * Set the active drawing tool
   */
  setActiveTool(tool: DrawingTool): void {
    this.activeTool = tool;
    this.cancelDrawing();
    this.updateCursor();
    this.updateUI();
  }

  /**
   * Get the current drawing tool
   */
  getActiveTool(): DrawingTool {
    return this.activeTool;
  }

  /**
   * Start drawing a new realm
   */
  startDrawing(): void {
    if (this.activeTool === DrawingTool.SELECT) return;

    this.drawingState = DrawingState.DRAWING;
    this.currentPolygon = [];
    this.selectedRealm = null;
    this.updateCursor();
    this.clearPreview();
  }

  /**
   * Cancel the current drawing operation
   */
  cancelDrawing(): void {
    this.drawingState = DrawingState.IDLE;
    this.currentPolygon = [];
    this.clearPreview();
    this.updateCursor();
  }

  /**
   * Complete the current drawing and create a realm
   */
  async completeDrawing(): Promise<void> {
    if (this.drawingState !== DrawingState.DRAWING || this.currentPolygon.length < 6) {
      return; // Need at least 3 points (6 coordinates)
    }

    try {
      // Create realm data based on tool type
      const geometry = this.createGeometryFromTool();
      if (!geometry) return;

      // Create the realm
      const realm = await this.realmManager.createRealm({
        name: `New ${this.activeTool.charAt(0).toUpperCase() + this.activeTool.slice(1)}`,
        geometry,
        tags: ['biome:unknown'] // Default tag
      });

      // Select the new realm
      this.selectedRealm = realm;
      this.drawingState = DrawingState.SELECTING;

      ui.notifications?.info(`Created realm: ${realm.name}`);
    } catch (error) {
      console.error('Failed to create realm:', error);
      ui.notifications?.error('Failed to create realm');
    } finally {
      this.clearPreview();
    }
  }

  // Event Handlers

  /** @override */
  _onClickLeft(event: PIXI.InteractionEvent): boolean | void {
    const position = this.getSnappedPoint(event.data.global);

    switch (this.drawingState) {
      case DrawingState.IDLE:
        this.handleIdleClick(position, event);
        break;
      case DrawingState.DRAWING:
        this.handleDrawingClick(position, event);
        break;
      case DrawingState.SELECTING:
        this.handleSelectingClick(position, event);
        break;
    }

    return true;
  }

  /** @override */
  _onClickRight(_event: PIXI.InteractionEvent): boolean | void {
    // Right-click to complete drawing or cancel
    if (this.drawingState === DrawingState.DRAWING) {
      if (this.currentPolygon.length >= 6) {
        this.completeDrawing();
      } else {
        this.cancelDrawing();
      }
    } else {
      this.cancelDrawing();
    }

    return true;
  }

  /** @override */
  _onMouseMove(event: PIXI.InteractionEvent): void {
    // Let RegionLayer handle mouse move for drawing previews
    super._onMouseMove?.(event);

    if (this.drawingState === DrawingState.DRAWING) {
      // Custom logic if needed
    }
  }

  /** @override */
  _onDoubleClick(event: PIXI.InteractionEvent): boolean | void {
    const position = this.getSnappedPoint(event.data.global);
    const realm = this.realmManager.getRealmAt(position.x, position.y);

    if (realm) {
      this.openRealmProperties(realm);
      return true;
    }

    return false;
  }

  /** @override */
  _onKeyDown(event: KeyboardEvent): boolean | void {
    switch (event.key) {
      case 'Escape':
        this.cancelDrawing();
        return false;
      case 'Enter':
        if (this.drawingState === DrawingState.DRAWING) {
          this.completeDrawing();
          return false;
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (this.selectedRealm) {
          this.deleteSelectedRealm();
          return false;
        }
        break;
    }

    return super._onKeyDown?.(event);
  }

  // Click Handlers

  private handleIdleClick(position: PIXI.Point, _event: PIXI.InteractionEvent): void {
    if (this.activeTool === DrawingTool.SELECT) {
      // Select realm at position
      const realm = this.realmManager.getRealmAt(position.x, position.y);
      this.selectedRealm = realm;
      this.drawingState = realm ? DrawingState.SELECTING : DrawingState.IDLE;
      this.refresh();
    } else {
      // Start drawing
      this.startDrawing();
      this.handleDrawingClick(position, event);
    }
  }

  private handleDrawingClick(position: PIXI.Point, _event: PIXI.InteractionEvent): void {
    if (this.activeTool === DrawingTool.POLYGON) {
      // Add point to polygon
      this.currentPolygon.push(position.x, position.y);

      // Check for polygon completion (click near first point)
      if (this.currentPolygon.length >= 6) {
        const firstX = this.currentPolygon[0];
        const firstY = this.currentPolygon[1];
        const distance = Math.sqrt(
          Math.pow(position.x - firstX, 2) + Math.pow(position.y - firstY, 2)
        );

        // Complete if clicked near start (within 20 pixels)
        if (distance <= 20) {
          this.completeDrawing();
          return;
        }
      }
    } else {
      // For rectangle/circle, complete on second click
      if (this.currentPolygon.length === 0) {
        // First click - start shape
        this.currentPolygon.push(position.x, position.y);
      } else {
        // Second click - complete shape
        this.currentPolygon.push(position.x, position.y);
        this.completeDrawing();
      }
    }
  }

  private handleSelectingClick(position: PIXI.Point, _event: PIXI.InteractionEvent): void {
    // Check if clicking on the selected realm
    if (this.selectedRealm && this.selectedRealm.containsPoint(position.x, position.y)) {
      // Start editing mode (future enhancement)
      // this.startEditing();
    } else {
      // Select different realm or deselect
      const realm = this.realmManager.getRealmAt(position.x, position.y);
      this.selectedRealm = realm;
      this.drawingState = realm ? DrawingState.SELECTING : DrawingState.IDLE;
    }

    this.refresh();
  }

  // Geometry Creation

  private createGeometryFromTool(): any {
    switch (this.activeTool) {
      case DrawingTool.POLYGON:
        return {
          type: 'polygon',
          points: [...this.currentPolygon] // Copy array
        };

      case DrawingTool.RECTANGLE:
        if (this.currentPolygon.length >= 4) {
          const [x1, y1, x2, y2] = this.currentPolygon;
          return {
            type: 'rectangle',
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2,
            width: Math.abs(x2 - x1),
            height: Math.abs(y2 - y1)
          };
        }
        break;

      case DrawingTool.CIRCLE:
        if (this.currentPolygon.length >= 4) {
          const [x1, y1, x2, y2] = this.currentPolygon;
          const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          return {
            type: 'circle',
            x: x1,
            y: y1,
            radius
          };
        }
        break;
    }

    return null;
  }

  // Visual Rendering

  /**
   * Draw all realms on the layer
   */
  private drawAllRealms(): void {
    // Clear existing graphics
    this.realmGraphics.forEach(g => g.destroy());
    this.realmGraphics.clear();

    // Draw each realm
    const realms = this.realmManager.getAllRealms();
    for (const realm of realms) {
      this.drawRealm(realm);
    }
  }

  /**
   * Draw a single realm
   */
  private drawRealm(realm: RealmData): void {
    const graphics = new PIXI.Graphics();

    // Determine colors based on selection state
    const isSelected = this.selectedRealm?.id === realm.id;
    const fillColor = this.getRealmColor(realm);
    const fillAlpha = isSelected ? 0.4 : 0.2;
    const strokeColor = isSelected ? 0xffd700 : 0x4a90e2; // Gold if selected, blue otherwise
    const strokeWidth = isSelected ? 3 : 2;

    // Draw the realm geometry
    graphics.lineStyle(strokeWidth, strokeColor, 1);
    graphics.beginFill(fillColor, fillAlpha);

    this.drawGeometry(graphics, realm.geometry);

    graphics.endFill();

    // Store and add to layer
    this.realmGraphics.set(realm.id, graphics);
    this.addChild(graphics);
  }

  /**
   * Draw geometry on a graphics object
   */
  private drawGeometry(graphics: PIXI.Graphics, geometry: any): void {
    switch (geometry.type) {
      case 'polygon':
        if (geometry.points && geometry.points.length >= 6) {
          graphics.drawPolygon(geometry.points);
        }
        break;

      case 'rectangle':
        graphics.drawRect(
          geometry.x - geometry.width / 2,
          geometry.y - geometry.height / 2,
          geometry.width,
          geometry.height
        );
        break;

      case 'circle':
        graphics.drawCircle(geometry.x, geometry.y, geometry.radius);
        break;
    }
  }

  /**
   * Get color for a realm based on its biome
   */
  private getRealmColor(realm: RealmData): number {
    const biome = realm.getTag('biome');

    switch (biome) {
      case 'forest':
        return 0x228b22; // Forest green
      case 'desert':
        return 0xdaa520; // Goldenrod
      case 'mountain':
        return 0x696969; // Dim gray
      case 'swamp':
        return 0x556b2f; // Dark olive green
      case 'grassland':
        return 0x9acd32; // Yellow green
      case 'arctic':
        return 0x87ceeb; // Sky blue
      default:
        return 0x4a90e2; // Default blue
    }
  }

  /**
   * Clear any custom preview graphics - RegionLayer handles most previews
   */
  private clearPreview(): void {
    // RegionLayer's preview system will handle this
  }

  // Utility Methods

  /**
   * Get snapped position for drawing
   */
  private getSnappedPoint(global: PIXI.Point): PIXI.Point {
    const local = this.toLocal(global);

    if (canvas?.grid?.type && this.options.snapToGrid) {
      const snapped = canvas.grid.getSnappedPosition(local.x, local.y);
      return new PIXI.Point(snapped.x, snapped.y);
    }

    return local;
  }

  /**
   * Update cursor based on current state
   */
  private updateCursor(): void {
    const cursor =
      this.drawingState === DrawingState.DRAWING
        ? 'crosshair'
        : this.activeTool === DrawingTool.SELECT
          ? 'pointer'
          : 'crosshair';

    if (canvas?.app?.view) {
      canvas.app.view.style.cursor = cursor;
    }
  }

  /**
   * Update UI to reflect current state
   */
  private updateUI(): void {
    // Trigger UI update (implementation depends on UI framework)
    Hooks.callAll('realmLayer.stateChanged', {
      active: this.active,
      tool: this.activeTool,
      state: this.drawingState,
      selectedRealm: this.selectedRealm
    });
  }

  /**
   * Refresh the entire layer
   */
  refresh(): void {
    this.drawAllRealms();
    this.updateUI();
  }

  /**
   * Delete the currently selected realm
   */
  private async deleteSelectedRealm(): Promise<void> {
    if (!this.selectedRealm) return;

    const result = await Dialog.confirm({
      title: 'Delete Realm',
      content: `Are you sure you want to delete the realm "${this.selectedRealm.name}"?`,
      yes: () => true,
      no: () => false
    });

    if (result) {
      await this.realmManager.deleteRealm(this.selectedRealm.id);
      this.selectedRealm = null;
      this.drawingState = DrawingState.IDLE;
    }
  }

  // Event Handlers for RealmManager

  private onRealmCreated(event: CustomEvent): void {
    const realm = event.detail.realm;
    this.drawRealm(realm);
  }

  private onRealmUpdated(event: CustomEvent): void {
    const realm = event.detail.realm;

    // Remove old graphics
    const oldGraphics = this.realmGraphics.get(realm.id);
    if (oldGraphics) {
      oldGraphics.destroy();
      this.realmGraphics.delete(realm.id);
    }

    // Draw updated realm
    this.drawRealm(realm);
  }

  private onRealmDeleted(event: CustomEvent): void {
    const realmId = event.detail.realmId;

    // Remove graphics
    const graphics = this.realmGraphics.get(realmId);
    if (graphics) {
      graphics.destroy();
      this.realmGraphics.delete(realmId);
    }

    // Clear selection if this realm was selected
    if (this.selectedRealm?.id === realmId) {
      this.selectedRealm = null;
      this.drawingState = DrawingState.IDLE;
    }
  }

  private onRealmsLoaded(_event: CustomEvent): void {
    this.drawAllRealms();
  }

  // Public API

  /**
   * Get the currently selected realm
   */
  getSelectedRealm(): RealmData | null {
    return this.selectedRealm;
  }

  /**
   * Select a specific realm
   */
  selectRealm(realm: RealmData | null): void {
    this.selectedRealm = realm;
    this.drawingState = realm ? DrawingState.SELECTING : DrawingState.IDLE;
    this.refresh();
  }

  /**
   * Export available drawing tools
   */
  static get DrawingTool() {
    return DrawingTool;
  }

  /**
   * Open realm properties dialog
   */
  private async openRealmProperties(realm: RealmData): Promise<void> {
    // Lazy load the dialog to avoid circular dependency
    if (!RealmPropertiesDialog) {
      const module = await import('./realm-properties-dialog');
      RealmPropertiesDialog = module.RealmPropertiesDialog;
    }

    RealmPropertiesDialog.open(realm);
  }

  // Override RegionLayer methods to use RealmManager instead of documents

  /**
   * Override document creation to use RealmManager instead of creating Region documents
   */
  /** @override */
  _onDragLeftDrop(event: any) {
    // Get the shape data from RegionLayer's drawing functionality
    const shape = this._getShapeFromEvent?.(event);
    if (!shape) return;

    // Convert shape to our RealmData format and store via RealmManager
    const geometry = this._shapeToGeometry(shape);
    if (!geometry) return;

    const realmData = {
      name: `New ${this._getShapeType(shape)} Realm`,
      geometry,
      tags: ['biome:unknown']
    };

    this.realmManager.createRealm(realmData);
    this.refresh();
  }

  /**
   * Get shape data from RegionLayer drawing event
   */
  private _getShapeFromEvent(event: any): any {
    // This will depend on RegionLayer's internal implementation
    // For now, return a basic shape object
    const interaction = event.interactionData;
    if (!interaction) return null;

    // RegionLayer should provide shape data in the event
    return interaction.shape || interaction.preview || null;
  }

  /**
   * Get shape type from shape data
   */
  private _getShapeType(shape: any): string {
    return shape.type || 'polygon';
  }

  /**
   * Convert shape data to our geometry format
   */
  private _shapeToGeometry(shape: any): any {
    switch (shape.type) {
      case 'polygon':
        return {
          type: 'polygon',
          points: shape.points || []
        };
      case 'rectangle':
        return {
          type: 'rectangle',
          x: shape.x || 0,
          y: shape.y || 0,
          width: shape.width || 0,
          height: shape.height || 0
        };
      case 'circle':
        return {
          type: 'circle',
          x: shape.x || 0,
          y: shape.y || 0,
          radius: shape.radius || 0
        };
      default:
        return {
          type: 'polygon',
          points: []
        };
    }
  }
}
