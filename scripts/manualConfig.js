import { MODULE_ID } from "./main.js";
import { getFlagFields, getUserConfig, isExtraTypesEnabled } from "./userConfig.js";

const fields = foundry.data.fields;
const { HandlebarsApplicationMixin, DocumentSheetV2 } = foundry.applications.api;

/**
 * Per-document values for data a game system does not track itself, edited
 * from a header button on Actor and Item sheets.
 *
 * - MANUAL_CONFIG_FIELDS (Actors, when "Extra creature types per actor" is
 *   on in the System Abstraction Configuration, see `isExtraTypesEnabled`):
 *   stored as flags in this module's scope keyed by field name, and added to
 *   the system's own creature types when the API reads them.
 * - Fields the GM mapped to "Stored by RSA" in the System Abstraction Configuration
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

const SECTIONS = [
  { id: "actor", icon: "fa-solid fa-user" },
  { id: "health", icon: "fa-solid fa-heart" },
  { id: "item", icon: "fa-solid fa-box-open" },
  { id: "currency", icon: "fa-solid fa-coins" },
  { id: "experience", icon: "fa-solid fa-star" },
];

/**
 * Fields sharing a group are shown as small labelled inputs on one wrapping
 * line; fields without a group get a full-width row of their own.
 */
const FIELD_GROUPS = {
  "actor.subtype": "actor",
  "actor.size": "actor",
  "actor.level": "actor",
  "actor.role": "actor",
  "health.current": "health",
  "health.maximum": "health",
  "health.temporary": "health",
  "health.minimum": "health",
  "health.wounds": "wounds",
  "health.maximumWounds": "wounds",
  "item.quantity": "amounts",
  "item.weight": "amounts",
  "item.uses": "amounts",
  "item.maximumUses": "amounts",
  "item.equipped": "states",
  "item.attuned": "states",
  "experience.current": "experience",
  "experience.maximum": "experience",
  "currency.actor": "coins",
  "currency.item": "prices",
};

function groupOf(id) {
  const [section, kind] = id.split(".");
  return FIELD_GROUPS[id] ?? (section === "currency" ? FIELD_GROUPS[`${section}.${kind}`] : undefined) ?? null;
}

function inputHTML(field, name, value) {
  try {
    const input = field.toInput({ name, value });
    return input?.outerHTML ?? "";
  } catch {
    return "";
  }
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
      position: { width: 520, height: "auto" },
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
    const entries = [];
    const definitions = manualFieldsEnabled(this.document) ? MANUAL_CONFIG_FIELDS[this.document.documentName] ?? {} : {};
    for (const [key, factory] of Object.entries(definitions)) {
      const field = factory();
      const value = getManualConfig(this.document, key) ?? field.getInitialValue();
      const name = `flags.${MODULE_ID}.${key}`;
      entries.push({ section: "actor", group: null, name, label: game.i18n.localize(field.label), hint: game.i18n.localize(field.hint ?? ""), input: inputHTML(field, name, value) });
    }
    for (const entry of safeFlagFields(this.document.documentName)) {
      const field = flagFieldFor(entry);
      const value = foundry.utils.getProperty(this.document, entry.flagPath) ?? entry.flagDefault ?? field.getInitialValue();
      const { label, muted } = flagFieldLabel(entry);
      entries.push({
        section: entry.id.split(".")[0],
        group: groupOf(entry.id),
        name: entry.flagPath,
        label,
        muted,
        hint: game.i18n.localize(entry.label.replace(/\.label$/, ".hint")),
        input: inputHTML(field, entry.flagPath, value),
      });
    }
    context.sections = SECTIONS.map(({ id, icon }) => {
      const rows = [];
      for (const entry of entries.filter((candidate) => candidate.section === id)) {
        const row = entry.group && rows.find((candidate) => candidate.group === entry.group);
        if (row) row.fields.push(entry);
        else rows.push({ group: entry.group, compact: !!entry.group, fields: [entry] });
      }
      return { id, icon, label: `${MODULE_ID}.systemConfig.tabs.${id}`, rows };
    }).filter((section) => section.rows.length);
    context.buttons = [{ type: "submit", icon: "fa-solid fa-floppy-disk", label: "SETTINGS.Save" }];
    return context;
  }
}

function manualFieldsEnabled(document) {
  return !!MANUAL_CONFIG_FIELDS[document?.documentName] && isExtraTypesEnabled();
}

function safeFlagFields(documentName) {
  try {
    return getFlagFields(documentName);
  } catch {
    return [];
  }
}

function flagFieldLabel(entry) {
  if (entry.denomination) {
    const name = entry.denomination.label || entry.denomination.abbreviation || entry.denomination.id;
    return { label: game.i18n.localize(name) };
  }
  if (entry.id === "currency.itemSingle.value") {
    let muted = "";
    try {
      const { denominations, itemSingle } = getUserConfig().currency;
      const coin = denominations.find((candidate) => candidate.id === itemSingle.denomination);
      if (coin) muted = `(${game.i18n.localize(coin.label || coin.id)})`;
    } catch {}
    return { label: game.i18n.localize(`${MODULE_ID}.manualConfig.price`), muted };
  }
  return { label: game.i18n.localize(entry.label) };
}

function flagFieldFor(entry) {
  const options = { required: false };
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
