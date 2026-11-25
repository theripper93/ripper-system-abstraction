import { getAdapterDataPaths } from "./systems/_index.js";
import { getPath } from "./api/core.js";

// Not imported from main.js: this file is evaluated before main.js's body runs.
const MODULE_ID = "ripper-system-abstraction";
const SETTING_KEY = "systemConfig";
const CONFIG_VERSION = 1;
const FLAG_ROOT = `flags.${MODULE_ID}.data`;
const I18N = `${MODULE_ID}.systemConfig`;
const ID_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * The dataPaths every adapter starts from (same shape as `_template.js`).
 * `health.primary` is left out on purpose so the track is inferred.
 */
const EMPTY_DATA_PATHS = {
  actor: { type: "", typeChoices: () => ({}), subtype: "", size: "", sizes: {}, level: "", role: "" },
  health: { current: "", maximum: "", temporary: "", minimum: "", wounds: "", maximumWounds: "" },
  item: { quantity: "", weight: "", equipped: "", attuned: "", uses: "", maximumUses: "", container: "" },
  currency: {
    base: "",
    actor: { denominations: {} },
    item: { single: { value: "", denomination: "" }, denominations: {} },
    denominations: {},
  },
  experience: { current: "", maximum: "" },
  features: {
    supportsHealth: false,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: false,
    supportsWeight: false,
    supportsEquipment: false,
    supportsAttunement: false,
  },
};

function field(section, key, documentName, type, { flag = true, feature = null, clears = [], flagDefault } = {}) {
  return {
    id: `${section}.${key}`,
    section,
    key,
    documentName,
    type,
    flag,
    feature,
    clears,
    flagDefault,
    label: `${I18N}.fields.${section}.${key}.label`,
    hint: `${I18N}.fields.${section}.${key}.hint`,
  };
}

/**
 * The fields a GM can map, in display order. Each field's id is also its
 * location in the dataPaths (`health.current` -> `dataPaths.health.current`).
 *
 * - `documentName`: the document the value lives on ("Actor" or "Item").
 * - `type`: "number", "string", "boolean" or "stringList".
 * - `flag`: whether the value may be stored by RSA (a flag) instead of a path.
 * - `feature`: the feature flag a mapping of this field turns on.
 * - `clears`: adapter dataPaths dropped when this field is mapped, since they
 *   describe the adapter's own storage of the field.
 * - `flagDefault`: the value read from a flag that was never written.
 */
export const CONFIG_FIELDS = [
  field("actor", "type", "Actor", "stringList", { flag: false }),
  field("actor", "subtype", "Actor", "string"),
  field("actor", "size", "Actor", "string"),
  field("actor", "level", "Actor", "number"),
  field("actor", "role", "Actor", "string"),
  field("health", "current", "Actor", "number", { feature: "supportsHealth" }),
  field("health", "maximum", "Actor", "number"),
  field("health", "temporary", "Actor", "number", { feature: "supportsTemporaryHealth" }),
  field("health", "minimum", "Actor", "number"),
  field("health", "wounds", "Actor", "number", { feature: "supportsWounds" }),
  field("health", "maximumWounds", "Actor", "number"),
  // A never-written flag quantity counts as one item.
  field("item", "quantity", "Item", "number", { flagDefault: 1 }),
  field("item", "weight", "Item", "number", { feature: "supportsWeight" }),
  field("item", "equipped", "Item", "boolean", { feature: "supportsEquipment", clears: ["equippedValue", "unequippedValue"], flagDefault: false }),
  field("item", "attuned", "Item", "boolean", { feature: "supportsAttunement", clears: ["attunedValue", "unattunedValue"], flagDefault: false }),
  field("item", "uses", "Item", "number", { clears: ["usesSpent"] }),
  field("item", "maximumUses", "Item", "number"),
  field("item", "container", "Item", "string"),
  field("experience", "current", "Actor", "number"),
  field("experience", "maximum", "Actor", "number"),
];

/**
 * The per-denomination currency fields, addressed as `currency.actor.<id>`,
 * `currency.item.<id>` and `currency.itemSingle.value`.
 */
export const CURRENCY_FIELDS = {
  // A never-written flag balance holds no coins.
  actor: { documentName: "Actor", type: "number", flag: true, flagDefault: 0, label: `${I18N}.currency.actor.label`, hint: `${I18N}.currency.actor.hint` },
  item: { documentName: "Item", type: "number", flag: true, label: `${I18N}.currency.item.label`, hint: `${I18N}.currency.item.hint` },
  itemSingle: { documentName: "Item", type: "number", flag: true, label: `${I18N}.currency.itemSingle.label`, hint: `${I18N}.currency.itemSingle.hint` },
};

const FIELDS_BY_ID = new Map(CONFIG_FIELDS.map((entry) => [entry.id, entry]));

/* ------------------------------------------------------------------------- */
/* Sanitising                                                                */
/* ------------------------------------------------------------------------- */

function isObject(value) {
  return foundry.utils.getType(value) === "Object";
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeSource(value, allowFlag) {
  if (!isObject(value)) return null;
  if (value.source === "flag") return allowFlag ? { source: "flag" } : null;
  if (value.source !== "path") return null;
  const path = text(value.path).replace(/^system\./, "");
  return path ? { source: "path", path } : null;
}

function sanitizePaths(paths) {
  const result = { actor: {}, health: {}, item: {}, experience: {} };
  if (!isObject(paths)) return result;
  for (const entry of CONFIG_FIELDS) {
    const source = sanitizeSource(paths[entry.section]?.[entry.key], entry.flag);
    if (source) result[entry.section][entry.key] = source;
  }
  return result;
}

function sanitizeOptions(options) {
  const health = isObject(options?.health) ? options.health : {};
  const primary = ["health", "wounds"].includes(health.primary) ? health.primary : "";
  const invert = typeof health.invert === "boolean" ? health.invert : null;
  const sizes = {};
  for (const [key, value] of Object.entries(isObject(options?.actor?.sizes) ? options.actor.sizes : {})) {
    if (key && typeof value === "number" && Number.isFinite(value) && value > 0) sizes[key] = value;
  }
  const extraTypes = typeof options?.actor?.extraTypes === "boolean" ? options.actor.extraTypes : null;
  return { health: { primary, invert }, actor: { sizes, extraTypes } };
}

function sanitizeDenomination(value, seen) {
  if (!isObject(value)) return null;
  const id = text(value.id);
  if (!ID_PATTERN.test(id) || seen.has(id)) return null;
  seen.add(id);
  const result = { id, label: text(value.label), abbreviation: text(value.abbreviation) };
  if (typeof value.value === "number" && Number.isFinite(value.value) && value.value > 0) result.value = value.value;
  if (typeof value.change === "boolean") result.change = value.change;
  const actor = sanitizeSource(value.actor, CURRENCY_FIELDS.actor.flag);
  const item = sanitizeSource(value.item, CURRENCY_FIELDS.item.flag);
  if (actor) result.actor = actor;
  if (item) result.item = item;
  return result;
}

function sanitizeCurrency(currency) {
  const source = isObject(currency) ? currency : {};
  const seen = new Set();
  const denominations = (Array.isArray(source.denominations) ? source.denominations : [])
    .map((entry) => sanitizeDenomination(entry, seen))
    .filter(Boolean);
  const single = isObject(source.itemSingle) ? source.itemSingle : {};
  const itemSingle = { denomination: text(single.denomination).replace(/^system\./, "") };
  const value = sanitizeSource(single.value, CURRENCY_FIELDS.itemSingle.flag);
  if (value) itemSingle.value = value;
  return { base: text(source.base), denominations, itemSingle };
}

function sanitizeChecks(checks) {
  const seen = new Set();
  const result = [];
  for (const entry of Array.isArray(checks) ? checks : []) {
    if (!isObject(entry)) continue;
    const id = text(entry.id);
    const formula = text(entry.formula);
    if (!ID_PATTERN.test(id) || seen.has(id) || !formula) continue;
    seen.add(id);
    result.push({ id, label: text(entry.label) || id, formula });
  }
  return result;
}

/**
 * Turn any stored value into a well-formed user mapping. Bad parts are
 * dropped; a value from an unknown (newer) version is ignored entirely.
 * Unconfigured `paths` leaves and denomination `actor`/`item` sources are
 * absent from the result.
 *
 * @param {*} value
 * @returns {Object}
 */
export function sanitizeUserConfig(value) {
  const source = isObject(value) ? value : {};
  const version = source.version ?? CONFIG_VERSION;
  const valid = version === CONFIG_VERSION;
  if (!valid) console.warn(`[Ripper System Abstraction] Ignoring the system configuration: unknown version "${version}".`);
  const data = valid ? source : {};
  return {
    version: CONFIG_VERSION,
    paths: sanitizePaths(data.paths),
    options: sanitizeOptions(data.options),
    currency: sanitizeCurrency(data.currency),
    checks: sanitizeChecks(data.checks),
  };
}

/* ------------------------------------------------------------------------- */
/* Reading and writing the setting                                           */
/* ------------------------------------------------------------------------- */

let cachedConfig = null;
let cacheVersion = 0;

/**
 * The world's user mapping, sanitised. Never throws.
 *
 * @returns {Object}
 */
export function getUserConfig() {
  if (cachedConfig) return cachedConfig;
  let stored = {};
  try {
    stored = game.settings.get(MODULE_ID, SETTING_KEY);
  } catch {
    return sanitizeUserConfig({});
  }
  try {
    cachedConfig = sanitizeUserConfig(stored);
  } catch (err) {
    console.warn("[Ripper System Abstraction] Ignoring a malformed system configuration:", err);
    cachedConfig = sanitizeUserConfig({});
  }
  return cachedConfig;
}

/**
 * Store a new user mapping (sanitised first). GM only.
 *
 * @param {Object} config
 * @returns {Promise<Object>} The stored, sanitised config.
 */
export async function setUserConfig(config) {
  const sanitized = sanitizeUserConfig(config);
  await game.settings.set(MODULE_ID, SETTING_KEY, sanitized);
  return sanitized;
}

/**
 * Remove the user mapping, restoring the adapter's behaviour.
 *
 * @returns {Promise<Object>}
 */
export async function clearUserConfig() {
  await game.settings.set(MODULE_ID, SETTING_KEY, {});
  return getUserConfig();
}

/**
 * Drop every cached merge so the next read uses the stored setting.
 */
export function invalidateUserConfig() {
  cachedConfig = null;
  cacheVersion++;
}

/**
 * Whether RSA adds per-actor creature types (stored in the
 * `flags.ripper-system-abstraction.creatureType` flag) to the system's own
 * types. The explicit `options.actor.extraTypes` wins; when it is unset the
 * legacy `manualConfig` world setting decides.
 *
 * @param {Object} [config] Defaults to the stored configuration.
 * @returns {boolean}
 */
export function isExtraTypesEnabled(config = getUserConfig()) {
  const explicit = config?.options?.actor?.extraTypes;
  if (typeof explicit === "boolean") return explicit;
  try {
    return game.settings.get(MODULE_ID, "manualConfig") === true;
  } catch {
    return false;
  }
}

/**
 * The GM-defined named checks.
 *
 * @returns {{id: string, label: string, formula: string}[]}
 */
export function getNamedChecks() {
  return getUserConfig().checks;
}

/* ------------------------------------------------------------------------- */
/* Merging                                                                   */
/* ------------------------------------------------------------------------- */

function flagAccessor(flagPath, flagDefault) {
  const path = `${FLAG_ROOT}.${flagPath}`;
  return {
    get: (document) => foundry.utils.getProperty(document, path) ?? flagDefault,
    set: (document, value) => ({ [path]: value }),
  };
}

function toSpec(source, flagPath, flagDefault) {
  if (!source) return null;
  return source.source === "flag" ? flagAccessor(flagPath, flagDefault) : source.path;
}

function evaluate(value) {
  return typeof value === "function" ? value() : value;
}

function applyCurrency(dp, currency) {
  const cfg = dp.currency;
  if (currency.base) cfg.base = currency.base;
  let actorMapped = false;
  let itemMapped = false;
  for (const entry of currency.denominations) {
    // A new denomination with no declared value counts as one base unit.
    const denomination = (cfg.denominations[entry.id] ??= { value: 1 });
    if (entry.label) denomination.label = entry.label;
    if (entry.abbreviation) denomination.abbreviation = entry.abbreviation;
    if (entry.value != null) denomination.value = entry.value;
    if (entry.change === false) denomination.change = false;
    else if (entry.change === true) delete denomination.change;
    const actorSpec = toSpec(entry.actor, `currency.${entry.id}`, CURRENCY_FIELDS.actor.flagDefault);
    if (actorSpec) {
      cfg.actor.denominations[entry.id] = actorSpec;
      actorMapped = true;
    }
    const itemSpec = toSpec(entry.item, `currency.${entry.id}`);
    if (itemSpec) {
      cfg.item.denominations[entry.id] = itemSpec;
      itemMapped = true;
    }
  }
  if (actorMapped) delete cfg.actor.handler;
  const singleSpec = toSpec(currency.itemSingle.value, "price");
  if (singleSpec) {
    cfg.item.single.value = singleSpec;
    if (currency.itemSingle.denomination) cfg.item.single.denomination = currency.itemSingle.denomination;
  } else if (itemMapped) {
    cfg.item.single.value = "";
  }
  if (actorMapped || itemMapped || singleSpec) dp.features.supportsCurrency = true;
}

function applyUserConfig(dp, config) {
  for (const entry of CONFIG_FIELDS) {
    const spec = toSpec(config.paths[entry.section][entry.key], entry.id, entry.flagDefault);
    if (spec == null) continue;
    dp[entry.section][entry.key] = spec;
    for (const key of entry.clears) delete dp[entry.section][key];
    if (entry.feature) dp.features[entry.feature] = true;
  }
  const { health, actor } = config.options;
  if (health.primary) dp.health.primary = health.primary;
  if (health.invert != null) dp.health.invert = health.invert;
  if (Object.keys(actor.sizes).length) {
    const adapterSizes = dp.actor.sizes;
    dp.actor.sizes = () => ({ ...(evaluate(adapterSizes) ?? {}), ...actor.sizes });
  }
  applyCurrency(dp, config.currency);
  return dp;
}

function ensureShape(dp) {
  for (const key of ["actor", "health", "item", "experience", "features"]) {
    if (!isObject(dp[key])) dp[key] = {};
  }
  const currency = isObject(dp.currency) ? dp.currency : (dp.currency = {});
  if (!isObject(currency.denominations)) currency.denominations = {};
  if (!isObject(currency.actor)) currency.actor = {};
  if (!isObject(currency.actor.denominations)) currency.actor.denominations = {};
  if (!isObject(currency.item)) currency.item = {};
  if (!isObject(currency.item.single)) currency.item.single = { value: "", denomination: "" };
  if (!isObject(currency.item.denominations)) currency.item.denominations = {};
  return dp;
}

const effectiveCache = new WeakMap();
const NO_ADAPTER = {};

/**
 * The effective dataPaths: the empty template, then the adapter's dataPaths,
 * then (for a document) the adapter's per-type `overrides`, then the user
 * mapping, which wins over everything. Cached until the adapter or the
 * setting changes.
 *
 * @param {Object|null} adapterDataPaths
 * @param {Document} [document]
 * @returns {Object}
 */
export function effectiveDataPaths(adapterDataPaths, document) {
  const adapter = adapterDataPaths ?? NO_ADAPTER;
  let cache = effectiveCache.get(adapter);
  if (!cache || cache.version !== cacheVersion) {
    effectiveCache.set(adapter, (cache = { version: cacheVersion, entries: new Map() }));
  }
  const override = adapterDataPaths?.overrides?.[document?.documentName]?.[document?.type];
  const key = override ? `${document.documentName}.${document.type}` : "";
  if (!cache.entries.has(key)) {
    let dp = foundry.utils.mergeObject(EMPTY_DATA_PATHS, adapterDataPaths ?? {}, { inplace: false });
    if (override) dp = foundry.utils.mergeObject(dp, override, { inplace: false });
    ensureShape(dp);
    try {
      applyUserConfig(dp, getUserConfig());
    } catch (err) {
      console.warn("[Ripper System Abstraction] Could not apply the system configuration:", err);
    }
    cache.entries.set(key, dp);
  }
  return cache.entries.get(key);
}

/* ------------------------------------------------------------------------- */
/* Helpers for the configuration UI                                          */
/* ------------------------------------------------------------------------- */

function adapterLocation(fieldId) {
  const [section, key, id] = String(fieldId ?? "").split(".");
  if (section === "currency") {
    if (key === "actor" && id) return { path: `currency.actor.denominations.${id}`, handler: "currency.actor.handler" };
    if (key === "item" && id) return { path: `currency.item.denominations.${id}` };
    if (key === "itemSingle") return { path: "currency.item.single.value" };
    return null;
  }
  return FIELDS_BY_ID.has(fieldId) ? { path: fieldId } : null;
}

/**
 * How the loaded adapter itself (before the user mapping, ignoring per-type
 * overrides) provides a field. Field ids are those of CONFIG_FIELDS plus
 * `currency.actor.<id>`, `currency.item.<id>` and `currency.itemSingle.value`.
 *
 * @param {string} fieldId
 * @returns {{kind: "path", path: string, candidates: string[]}|{kind: "function"}|{kind: "none"}}
 */
export function describeAdapterField(fieldId) {
  const location = adapterLocation(fieldId);
  const dp = getAdapterDataPaths();
  if (!location || !dp) return { kind: "none" };
  if (location.handler && foundry.utils.getProperty(dp, location.handler)) return { kind: "function" };
  const spec = foundry.utils.getProperty(dp, location.path);
  if (typeof spec === "function" || typeof spec?.get === "function") return { kind: "function" };
  const candidates = (Array.isArray(spec) ? spec : [spec]).filter((c) => typeof c === "string" && c);
  return candidates.length ? { kind: "path", path: candidates[0], candidates } : { kind: "none" };
}

/**
 * The loaded adapter's own currency (before the user mapping), for prefilling
 * the denomination list.
 *
 * @returns {{base: string, handler: boolean, single: boolean,
 *   denominations: {id: string, label: string, abbreviation: string, value: number, change: boolean}[]}}
 */
export function getAdapterCurrency() {
  const cfg = getAdapterDataPaths()?.currency ?? {};
  const denominations = Object.entries(cfg.denominations ?? {}).map(([id, entry]) => ({
    id,
    label: typeof entry?.label === "string" ? entry.label : "",
    abbreviation: typeof entry?.abbreviation === "string" ? entry.abbreviation : "",
    value: typeof entry?.value === "number" ? entry.value : 1,
    change: entry?.change !== false,
  }));
  return { base: cfg.base ?? "", handler: !!cfg.actor?.handler, single: !!cfg.item?.single?.value, denominations };
}

/**
 * The loaded adapter's own options (before the user mapping).
 *
 * @returns {{health: {primary: string, invert: boolean}, actor: {sizes: Object<string, number>}}}
 */
export function getAdapterOptions() {
  const dp = getAdapterDataPaths() ?? {};
  let sizes = {};
  try {
    sizes = evaluate(dp.actor?.sizes) ?? {};
  } catch {}
  return {
    health: { primary: dp.health?.primary ?? "", invert: dp.health?.invert === true },
    actor: { sizes: { ...sizes } },
  };
}

/**
 * The effective value of a field on a document (adapter plus user mapping),
 * for a live preview. Null when the field is unknown, not mapped or unreadable.
 *
 * @param {Document} document
 * @param {string} fieldId
 * @returns {*}
 */
export function readFieldValue(document, fieldId) {
  const location = adapterLocation(fieldId);
  if (!location || !document) return null;
  try {
    const dp = effectiveDataPaths(getAdapterDataPaths(), document);
    if (location.handler) {
      const handler = foundry.utils.getProperty(dp, location.handler);
      if (handler) return handler.get(document)?.[String(fieldId).split(".")[2]] ?? null;
    }
    const spec = foundry.utils.getProperty(dp, location.path);
    return spec ? (getPath(document, spec) ?? null) : null;
  } catch {
    return null;
  }
}

/**
 * The fields of a document name currently mapped to the "stored by RSA" flag
 * source, with the flag path (relative to the document) each one is read from.
 *
 * @param {string} documentName
 * @returns {{id: string, flagPath: string, type: string, flagDefault: *, label: string, denomination?: Object}[]}
 */
export function getFlagFields(documentName) {
  const config = getUserConfig();
  const result = [];
  for (const entry of CONFIG_FIELDS) {
    if (entry.documentName !== documentName || config.paths[entry.section][entry.key]?.source !== "flag") continue;
    result.push({ id: entry.id, flagPath: flagPathOf(entry.id), type: entry.type, flagDefault: entry.flagDefault, label: entry.label });
  }
  for (const kind of ["actor", "item"]) {
    const fieldConfig = CURRENCY_FIELDS[kind];
    if (fieldConfig.documentName !== documentName) continue;
    for (const denomination of config.currency.denominations) {
      if (denomination[kind]?.source !== "flag") continue;
      const id = `currency.${kind}.${denomination.id}`;
      result.push({
        id,
        flagPath: flagPathOf(id),
        type: fieldConfig.type,
        flagDefault: fieldConfig.flagDefault,
        label: fieldConfig.label,
        denomination,
      });
    }
  }
  if (CURRENCY_FIELDS.itemSingle.documentName === documentName && config.currency.itemSingle.value?.source === "flag") {
    const fieldConfig = CURRENCY_FIELDS.itemSingle;
    result.push({ id: "currency.itemSingle.value", flagPath: flagPathOf("currency.itemSingle.value"), type: fieldConfig.type, flagDefault: fieldConfig.flagDefault, label: fieldConfig.label });
  }
  return result;
}

/**
 * The flag path (relative to the document) a "stored by RSA" field is read
 * from, for any field id `describeAdapterField` accepts.
 *
 * @param {string} fieldId
 * @returns {string}
 */
export function flagPathOf(fieldId) {
  const [section, key, id] = String(fieldId ?? "").split(".");
  if (section === "currency") return key === "itemSingle" ? `${FLAG_ROOT}.price` : `${FLAG_ROOT}.currency.${id}`;
  return `${FLAG_ROOT}.${fieldId}`;
}

/**
 * The module API's `config` namespace.
 */
export const config = {
  fields: CONFIG_FIELDS,
  currencyFields: CURRENCY_FIELDS,
  get: getUserConfig,
  set: setUserConfig,
  clear: clearUserConfig,
  sanitize: sanitizeUserConfig,
  describeField: describeAdapterField,
  getAdapterCurrency,
  getAdapterOptions,
  readFieldValue,
  isExtraTypesEnabled,
};
