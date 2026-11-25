import { getAdapterDataPaths, getCurrentSystem } from "./systems/_index.js";
import { closePathPicker, openPathPicker } from "./pathPicker.js";
import { createWarningIcon, getMissingRequirements, neededByLines, requirementLabel } from "./requirements.js";
import {
  CONFIG_FIELDS,
  CURRENCY_FIELDS,
  describeAdapterField,
  getAdapterCurrency,
  getAdapterOptions,
  getUserConfig,
  sanitizeUserConfig,
  setUserConfig,
} from "./userConfig.js";

const MODULE_ID = "ripper-system-abstraction";
const I18N = `${MODULE_ID}.systemConfig`;
const TEMPLATES = `modules/${MODULE_ID}/templates/system-config`;
const FIELD_PARTIAL = `${TEMPLATES}/field.hbs`;
const BROWSE_PARTIAL = `${TEMPLATES}/browse.hbs`;
const ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const MAX_SUGGESTIONS = 3000;
const TAB_IDS = ["actor", "health", "item", "currency", "experience", "checks"];

const { HandlebarsApplicationMixin, ApplicationV2, DialogV2 } = foundry.applications.api;

const localize = (key) => game.i18n.localize(`${I18N}.${key}`);
const format = (key, data) => game.i18n.format(`${I18N}.${key}`, data);

function isConfigured(source) {
  return source?.source === "flag" || !!source?.path?.trim();
}

function emptySource() {
  return { source: "path", path: "" };
}

function slugify(label) {
  return String(label ?? "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

const MAX_SCANNED_DOCUMENTS = 50;

/**
 * The known `system` data paths of a document name, from the system itself:
 * the data model schemas of every type, the template.json defaults, and the
 * system data of the first world documents (actors and their items). Paths
 * only, deduplicated and sorted, capped at MAX_SUGGESTIONS.
 */
function collectSystemPaths(documentName) {
  const paths = new Set();
  const add = (path) => {
    if (path && paths.size < MAX_SUGGESTIONS) paths.add(path);
  };
  const SchemaField = foundry.data.fields.SchemaField;
  const walkSchema = (field, prefix, depth) => {
    if (depth > 8) return;
    if (field instanceof SchemaField) {
      for (const [key, child] of Object.entries(field.fields)) walkSchema(child, prefix ? `${prefix}.${key}` : key, depth + 1);
    } else add(prefix);
  };
  const walkData = (value, prefix, depth, seen) => {
    if (depth > 8 || paths.size >= MAX_SUGGESTIONS) return;
    if (value === null || typeof value !== "object" || Array.isArray(value) || value instanceof Set) {
      add(prefix);
      return;
    }
    if (seen.has(value) || value instanceof foundry.abstract.Document || value instanceof Map) return;
    seen.add(value);
    for (const [key, child] of Object.entries(value)) {
      if (typeof child === "function" || key.startsWith("_") || key === "parent") continue;
      walkData(child, prefix ? `${prefix}.${key}` : key, depth + 1, seen);
    }
  };
  const attempt = (fn) => {
    try {
      fn();
    } catch {}
  };
  attempt(() => {
    for (const model of Object.values(CONFIG[documentName]?.dataModels ?? {})) attempt(() => walkSchema(model.schema, "", 0));
  });
  attempt(() => {
    for (const data of Object.values(game.model?.[documentName] ?? {})) attempt(() => walkData(data, "", 0, new WeakSet()));
  });
  attempt(() => {
    const documents = documentName === "Item"
      ? [...game.items.contents, ...game.actors.contents.flatMap((actor) => actor.items.contents)]
      : game.actors.contents;
    for (const document of documents.slice(0, MAX_SCANNED_DOCUMENTS)) attempt(() => walkData(document.system, "", 0, new WeakSet()));
  });
  return Array.from(paths).sort((a, b) => a.localeCompare(b));
}

/* ------------------------------------------------------------------------- */
/* Draft: the form's editable state                                          */
/* ------------------------------------------------------------------------- */

function adapterDenominations() {
  try {
    return getAdapterCurrency().denominations;
  } catch {
    return [];
  }
}

function denominationRow(id, adapter, entry = {}) {
  return {
    id,
    adapter: !!adapter,
    label: entry.label ?? "",
    abbreviation: entry.abbreviation ?? "",
    value: entry.value ?? null,
    change: typeof entry.change === "boolean" ? entry.change : null,
    actor: entry.actor ? { path: "", ...entry.actor } : emptySource(),
    item: entry.item ? { path: "", ...entry.item } : emptySource(),
  };
}

function configToDraft(config) {
  const paths = {};
  for (const entry of CONFIG_FIELDS) {
    const source = config.paths[entry.section]?.[entry.key];
    foundry.utils.setProperty(paths, entry.id, source ? { path: "", ...source } : emptySource());
  }
  const userDenominations = new Map(config.currency.denominations.map((entry) => [entry.id, entry]));
  const rows = adapterDenominations().map((adapter) => {
    const row = denominationRow(adapter.id, adapter, userDenominations.get(adapter.id));
    userDenominations.delete(adapter.id);
    return row;
  });
  for (const entry of userDenominations.values()) rows.push(denominationRow(entry.id, null, entry));
  const single = config.currency.itemSingle;
  return {
    paths,
    options: {
      health: { ...config.options.health },
      actor: { sizes: Object.entries(config.options.actor.sizes).map(([key, value]) => ({ key, value })) },
    },
    currency: {
      base: config.currency.base,
      rows,
      itemSingle: { denomination: single.denomination, value: single.value ? { path: "", ...single.value } : emptySource() },
    },
    checks: config.checks.map((check) => ({ ...check })),
  };
}

function draftToConfig(draft) {
  const adapters = new Map(adapterDenominations().map((entry) => [entry.id, entry]));
  const denominations = [];
  for (const row of draft.currency.rows) {
    const adapter = adapters.get(row.id);
    const entry = { id: row.id, label: row.label, abbreviation: row.abbreviation, actor: row.actor, item: row.item };
    if (Number.isFinite(row.value)) entry.value = row.value;
    if (typeof row.change === "boolean") entry.change = row.change;
    const overrides = entry.label || entry.abbreviation || "value" in entry || "change" in entry || isConfigured(row.actor) || isConfigured(row.item);
    if (adapter && !overrides) continue;
    denominations.push(entry);
  }
  const sizes = {};
  for (const { key, value } of draft.options.actor.sizes) {
    if (key && Number.isFinite(value) && value > 0) sizes[key] = value;
  }
  return sanitizeUserConfig({
    version: 1,
    paths: draft.paths,
    options: { health: draft.options.health, actor: { sizes } },
    currency: { base: deriveBase(draft, adapters), denominations, itemSingle: draft.currency.itemSingle },
    checks: draft.checks,
  });
}

/**
 * The stored base coin, or (when it is empty or names no existing coin, and
 * the adapter's own base does not apply) the coin worth 1, else the first one.
 */
function deriveBase(draft, adapters) {
  const coins = draft.currency.rows.filter((row) => row.id);
  const ids = new Set([...coins.map((row) => row.id), ...adapters.keys()]);
  const stored = draft.currency.base;
  if (stored && ids.has(stored)) return stored;
  let adapterBase = "";
  try {
    adapterBase = getAdapterCurrency().base;
  } catch {}
  if (adapterBase && ids.has(adapterBase)) return "";
  const worth = (row) => (Number.isFinite(row.value) ? row.value : adapters.get(row.id)?.value ?? 1);
  return (coins.find((row) => worth(row) === 1) ?? coins[0])?.id ?? "";
}

function assignIds(entries, fallback) {
  const used = new Set(entries.map((entry) => entry.id).filter(Boolean));
  for (const entry of entries) {
    if (entry.id || !entry.label) continue;
    const base = slugify(entry.label) || fallback;
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    entry.id = id;
  }
  return entries;
}

function hasContent(config) {
  const empty = sanitizeUserConfig({});
  return !foundry.utils.objectsEqual(config, empty);
}

/* ------------------------------------------------------------------------- */
/* Application                                                               */
/* ------------------------------------------------------------------------- */

export class SystemConfigApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: `${MODULE_ID}-system-config`,
    tag: "form",
    classes: [`${MODULE_ID}-system-config`],
    window: {
      title: `${I18N}.title`,
      icon: "fa-solid fa-diagram-project",
      contentClasses: ["standard-form"],
      resizable: true,
    },
    position: { width: 760, height: 760 },
    form: {
      handler: SystemConfigApp.#onSubmit,
      closeOnSubmit: false,
      submitOnChange: false,
    },
    actions: {
      resetField: SystemConfigApp.#onResetField,
      browsePaths: SystemConfigApp.#onBrowsePaths,
      overrideField: SystemConfigApp.#onOverrideField,
      overrideDenomination: SystemConfigApp.#onOverrideDenomination,
      addSize: SystemConfigApp.#onAddSize,
      removeSize: SystemConfigApp.#onRemoveSize,
      addDenomination: SystemConfigApp.#onAddDenomination,
      removeDenomination: SystemConfigApp.#onRemoveDenomination,
      addCheck: SystemConfigApp.#onAddCheck,
      removeCheck: SystemConfigApp.#onRemoveCheck,
      exportConfig: SystemConfigApp.#onExport,
      importConfig: SystemConfigApp.#onImport,
      resetAll: SystemConfigApp.#onResetAll,
    },
  };

  static PARTS = {
    header: { template: `${TEMPLATES}/header.hbs` },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    body: { template: `${TEMPLATES}/body.hbs`, scrollable: [""] },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  static TABS = {
    sheet: {
      tabs: TAB_IDS.map((id) => ({ id })),
      initial: "actor",
      labelPrefix: `${I18N}.tabs`,
    },
  };

  #draft = configToDraft(getUserConfig());
  #onlyMissing = false;
  #suggestions = null;

  get #systemChecks() {
    return !!getCurrentSystem()?.testsInterface;
  }

  async _preFirstRender(context, options) {
    await super._preFirstRender(context, options);
    await foundry.applications.handlebars.loadTemplates([FIELD_PARTIAL, BROWSE_PARTIAL]);
  }

  /* ----------------------------------------------------------------------- */
  /* Context                                                                 */
  /* ----------------------------------------------------------------------- */

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const draft = this.#draft;
    const hasAdapter = !!getAdapterDataPaths();
    const sourceOptions = { path: `${I18N}.source.path`, flag: `${I18N}.source.flag` };
    this.#suggestions ??= { Actor: collectSystemPaths("Actor"), Item: collectSystemPaths("Item") };
    const browse = Object.fromEntries(["Actor", "Item"].map((documentName) => {
      const disabled = !this.#suggestions[documentName].length;
      return [documentName, { documentName, disabled, tooltip: localize(disabled ? "picker.empty" : "picker.browse") }];
    }));
    const fieldRow = (fieldId, documentName, label, hint, flag, source, namePrefix, group) => ({
      fieldId,
      documentName,
      label,
      hint,
      flag,
      source: source?.source === "flag" && flag ? "flag" : "path",
      path: source?.path ?? "",
      namePrefix,
      group,
      sourceOptions,
      browse: browse[documentName],
    });

    const sections = Object.fromEntries(TAB_IDS.map((id) => [id, []]));
    for (const entry of CONFIG_FIELDS) {
      const source = foundry.utils.getProperty(draft.paths, entry.id);
      sections[entry.section].push(fieldRow(entry.id, entry.documentName, entry.label, entry.hint, entry.flag, source, `paths.${entry.id}`));
    }

    const adapterOptions = getAdapterOptions();
    const yesNo = (value) => game.i18n.localize(value ? "Yes" : "No");
    const adapterPrimary = adapterOptions.health.primary ? localize(`options.primary.${adapterOptions.health.primary}`) : localize("options.primary.inferred");
    const adapterSizes = Object.entries(adapterOptions.actor.sizes).map(([key, value]) => `${key} = ${value}`).join(", ");

    const adapterCurrency = getAdapterCurrency();
    const adapterById = new Map(adapterCurrency.denominations.map((entry) => [entry.id, entry]));
    const coinLabel = (row) => row.label || (adapterById.get(row.id)?.label ? game.i18n.localize(adapterById.get(row.id).label) : row.id);
    const currencyRows = draft.currency.rows.map((row, index) => {
      const adapter = adapterById.get(row.id);
      const prefix = `currency.denominations.${index}`;
      return {
        ...row,
        index,
        prefix,
        change: row.change == null ? "" : String(row.change),
        expanded: !adapter || !!(row.label || row.abbreviation || row.value != null || row.change != null || isConfigured(row.actor) || isConfigured(row.item)),
        systemName: adapter?.label ? game.i18n.localize(adapter.label) : row.id,
        systemValue: adapter ? String(adapter.value) : "",
        valuePlaceholder: adapter ? String(adapter.value) : "1",
        actorRow: { ...fieldRow(`currency.actor.${row.id}`, "Actor", CURRENCY_FIELDS.actor.label, CURRENCY_FIELDS.actor.hint, CURRENCY_FIELDS.actor.flag, row.actor, `${prefix}.actor`), compact: true },
      };
    });
    const coinChoices = { "": localize("currency.mainCoin") };
    for (const row of draft.currency.rows) if (row.id) coinChoices[row.id] = coinLabel(row);
    const singleDenomination = draft.currency.itemSingle.denomination;
    if (singleDenomination && !(singleDenomination in coinChoices)) coinChoices[singleDenomination] = singleDenomination;
    const priceElsewhere = draft.currency.rows.some((row) => isConfigured(row.item) || describeAdapterField(`currency.item.${row.id}`).kind !== "none");
    const single = fieldRow("currency.itemSingle.value", "Item", "currency.price.label", "currency.price.hint", CURRENCY_FIELDS.itemSingle.flag, draft.currency.itemSingle.value, "currency.itemSingle.value");
    Object.assign(single, {
      label: `${I18N}.currency.price.label`,
      hint: `${I18N}.currency.price.hint`,
      hintBelow: true,
      neededId: "currency.itemPrice",
      covered: priceElsewhere,
      coins: { name: "currency.itemSingle.denomination", choices: coinChoices, selected: singleDenomination },
    });

    return Object.assign(context, {
      appId: this.id,
      notice: hasAdapter ? format("notice.adapter", { system: game.system.title }) : format("notice.noAdapter", { system: game.system.title }),
      onlyMissing: this.#onlyMissing,
      browse,
      sections,
      healthOptions: {
        primary: draft.options.health.primary ?? "",
        primaryChoices: {
          "": format("options.useSystem", { value: adapterPrimary }),
          health: localize("options.primary.health"),
          wounds: localize("options.primary.wounds"),
        },
        invert: draft.options.health.invert == null ? "" : String(draft.options.health.invert),
        invertChoices: {
          "": format("options.useSystem", { value: yesNo(adapterOptions.health.invert) }),
          true: game.i18n.localize("Yes"),
          false: game.i18n.localize("No"),
        },
      },
      sizes: { rows: draft.options.actor.sizes, adapter: adapterSizes },
      currency: {
        base: draft.currency.base,
        handler: adapterCurrency.handler,
        rows: currencyRows,
        single,
      },
      checks: { systemProvided: this.#systemChecks, rows: draft.checks },
      buttons: [{ type: "submit", icon: "fa-solid fa-floppy-disk", label: "SETTINGS.Save" }],
    });
  }

  _getHeaderControls() {
    return [
      ...super._getHeaderControls(),
      { action: "importConfig", icon: "fa-solid fa-file-import", label: `${I18N}.buttons.import` },
      { action: "exportConfig", icon: "fa-solid fa-file-export", label: `${I18N}.buttons.export` },
      { action: "resetAll", icon: "fa-solid fa-arrow-rotate-left", label: `${I18N}.buttons.resetAll` },
    ];
  }

  /* ----------------------------------------------------------------------- */
  /* Rendering and live updates                                              */
  /* ----------------------------------------------------------------------- */

  _onFirstRender(context, options) {
    super._onFirstRender(context, options);
    this.element.addEventListener("input", this.#onInput.bind(this));
    this.element.addEventListener("change", this.#onChange.bind(this));
  }

  _onRender(context, options) {
    super._onRender(context, options);
    game.tooltip?.deactivate?.();
    this.element.classList.toggle("rsa-only-missing", this.#onlyMissing);
    this.#refreshAll();
  }

  #onInput(event) {
    const target = event.target;
    if (target.dataset.role === "denomination-id") {
      const denomination = target.closest(".rsa-denomination");
      const id = target.value.trim();
      for (const row of denomination.querySelectorAll(".rsa-field")) row.dataset.field = `currency.${row.dataset.kind}.${id}`;
      this.#refreshAll();
      return;
    }
    this.#refreshAll();
  }

  #onChange(event) {
    const role = event.target.dataset.role;
    if (role === "only-missing") {
      this.#onlyMissing = event.target.checked;
      this.element.classList.toggle("rsa-only-missing", this.#onlyMissing);
    } else if (role === "import-file") {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (file) this.importFile(file);
    } else {
      this.#refreshAll();
    }
  }

  #refreshAll() {
    const form = this.element;
    if (!form) return;
    const rows = Array.from(form.querySelectorAll(".rsa-field"));
    for (const row of rows) this.#refreshRow(row);
    for (const row of rows) if (row.dataset.covered === "true" && row.dataset.status === "missing") this.#setStatus(row, "unused");
    for (const denomination of form.querySelectorAll('.rsa-denomination[data-expanded="false"]')) {
      if (denomination.querySelector('.rsa-field[data-status="missing"]')) denomination.dataset.expanded = "true";
    }
    this.#markRequirements(form);
    for (const tab of TAB_IDS) {
      const section = form.querySelector(`section.tab[data-tab="${tab}"]`);
      const link = form.querySelector(`nav.tabs [data-tab="${tab}"]`);
      if (!section || !link) continue;
      const count = section.querySelectorAll('.rsa-field[data-status="missing"]').length;
      let badge = link.querySelector(".rsa-missing-count");
      if (!count) {
        badge?.remove();
        continue;
      }
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "rsa-missing-count";
        link.append(badge);
      }
      badge.textContent = String(count);
      badge.dataset.tooltip = format("missingCount", { count });
    }
  }

  #markRequirements(form) {
    try {
      for (const icon of form.querySelectorAll(".rsa-needed")) icon.remove();
      let config;
      try {
        config = draftToConfig(this.#readForm());
      } catch {
        config = getUserConfig();
      }
      const required = new Map(getMissingRequirements(config).map(({ id, modules }) => [id, modules]));
      const optional = new Map(getMissingRequirements(config, { optional: true }).map(({ id, modules }) => [id, modules]));
      const describe = (id) => [...(required.get(id) ?? []), ...(optional.get(id) ?? [])];
      for (const target of form.querySelectorAll("[data-needed]")) {
        const id = target.dataset.needed;
        if (!required.has(id) && !optional.has(id)) continue;
        target.prepend(createWarningIcon(neededByLines(describe(id)), { info: !required.has(id) }), " ");
      }
      for (const tab of TAB_IDS) {
        const section = form.querySelector(`section.tab[data-tab="${tab}"]`);
        const link = form.querySelector(`nav.tabs [data-tab="${tab}"]`);
        if (!section || !link) continue;
        const icons = Array.from(section.querySelectorAll(".rsa-needed"));
        if (!icons.length) continue;
        const info = icons.every((icon) => icon.classList.contains("rsa-optional"));
        const ids = icons.filter((icon) => info || !icon.classList.contains("rsa-optional")).map((icon) => icon.closest("[data-needed]")?.dataset.needed).filter(Boolean);
        const lines = [localize(info ? "needed.tabOptional" : "needed.tab"), ...ids.map((id) => `${game.i18n.localize(requirementLabel(id))}: ${describe(id).map((module) => module.title).join(", ")}`)];
        link.prepend(createWarningIcon(lines, { info }), " ");
      }
    } catch (err) {
      console.warn("[Ripper System Abstraction] Could not mark the needed fields:", err);
    }
  }

  #refreshRow(row) {
    try {
      const fieldId = row.dataset.field;
      const sourceInput = row.querySelector('[data-role="source"]');
      const pathInput = row.querySelector('[data-role="path"]');
      const source = sourceInput?.value === "flag" ? "flag" : "path";
      const path = (pathInput?.value ?? "").trim().replace(/^system\./, "");
      const configured = source === "flag" || !!path;
      const adapter = describeAdapterField(fieldId);
      const provided = adapter.kind !== "none";
      const system = adapter.kind === "path" ? adapter.candidates.join(" | ") : localize("system.builtIn");
      if (pathInput) {
        pathInput.hidden = source === "flag";
        const browseButton = row.querySelector('[data-action="browsePaths"]');
        if (browseButton) browseButton.hidden = source === "flag";
        pathInput.placeholder = provided ? system : localize("placeholder.none");
      }
      this.#setStatus(row, provided ? (configured ? "overridden" : "provided") : configured ? "configured" : "missing");
      for (const element of row.querySelectorAll('[data-role="system"]')) element.textContent = format("system.label", { path: system });
      const overrides = row.querySelector('[data-role="overrides"]');
      if (overrides) overrides.textContent = format("system.overrides", { path: system });
    } catch (err) {
      console.warn("[Ripper System Abstraction] Could not refresh a configuration row:", err);
    }
  }

  #setStatus(row, status) {
    row.dataset.status = status;
    if (status !== "provided") delete row.dataset.expanded;
  }

  /* ----------------------------------------------------------------------- */
  /* Reading the form                                                        */
  /* ----------------------------------------------------------------------- */

  #sync() {
    try {
      this.#draft = this.#readForm();
    } catch (err) {
      console.warn("[Ripper System Abstraction] Could not read the configuration form:", err);
    }
    return this.#draft;
  }

  #readForm() {
    const data = foundry.utils.expandObject(new foundry.applications.ux.FormDataExtended(this.element).object);
    const text = (value) => (typeof value === "string" ? value.trim() : "");
    const source = (value) => ({ source: value?.source === "flag" ? "flag" : "path", path: text(value?.path) });
    const number = (value) => (typeof value === "number" && Number.isFinite(value) ? value : null);

    const paths = {};
    for (const entry of CONFIG_FIELDS) foundry.utils.setProperty(paths, entry.id, source(foundry.utils.getProperty(data.paths ?? {}, entry.id)));

    const invert = data.options?.health?.invert;
    const rows = assignIds(Object.values(data.currency?.denominations ?? {}).map((row) => ({
      id: text(row.id),
      adapter: row.adapter === "1",
      label: text(row.label),
      abbreviation: text(row.abbreviation),
      value: number(row.value),
      change: row.change === "true" ? true : row.change === "false" ? false : null,
      actor: source(row.actor),
      item: source(row.item),
    })), "coin");

    const checks = this.#systemChecks
      ? this.#draft.checks
      : assignIds(Object.values(data.checks ?? {}).map((check) => ({ id: text(check.id), label: text(check.label), formula: text(check.formula) })), "check");

    return {
      paths,
      options: {
        health: { primary: text(data.options?.health?.primary), invert: invert === "true" ? true : invert === "false" ? false : null },
        actor: { sizes: Object.values(data.options?.actor?.sizes ?? {}).map((row) => ({ key: text(row.key), value: number(row.value) })) },
      },
      currency: {
        base: text(data.currency?.base),
        rows,
        itemSingle: { denomination: text(data.currency?.itemSingle?.denomination), value: source(data.currency?.itemSingle?.value) },
      },
      checks,
    };
  }

  /** The configuration as currently edited in the form (sanitised, not saved). */
  get editedConfig() {
    return draftToConfig(this.#sync());
  }

  /* ----------------------------------------------------------------------- */
  /* Actions                                                                 */
  /* ----------------------------------------------------------------------- */

  static async #onSubmit() {
    try {
      const config = await setUserConfig(this.editedConfig);
      this.#draft = configToDraft(config);
      ui.notifications.info(localize("notifications.saved"));
      this.render();
    } catch (err) {
      console.error("[Ripper System Abstraction] Could not save the system configuration:", err);
      ui.notifications.error(localize("notifications.saveFailed"));
    }
  }

  static #onResetField(event, target) {
    const row = target.closest(".rsa-field");
    const sourceInput = row?.querySelector('[data-role="source"]');
    const pathInput = row?.querySelector('[data-role="path"]');
    if (sourceInput?.tagName === "SELECT") sourceInput.value = "path";
    if (pathInput) pathInput.value = "";
    this.#refreshAll();
  }

  static #onBrowsePaths(event, target) {
    const input = target.closest(".form-fields")?.querySelector('input[type="text"]');
    if (input) openPathPicker(target, input, this.#suggestions?.[target.dataset.document] ?? []);
  }

  _onClose(options) {
    closePathPicker();
    super._onClose(options);
  }

  static #onOverrideField(event, target) {
    const row = target.closest(".rsa-field");
    if (!row) return;
    row.dataset.expanded = "true";
    row.querySelector('[data-role="path"]')?.focus();
  }

  static #onOverrideDenomination(event, target) {
    const denomination = target.closest(".rsa-denomination");
    if (!denomination) return;
    denomination.dataset.expanded = "true";
    for (const row of denomination.querySelectorAll(".rsa-field")) row.dataset.expanded = "true";
  }

  #mutate(fn) {
    this.#sync();
    fn(this.#draft);
    this.render();
  }

  static #onAddSize() {
    this.#mutate((draft) => draft.options.actor.sizes.push({ key: "", value: 1 }));
  }

  static #onRemoveSize(event, target) {
    this.#mutate((draft) => draft.options.actor.sizes.splice(Number(target.dataset.index), 1));
  }

  static #onAddDenomination() {
    this.#mutate((draft) => draft.currency.rows.push(denominationRow("", null)));
  }

  static #onRemoveDenomination(event, target) {
    this.#mutate((draft) => draft.currency.rows.splice(Number(target.dataset.index), 1));
  }

  static #onAddCheck() {
    this.#mutate((draft) => draft.checks.push({ id: "", label: "", formula: "" }));
  }

  static #onRemoveCheck(event, target) {
    this.#mutate((draft) => draft.checks.splice(Number(target.dataset.index), 1));
  }

  static #onExport() {
    try {
      const data = JSON.stringify(getUserConfig(), null, 2);
      foundry.utils.saveDataToFile(data, "application/json", `${MODULE_ID}-system-config-${game.system.id}.json`);
    } catch (err) {
      console.warn("[Ripper System Abstraction] Could not export the system configuration:", err);
    }
  }

  static #onImport() {
    this.element.querySelector('[data-role="import-file"]')?.click();
  }

  /**
   * Load a configuration file into the form, without saving it.
   *
   * @param {File} file
   */
  async importFile(file) {
    let parsed = null;
    try {
      parsed = JSON.parse(await foundry.utils.readTextFromFile(file));
    } catch {
      parsed = null;
    }
    const config = sanitizeUserConfig(parsed);
    if (!hasContent(config)) {
      ui.notifications.warn(localize("notifications.importEmpty"));
      return;
    }
    this.#draft = configToDraft(config);
    ui.notifications.info(localize("notifications.imported"));
    await this.render();
  }

  static async #onResetAll() {
    const confirmed = await DialogV2.confirm({
      window: { title: `${I18N}.resetAll.title` },
      content: `<p>${localize("resetAll.content")}</p>`,
      rejectClose: false,
    });
    if (!confirmed) return;
    this.#draft = configToDraft(sanitizeUserConfig({}));
    this.render();
  }
}
