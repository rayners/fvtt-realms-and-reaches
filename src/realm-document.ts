/**
 * RealmDocument - Custom Foundry document for Realms
 *
 * Based on BaseRegion and RegionDocument but with realm-specific fields.
 */

// Access Foundry classes at runtime
declare const foundry: any;

/**
 * Base Realm Document - extends BaseRegion with realm-specific fields
 */
export class BaseRealm {
  // Will be dynamically set to extend BaseRegion at runtime
}

/**
 * Client-side Realm document - extends RegionDocument functionality
 */
export default class RealmDocument {
  // Will be dynamically set to extend RegionDocument at runtime
}

// Helper function to create the actual classes at runtime
export function createRealmDocumentClasses() {
  const BaseRegion = foundry.documents.BaseRegion;
  const CanvasDocumentMixin = foundry.abstract.CanvasDocumentMixin;

  // Extend BaseRegion
  class BaseRealmImpl extends BaseRegion {
    /** @override */
    static metadata = Object.freeze(
      foundry.utils.mergeObject(
        super.metadata,
        {
          name: 'Realm',
          collection: 'realms',
          label: 'DOCUMENT.Realm',
          labelPlural: 'DOCUMENT.Realms'
        },
        { inplace: false }
      )
    );

    /** @override */
    static defineSchema() {
      const baseSchema = super.defineSchema();
      const fields = foundry.data.fields;

      // Add realm-specific fields to the base Region schema
      return foundry.utils.mergeObject(baseSchema, {
        tags: new fields.ArrayField(new fields.StringField(), {
          initial: [],
          label: 'Realm Tags'
        }),
        metadata: new fields.SchemaField({
          author: new fields.StringField({ initial: 'Unknown' }),
          created: new fields.NumberField({ initial: () => Date.now() }),
          modified: new fields.NumberField({ initial: () => Date.now() })
        })
      });
    }

    getTags() {
      return [...(this.tags || [])];
    }

    getTag(key: string) {
      const tag = this.tags?.find((t: string) => t.startsWith(`${key}:`));
      return tag ? tag.split(':', 2)[1] : null;
    }

    hasTag(tag: string) {
      return this.tags?.includes(tag) || false;
    }
  }

  // Extend RegionDocument
  class RealmDocumentImpl extends CanvasDocumentMixin(BaseRealmImpl) {
    getTags() {
      return [...(this.tags || [])];
    }

    getTag(key: string) {
      const tag = this.tags?.find((t: string) => t.startsWith(`${key}:`));
      return tag ? tag.split(':', 2)[1] : null;
    }

    hasTag(tag: string) {
      return this.tags?.includes(tag) || false;
    }

    async addTag(tag: string) {
      const tags = [...this.getTags()];
      if (!tags.includes(tag)) {
        tags.push(tag);
        await this.update({ tags });
      }
    }

    async removeTag(tag: string) {
      const tags = this.getTags().filter((t: string) => t !== tag);
      await this.update({ tags });
    }
  }

  return { BaseRealm: BaseRealmImpl, RealmDocument: RealmDocumentImpl };
}
