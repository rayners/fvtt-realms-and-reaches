/**
 * RealmPropertiesDialog - Dialog for editing realm properties
 * 
 * Provides a user interface for editing realm names, tags, and other properties.
 * Integrates with the TagSystem for validation and suggestions.
 * Now works with Region documents instead of custom RealmData objects.
 */

import { RealmManager } from './realm-manager';
import { TagSystem } from './tag-system';

// Type for realm regions
type RealmRegion = RegionDocument & {
  flags: {
    "realms-and-reaches"?: {
      isRealm?: boolean;
      tags?: string[];
      metadata?: {
        created: string;
        modified: string;
        author: string;
      };
    };
  };
};

// Helper functions from RealmManager
class RealmHelpers {
  static getTags(region: RealmRegion): string[] {
    return region.flags["realms-and-reaches"]?.tags || [];
  }

  static async addTag(region: RealmRegion, tag: string): Promise<void> {
    const currentTags = this.getTags(region);
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag];
      await region.setFlag("realms-and-reaches", "tags", newTags);
    }
  }

  static async removeTag(region: RealmRegion, tag: string): Promise<void> {
    const currentTags = this.getTags(region);
    const newTags = currentTags.filter(t => t !== tag);
    await region.setFlag("realms-and-reaches", "tags", newTags);
  }

  static hasTag(region: RealmRegion, tag: string): boolean {
    return this.getTags(region).includes(tag);
  }

  static async touch(region: RealmRegion): Promise<void> {
    const metadata = region.flags["realms-and-reaches"]?.metadata || {};
    metadata.modified = new Date().toISOString();
    await region.setFlag("realms-and-reaches", "metadata", metadata);
  }
}

export interface RealmPropertiesDialogData {
  realm: {
    id: string;
    name: string;
    tags: string[];
    color: string;
    shapes: any[];
    metadata: any;
  };
  isNew: boolean;
}

/**
 * Dialog for editing realm properties
 */
export class RealmPropertiesDialog extends Dialog {
  private realm: RealmRegion;
  private realmManager: RealmManager;
  private isNew: boolean;

  constructor(realm: RealmRegion, options: Partial<Dialog.Options> = {}) {
    const data = RealmPropertiesDialog.prepareData(realm);
    
    super({
      title: data.isNew ? 'Create New Realm' : `Edit Realm: ${realm.name}`,
      content: '',
      buttons: {},
      default: '',
      close: () => null
    }, {
      ...options,
      classes: ['realm-properties-dialog'],
      width: 500,
      height: 'auto',
      resizable: true,
      template: 'modules/realms-and-reaches/templates/realm-properties.hbs'
    });

    this.realm = realm;
    this.realmManager = RealmManager.getInstance();
    this.isNew = !realm.id || realm.id === '';
  }

  /** @override */
  static get defaultOptions(): Dialog.Options {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dialog', 'realm-properties-dialog'],
      width: 500,
      height: 'auto',
      resizable: true,
      template: 'modules/realms-and-reaches/templates/realm-properties.hbs'
    });
  }

  /** @override */
  getData(): RealmPropertiesDialogData {
    return RealmPropertiesDialog.prepareData(this.realm);
  }

  /**
   * Prepare template data for rendering
   */
  private static prepareData(realm: RealmRegion): RealmPropertiesDialogData {
    return {
      realm: {
        id: realm.id,
        name: realm.name,
        tags: RealmHelpers.getTags(realm).sort(),
        color: realm.color || '#ff0000',
        shapes: realm.shapes || [],
        metadata: realm.flags['realms-and-reaches']?.metadata
      },
      isNew: !realm.id || realm.id === ''
    };
  }

  /** @override */
  activateListeners(html: JQuery): void {
    super.activateListeners(html);

    // Form elements
    const form = html.find('.realm-form');
    const nameInput = html.find('#realm-name');
    const tagInput = html.find('#new-tag');
    const addTagBtn = html.find('#add-tag');
    const tagList = html.find('.tag-list');

    // Button handlers
    html.find('.save-realm').on('click', this.onSave.bind(this));
    html.find('.cancel-realm').on('click', this.onCancel.bind(this));
    html.find('.delete-realm').on('click', this.onDelete.bind(this));

    // Tag management
    addTagBtn.on('click', async () => await this.addTag(tagInput.val() as string, tagList));
    tagInput.on('keypress', async (event) => {
      if (event.which === 13) { // Enter key
        event.preventDefault();
        await this.addTag(tagInput.val() as string, tagList);
      }
    });

    // Tag removal
    html.on('click', '.tag-remove', async (event) => {
      const tag = $(event.currentTarget).data('tag');
      await this.removeTag(tag, tagList);
    });

    // Tag input suggestions and validation
    tagInput.on('input', () => this.updateTagSuggestions(tagInput.val() as string));
    tagInput.on('blur', () => this.validateTagInput(tagInput));

    // Form validation
    nameInput.on('input', () => this.validateForm(form));
    
    // Initial validation
    this.validateForm(form);
    this.updateTagSuggestions('');
  }

  /**
   * Add a tag to the realm
   */
  private async addTag(tagValue: string, tagList: JQuery): Promise<void> {
    if (!tagValue?.trim()) return;

    const tag = tagValue.trim().toLowerCase();
    
    // Validate tag format
    const validation = TagSystem.getInstance().validateTag(tag);
    if (!validation.valid) {
      ui.notifications?.error(`Invalid tag: ${validation.error}`);
      return;
    }

    // Check if tag already exists
    if (RealmHelpers.hasTag(this.realm, tag)) {
      ui.notifications?.warn(`Tag "${tag}" already exists`);
      return;
    }

    // Add tag to realm
    try {
      await RealmHelpers.addTag(this.realm, tag);
      
      // Update UI
      this.renderTagItem(tag, tagList);
      
      // Clear input
      this.element?.find('#new-tag').val('');
      
      // Update form validation
      this.validateForm(this.element?.find('.realm-form') as JQuery);
      
    } catch (error) {
      ui.notifications?.error(`Failed to add tag: ${error}`);
    }
  }

  /**
   * Remove a tag from the realm
   */
  private async removeTag(tag: string, tagList: JQuery): Promise<void> {
    try {
      await RealmHelpers.removeTag(this.realm, tag);
      
      // Remove from UI
      tagList.find(`[data-tag="${tag}"]`).remove();
      
      // Update form validation
      this.validateForm(this.element?.find('.realm-form') as JQuery);
    } catch (error) {
      ui.notifications?.error(`Failed to remove tag: ${error}`);
    }
  }

  /**
   * Render a single tag item in the tag list
   */
  private renderTagItem(tag: string, tagList: JQuery): void {
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
  private updateTagSuggestions(partial: string): void {
    const datalist = this.element?.find('#tag-suggestions');
    if (!datalist) return;

    // Get suggestions from TagSystem
    const existingTags = RealmHelpers.getTags(this.realm);
    const suggestions = TagSystem.getInstance().getSuggestions(partial, existingTags);

    // Clear existing options
    datalist.empty();

    // Add new suggestions
    suggestions.slice(0, 10).forEach(suggestion => {
      datalist.append(`<option value="${suggestion.tag}">`);
    });

    // Add static common suggestions if no partial input
    if (!partial.trim()) {
      const commonTags = [
        'biome:forest', 'biome:desert', 'biome:mountain', 'biome:swamp',
        'terrain:dense', 'terrain:sparse', 'terrain:rocky',
        'climate:temperate', 'climate:arctic', 'climate:tropical',
        'travel_speed:0.5', 'travel_speed:0.75', 'travel_speed:1.0',
        'resources:timber', 'resources:game', 'resources:minerals'
      ];
      
      commonTags.forEach(tag => {
        if (!existingTags.includes(tag)) {
          datalist.append(`<option value="${tag}">`);
        }
      });
    }
  }

  /**
   * Validate tag input and show feedback
   */
  private validateTagInput(input: JQuery): void {
    const value = input.val() as string;
    if (!value?.trim()) {
      input.removeClass('valid invalid');
      return;
    }

    const validation = TagSystem.getInstance().validateTag(value.trim());
    
    if (validation.valid) {
      input.removeClass('invalid').addClass('valid');
    } else {
      input.removeClass('valid').addClass('invalid');
      input.attr('title', validation.error || 'Invalid tag format');
    }
  }

  /**
   * Validate the entire form
   */
  private validateForm(form: JQuery): boolean {
    const nameInput = form.find('#realm-name');
    const saveBtn = form.find('.save-realm');
    
    const name = nameInput.val() as string;
    const isValid = name?.trim().length > 0;
    
    saveBtn.prop('disabled', !isValid);
    
    return isValid;
  }

  /**
   * Handle save button click
   */
  private async onSave(): Promise<void> {
    try {
      const nameInput = this.element?.find('#realm-name');
      const newName = nameInput?.val() as string;
      
      if (!newName?.trim()) {
        ui.notifications?.error('Realm name is required');
        return;
      }

      // Save to manager
      if (this.isNew) {
        // For new realms, we should be creating them through the layer/manager
        throw new Error('Cannot create new realms through properties dialog');
      } else {
        // Update the realm
        await this.realm.update({ name: newName.trim() });
        await RealmHelpers.touch(this.realm);
        ui.notifications?.info(`Updated realm: ${this.realm.name}`);
      }

      // Refresh the canvas layer
      const layer = (canvas as any)?.layers?.realms;
      layer?.refresh();

      // Close dialog
      this.close();
      
    } catch (error) {
      console.error('Failed to save realm:', error);
      ui.notifications?.error('Failed to save realm');
    }
  }

  /**
   * Handle cancel button click
   */
  private onCancel(): void {
    this.close();
  }

  /**
   * Handle delete button click
   */
  private async onDelete(): Promise<void> {
    const confirmed = await Dialog.confirm({
      title: 'Delete Realm',
      content: `<p>Are you sure you want to delete the realm "<strong>${this.realm.name}</strong>"?</p>
                <p>This action cannot be undone.</p>`,
      yes: () => true,
      no: () => false
    });

    if (confirmed) {
      try {
        await this.realmManager.deleteRealm(this.realm.id);
        ui.notifications?.info(`Deleted realm: ${this.realm.name}`);
        
        // Refresh the canvas layer
        const layer = (canvas as any)?.layers?.realms;
        layer?.refresh();
        
        this.close();
      } catch (error) {
        console.error('Failed to delete realm:', error);
        ui.notifications?.error('Failed to delete realm');
      }
    }
  }

  /**
   * Static method to open realm properties dialog
   */
  static async open(realm: RealmRegion): Promise<RealmPropertiesDialog> {
    const dialog = new RealmPropertiesDialog(realm);
    dialog.render(true);
    return dialog;
  }
}