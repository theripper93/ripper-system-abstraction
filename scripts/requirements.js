import { getCurrentSystem } from "./systems/_index.js";
import { CONFIG_FIELDS, describeAdapterField, getAdapterCurrency, getUserConfig, isExtraTypesEnabled } from "./userConfig.js";

const MODULE_ID = "ripper-system-abstraction";
const I18N = `${MODULE_ID}.requirements`;
export const REGISTER_HOOK = `${MODULE_ID}.registerRequirements`;

const FIELD_LABELS = new Map(CONFIG_FIELDS.map((entry) => [entry.id, entry.label]));
const COARSE_IDS = ["currency", "currency.itemPrice", "checks"];
const VALID_IDS = new Set([...FIELD_LABELS.keys(), ...COARSE_IDS]);

const registry = new Map();
const listeners = new Set();

/** Call `listener` whenever the registry or the stored configuration changes. */
export function onRequirementsChanged(listener) {
  if (typeof listener === "function") listeners.add(listener);
}

export function notifyRequirementsChanged() {
  for (const listener of listeners) {
    try {
      listener();
    } catch (err) {
      console.warn("[Ripper System Abstraction] A requirements listener failed:", err);
    }
  }
}

function warn(message, value) {
  console.warn(`[Ripper System Abstraction] requirements.register: ${message}`, value);
}

function normalizeEntry(entry) {
  const value = typeof entry === "string" ? { id: entry } : entry;
  if (foundry.utils.getType(value) !== "Object" || typeof value.id !== "string" || !VALID_IDS.has(value.id)) {
    warn("ignoring an unknown requirement", entry);
    return null;
  }
  const result = { id: value.id, optional: value.optional === true };
  if (typeof value.reason === "string" && value.reason.trim()) result.reason = value.reason.trim();
  return result;
}

/**
 * Declare the RSA features a module needs. Replaces that module's earlier
 * declaration. Never throws; bad input is ignored with a console warning.
 *
 * @param {string} moduleId
 * @param {(string|{id: string, optional?: boolean, reason?: string})[]} entries
 * @returns {{id: string, optional: boolean, reason?: string}[]} The stored entries.
 */
export function registerRequirements(moduleId, entries) {
  try {
    if (typeof moduleId !== "string" || !moduleId) {
      warn("ignoring a registration without a module id", moduleId);
      return [];
    }
    if (!Array.isArray(entries)) {
      warn(`ignoring the entries of "${moduleId}": not an array`, entries);
      return [];
    }
    const seen = new Set();
    const normalized = [];
    for (const entry of entries) {
      const value = normalizeEntry(entry);
      if (!value || seen.has(value.id)) continue;
      seen.add(value.id);
      normalized.push(value);
    }
    registry.set(moduleId, normalized);
    notifyRequirementsChanged();
    return normalized.map((entry) => ({ ...entry }));
  } catch (err) {
    console.warn("[Ripper System Abstraction] requirements.register failed:", err);
    return [];
  }
}

/**
 * @returns {Object<string, {id: string, optional: boolean, reason?: string}[]>}
 */
export function getRequirements() {
  return Object.fromEntries(Array.from(registry, ([moduleId, entries]) => [moduleId, entries.map((entry) => ({ ...entry }))]));
}

function provided(fieldId) {
  try {
    return describeAdapterField(fieldId).kind !== "none";
  } catch {
    return false;
  }
}

function adapterCoins() {
  try {
    return getAdapterCurrency().denominations.map((entry) => entry.id);
  } catch {
    return [];
  }
}

/**
 * Whether a requirement id is available with the given (sanitised) user
 * configuration: provided by the adapter or mapped by the user.
 *
 * @param {string} id
 * @param {Object} [config] Defaults to the stored configuration.
 * @returns {boolean}
 */
export function isRequirementSatisfied(id, config = getUserConfig()) {
  try {
    const denominations = config?.currency?.denominations ?? [];
    switch (id) {
      case "currency":
        return denominations.some((entry) => entry.actor) || adapterCoins().some((coin) => provided(`currency.actor.${coin}`));
      case "currency.itemPrice":
        return !!config?.currency?.itemSingle?.value
          || denominations.some((entry) => entry.item)
          || provided("currency.itemSingle.value")
          || adapterCoins().some((coin) => provided(`currency.item.${coin}`));
      case "checks":
        return !!getCurrentSystem()?.testsInterface || (config?.checks?.length ?? 0) > 0;
      default: {
        if (!FIELD_LABELS.has(id)) return true;
        const [section, key] = id.split(".");
        if (id === "actor.type" && isExtraTypesEnabled(config)) return true;
        return !!config?.paths?.[section]?.[key] || provided(id);
      }
    }
  } catch {
    return true;
  }
}

/**
 * Where a satisfied requirement comes from, as one localised line.
 *
 * @param {string} id
 * @param {Object} [config] Defaults to the stored configuration.
 * @returns {string}
 */
export function describeRequirementSource(id, config = getUserConfig()) {
  const t = (key, data) => game.i18n.format(`${I18N}.source.${key}`, data ?? {});
  const source = (value) => (value?.source === "flag" ? t("flag") : t("path", { path: value?.path ?? "" }));
  try {
    const denominations = config?.currency?.denominations ?? [];
    const coins = (kind) => denominations.filter((entry) => entry[kind]).map((entry) => `${entry.label || entry.id}: ${source(entry[kind])}`);
    switch (id) {
      case "currency":
        return coins("actor").join(", ") || t("system");
      case "currency.itemPrice":
        if (config?.currency?.itemSingle?.value) return source(config.currency.itemSingle.value);
        return coins("item").join(", ") || t("system");
      case "checks":
        if (getCurrentSystem()?.testsInterface) return t("system");
        return t("checks", { checks: (config?.checks ?? []).map((check) => check.label).join(", ") });
      default: {
        const [section, key] = id.split(".");
        const mapped = config?.paths?.[section]?.[key];
        const base = mapped ? source(mapped) : provided(id) ? t("system") : "";
        if (id === "actor.type" && isExtraTypesEnabled(config)) return [base, t("extraTypes")].filter(Boolean).join(", ");
        return base || t("system");
      }
    }
  } catch {
    return "";
  }
}

/**
 * The entries of active modules that are not available, grouped by id: the
 * required ones, or with `optional: true` the optional ones (each module
 * entry then flagged `optional: true`).
 *
 * @param {Object} [config] Defaults to the stored configuration.
 * @param {{optional?: boolean}} [options]
 * @returns {{id: string, modules: {id: string, title: string, reason?: string, optional?: true}[]}[]}
 */
export function getMissingRequirements(config = getUserConfig(), { optional = false } = {}) {
  const missing = new Map();
  try {
    for (const [moduleId, entries] of registry) {
      const module = game.modules.get(moduleId);
      if (!module?.active) continue;
      for (const entry of entries) {
        if (entry.optional !== optional || isRequirementSatisfied(entry.id, config)) continue;
        if (!missing.has(entry.id)) missing.set(entry.id, []);
        missing.get(entry.id).push({ id: moduleId, title: module.title ?? moduleId, ...(entry.reason ? { reason: entry.reason } : {}), ...(optional ? { optional: true } : {}) });
      }
    }
  } catch (err) {
    console.warn("[Ripper System Abstraction] Could not evaluate module requirements:", err);
  }
  return Array.from(missing, ([id, modules]) => ({ id, modules }));
}

/** The label i18n key of a requirement id. */
export function requirementLabel(id) {
  return FIELD_LABELS.get(id) ?? `${I18N}.ids.${id === "currency.itemPrice" ? "itemPrice" : id}`;
}

/** One line per module: "Needed by Camp (reason)" or "Optional for Camp (reason)". */
export function neededByLines(modules) {
  return modules.map(({ title, reason, optional }) => game.i18n.format(`${I18N}.${optional ? "optionalFor" : "neededBy"}`, { module: title }) + (reason ? ` (${reason})` : ""));
}

export const requirements = {
  register: registerRequirements,
  get: getRequirements,
  getMissing: getMissingRequirements,
  isSatisfied: isRequirementSatisfied,
};

/**
 * Let modules register their requirements: fired once at ready, after the
 * system adapter is loaded.
 */
export function callRegisterHook(api) {
  try {
    Hooks.callAll(REGISTER_HOOK, api);
  } catch (err) {
    console.warn("[Ripper System Abstraction] A requirements registration failed:", err);
  }
}

function warningIcon(tooltipHtml, info = false) {
  const icon = document.createElement("i");
  icon.className = info ? "fa-solid fa-circle-info rsa-needed rsa-optional" : "fa-solid fa-triangle-exclamation rsa-needed";
  icon.dataset.tooltipHtml = tooltipHtml;
  icon.setAttribute("aria-label", tooltipHtml.replace(/<[^>]+>/g, " "));
  return icon;
}

export function createWarningIcon(lines, { info = false } = {}) {
  return warningIcon(lines.map((line) => foundry.utils.escapeHTML(line)).join("<br>"), info);
}

function onRenderSettingsConfig(app, element) {
  try {
    const missing = getMissingRequirements();
    if (!missing.length) return;
    const root = element instanceof HTMLElement ? element : element?.[0];
    const button = root?.querySelector(`[data-key="${MODULE_ID}.systemConfigMenu"]`);
    const label = button?.closest(".form-group")?.querySelector("label");
    if (!label || label.querySelector(".rsa-needed")) return;
    const byModule = new Map();
    for (const { id, modules } of missing) {
      for (const module of modules) {
        if (!byModule.has(module.title)) byModule.set(module.title, []);
        byModule.get(module.title).push(game.i18n.localize(requirementLabel(id)));
      }
    }
    const lines = [game.i18n.localize(`${I18N}.settingsTooltip`), ...Array.from(byModule, ([title, labels]) => `${title}: ${labels.join(", ")}`)];
    label.prepend(createWarningIcon(lines), " ");
  } catch (err) {
    console.warn("[Ripper System Abstraction] Could not mark the system configuration menu:", err);
  }
}

export function registerRequirementHooks() {
  Hooks.on("renderSettingsConfig", onRenderSettingsConfig);
}
