import { MODULE_ID } from "./main.js";
import { getSetting } from "./settings.js";
import { getFlagFields } from "./userConfig.js";

const fields = foundry.data.fields;
const { HandlebarsApplicationMixin, DocumentSheetV2 } = foundry.applications.api;

/**
 * Per-document values for data a game system does not track itself, edited
 * from a header button on Actor and Item sheets.
 *
 * - MANUAL_CONFIG_FIELDS (Actors, when the `manualConfig` setting is on):
 *   stored as flags in this module's scope keyed by field name, and combined
 *   with the system adapter's data when the API reads them.
 * - Fields the GM mapped to "Stored by RSA" in the System Configuration
 *   (`getFlagFields`): stored under `flags.ripper-system-abstraction.data`,
 *   at the exact paths the API reads them from.
 *
 * The button appears for owners when the sheet has at least one of these.
 */
export const MANUAL_CONFIG_FIELDS = {
  Actor: {
    creatureType: () =>
      new fields.SetField(new fields.StringField({ blank: false, trim: true }), {
        label: `${MODULE_ID}.manualConfig.fields.creatureType.label`,
        hint: `${MODULE_ID}.manualConfig.fields.creatureType.hint`,
      }),
  },
};

/**
 * Read a manually configured value from a document.
 *
 * @param {Document} document
 * @param {string} key
 * @returns {*}
 */
export function getManualConfig(document, key) {
  return document?.flags?.[MODULE_ID]?.[key];
}

export class ManualConfigSheet extends HandlebarsApplicationMixin(DocumentSheetV2) {
  // Getters: MODULE_ID comes from main.js, which imports this file, so it is
  // not yet initialized when the class body is evaluated.
  static get DEFAULT_OPTIONS() {
    return {
      classes: [`${MODULE_ID}-manual-config`],
      sheetConfig: false,
      window: {
        icon: "fa-solid fa-sliders",
        contentClasses: ["standard-form"],
      },
      position: { width: 480, height: "auto" },
      form: { closeOnSubmit: true },
    };
  }

  static get PARTS() {
    return {
      form: { template: `modules/${MODULE_ID}/templates/manual-config.hbs` },
      footer: { template: "templates/generic/form-footer.hbs" },
    };
  }

  /**
   * Open the sheet for a document, bringing an already open one to front.
   *
   * @param {Document} document
   */
  static open(document) {
    const existing = Object.values(document.apps ?? {}).find((app) => app instanceof this);
    if (existing) return existing.render({ force: true });
    return new this({ document }).render({ force: true });
  }

  get title() {
    return `${game.i18n.localize(`${MODULE_ID}.manualConfig.title`)}: ${this.document.name}`;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const definitions = manualFieldsEnabled(this.document) ? MANUAL_CONFIG_FIELDS[this.document.documentName] ?? {} : {};
    context.fields = Object.entries(definitions).map(([key, factory]) => {
      const field = factory();
      const value = getManualConfig(this.document, key);
      return {
        field,
        name: `flags.${MODULE_ID}.${key}`,
        value: value ?? field.getInitialValue(),
      };
    });
    for (const entry of safeFlagFields(this.document.documentName)) {
      const field = flagFieldFor(entry);
      const value = foundry.utils.getProperty(this.document, entry.flagPath) ?? entry.flagDefault;
      context.fields.push({ field, name: entry.flagPath, value: value ?? field.getInitialValue() });
    }
    context.buttons = [{ type: "submit", icon: "fa-solid fa-floppy-disk", label: "SETTINGS.Save" }];
    return context;
  }
}

function manualFieldsEnabled(document) {
  return !!MANUAL_CONFIG_FIELDS[document?.documentName] && getSetting("manualConfig") === true;
}

function safeFlagFields(documentName) {
  try {
    return getFlagFields(documentName);
  } catch {
    return [];
  }
}

function flagFieldFor(entry) {
  let label = game.i18n.localize(entry.label);
  if (entry.denomination) {
    const name = entry.denomination.label || entry.denomination.abbreviation || entry.denomination.id;
    label = `${label}: ${game.i18n.localize(name)}`;
  }
  const options = { label, required: false };
  switch (entry.type) {
    case "number":
      return new fields.NumberField({ ...options, nullable: true });
    case "boolean":
      return new fields.BooleanField(options);
    case "stringList":
      return new fields.SetField(new fields.StringField({ blank: false, trim: true }), options);
    default:
      return new fields.StringField({ ...options, blank: true, trim: true });
  }
}

function canConfigure(document) {
  if (!document?.isOwner) return false;
  return manualFieldsEnabled(document) || safeFlagFields(document.documentName).length > 0;
}

/**
 * Add the manual configuration header button to the sheets of every document
 * name in MANUAL_CONFIG_FIELDS, for both ApplicationV1 and ApplicationV2.
 */
export function registerManualConfigHooks() {
  const label = `${MODULE_ID}.manualConfig.button`;
  const icon = "fa-solid fa-sliders";

  for (const documentName of ["Actor", "Item"]) {
    // ApplicationV2: fires for every subclass of the base sheet.
    Hooks.on(`getHeaderControls${documentName}SheetV2`, (app, controls) => {
      if (!canConfigure(app.document)) return;
      controls.push({
        action: `${MODULE_ID}-manual-config`,
        icon,
        label,
        onClick: () => ManualConfigSheet.open(app.document),
      });
    });

    // ApplicationV1
    Hooks.on(`get${documentName}SheetHeaderButtons`, (app, buttons) => {
      const document = app.document ?? app.object;
      if (!canConfigure(document)) return;
      buttons.unshift({
        label: game.i18n.localize(label),
        class: `${MODULE_ID}-manual-config`,
        icon,
        onclick: () => ManualConfigSheet.open(document),
      });
    });
  }
}
