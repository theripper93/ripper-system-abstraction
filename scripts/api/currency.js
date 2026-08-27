import {
  resolveDataPaths,
  getPath,
  setPath,
  executeUpdate,
  unsupported,
} from "./core.js";

function currencyConfig(dp) {
  return dp.currency ?? {};
}

function denominationRatio(config, name) {
  const entry = config.denominations?.[name];
  return typeof entry?.value === "number" ? entry.value : 1;
}

function roundAmount(value) {
  return Math.round(value * 1e6) / 1e6;
}

/**
 * Currency operations. Uses `dataPaths.currency` (base denomination, relative
 * denomination values, and per-denomination storage paths) and never
 * references system-specific paths directly.
 */
export const currency = {
  /**
   * The Actor's currency as a normalized denomination object.
   *
   * @param {Actor} actor
   * @returns {Object<string, number>}
   */
  get(actor) {
    const config = currencyConfig(resolveDataPaths(actor));
    const actorDenominations = config.actor?.denominations ?? {};
    const result = {};
    for (const [name, path] of Object.entries(actorDenominations)) {
      result[name] = getPath(actor, path) ?? 0;
    }
    return result;
  },

  /**
   * The Actor's total currency converted into the configured base
   * denomination.
   *
   * @param {Actor} actor
   * @returns {number}
   */
  getTotal(actor) {
    const dp = resolveDataPaths(actor);
    const config = currencyConfig(dp);
    const actorDenominations = config.actor?.denominations ?? {};
    let total = 0;
    for (const [name, path] of Object.entries(actorDenominations)) {
      const amount = getPath(actor, path);
      if (typeof amount === "number") {
        total += amount * denominationRatio(config, name);
      }
    }
    return total;
  },

  /**
   * Set Actor currency. Only the supplied denominations are written;
   * unsupplied denominations are left untouched.
   *
   * @param {Actor} actor
   * @param {Object<string, number>} currency
   * @param {Object} [options]
   * @param {boolean} [options.update=true]
   * @returns {Promise<Actor|Object<string,*>>}
   */
  set(actor, currency = {}, options = {}) {
    const config = currencyConfig(resolveDataPaths(actor));
    const actorDenominations = config.actor?.denominations ?? {};
    const changes = {};
    for (const [name, amount] of Object.entries(currency)) {
      const path = actorDenominations[name];
      if (!path) {
        throw unsupported(actor, "currency.set", `actor does not support denomination "${name}"`);
      }
      Object.assign(changes, setPath(actor, path, amount));
    }
    return executeUpdate(actor, changes, options);
  },

  /**
   * Add currency to the Actor.
   *
   * @param {Actor} actor
   * @param {Object<string, number>} currency
   * @param {Object} [options]
   * @param {boolean} [options.update=true]
   * @returns {Promise<Actor|Object<string,*>>}
   */
  add(actor, currency = {}, options = {}) {
    const config = currencyConfig(resolveDataPaths(actor));
    const actorDenominations = config.actor?.denominations ?? {};
    const changes = {};
    for (const [name, amount] of Object.entries(currency)) {
      const path = actorDenominations[name];
      if (!path) {
        throw unsupported(actor, "currency.add", `actor does not support denomination "${name}"`);
      }
      const current = getPath(actor, path) ?? 0;
      Object.assign(changes, setPath(actor, path, current + amount));
    }
    return executeUpdate(actor, changes, options);
  },

  /**
   * Remove currency from the Actor. When the requested denomination is
   * unavailable, higher denominations are converted to cover the shortfall.
   * Never produces negative denominations; throws when funds are
   * insufficient.
   *
   * @param {Actor} actor
   * @param {Object<string, number>} currency
   * @param {Object} [options]
   * @param {boolean} [options.update=true]
   * @returns {Promise<Actor|Object<string,*>>}
   */
  remove(actor, currency = {}, options = {}) {
    const config = currencyConfig(resolveDataPaths(actor));
    const actorDenominations = config.actor?.denominations ?? {};
    const changes = {};

    for (const [name, amount] of Object.entries(currency)) {
      if (amount <= 0) continue;
      const path = actorDenominations[name];
      if (!path) {
        throw unsupported(actor, "currency.remove", `actor does not support denomination "${name}"`);
      }

      let remainingUnits = amount * denominationRatio(config, name);

      const available = Object.entries(actorDenominations).sort(
        (a, b) => denominationRatio(config, b[0]) - denominationRatio(config, a[0]),
      );

      for (const [denomination, denominationPath] of available) {
        if (remainingUnits <= 0) break;
        const current = getPath(actor, denominationPath) ?? 0;
        const units = current * denominationRatio(config, denomination);
        if (units <= 0) continue;

        const takeUnits = Math.min(remainingUnits, units);
        const takeAmount = takeUnits / denominationRatio(config, denomination);
        changes[`system.${denominationPath}`] = roundAmount(current - takeAmount);
        remainingUnits = roundAmount(remainingUnits - takeUnits);
      }

      if (remainingUnits > 0) {
        throw unsupported(actor, "currency.remove", `insufficient funds to remove ${name}`);
      }
    }

    return executeUpdate(actor, changes, options);
  },

  /**
   * An Item's monetary value as a normalized denomination object.
   *
   * @param {Item} item
   * @returns {Object<string, number>}
   */
  getItemValue(item) {
    const config = currencyConfig(resolveDataPaths(item));
    const itemConfig = config.item ?? {};
    if (itemConfig.single?.value) {
      const value = getPath(item, itemConfig.single.value);
      if (value == null) return {};
      const denomination = itemConfig.single.denomination
        ? (getPath(item, itemConfig.single.denomination) ?? config.base ?? "")
        : (config.base ?? "");
      return { [denomination]: value };
    }

    const result = {};
    for (const [name, path] of Object.entries(itemConfig.denominations ?? {})) {
      result[name] = getPath(item, path) ?? 0;
    }
    return result;
  },

  /**
   * Set an Item's monetary value. Supports both single-denomination and
   * multi-denomination representations.
   *
   * @param {Item} item
   * @param {Object<string, number>} currency
   * @param {Object} [options]
   * @param {boolean} [options.update=true]
   * @returns {Promise<Item|Object<string,*>>}
   */
  setItemValue(item, currency = {}, options = {}) {
    const config = currencyConfig(resolveDataPaths(item));
    const itemConfig = config.item ?? {};

    if (itemConfig.single?.value) {
      const base = config.base;
      if (!base) throw unsupported(item, "currency.setItemValue", "no base denomination configured");

      let total = 0;
      for (const [name, amount] of Object.entries(currency)) {
        total += amount * denominationRatio(config, name);
      }

      const changes = setPath(item, itemConfig.single.value, total);
      if (itemConfig.single.denomination) {
        Object.assign(changes, setPath(item, itemConfig.single.denomination, base));
      }
      return executeUpdate(item, changes, options);
    }

    const changes = {};
    for (const [name, amount] of Object.entries(currency)) {
      const path = itemConfig.denominations?.[name];
      if (!path) {
        throw unsupported(item, "currency.setItemValue", `item does not support denomination "${name}"`);
      }
      Object.assign(changes, setPath(item, path, amount));
    }
    return executeUpdate(item, changes, options);
  },
};
