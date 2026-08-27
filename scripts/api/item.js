import {
  resolveDataPaths,
  getPath,
  setPath,
  executeUpdate,
  unsupported,
} from "./core.js";

function itemConfig(dp) {
  return dp.item ?? {};
}

/**
 * Interpret the equipped state of an item. Boolean paths need no metadata;
 * numeric and string enum paths use the optional `equippedValue` /
 * `unequippedValue` hints declared on the adapter.
 */
function isEquippedValue(current, dp) {
  const hint = itemConfig(dp).equippedValue;
  if (typeof current === "boolean") return current;
  if (typeof current === "number") return current >= (typeof hint === "number" ? hint : 1);
  return current === (typeof hint === "string" ? hint : "equipped");
}

/**
 * Item quantity, equipment, and uses/charges operations. Uses
 * `dataPaths.item` and `features` and never references system-specific paths
 * directly.
 */
export const item = {
  // ---------------------------------------------------------------
  // Quantity
  // ---------------------------------------------------------------

  /**
   * The Item's current quantity.
   *
   * @param {Item} item
   * @returns {number|null}
   */
  getQuantity(item) {
    const spec = itemConfig(resolveDataPaths(item)).quantity;
    return spec ? (getPath(item, spec) ?? null) : null;
  },

  /**
   * @param {Item} item
   * @param {number} quantity
   * @param {Object} [options]
   * @param {boolean} [options.update=true]
   * @returns {Promise<Item|Object<string,*>>}
   */
  setQuantity(item, quantity, options = {}) {
    const spec = itemConfig(resolveDataPaths(item)).quantity;
    if (!spec) throw unsupported(item, "item.setQuantity", "no quantity path");
    return executeUpdate(item, setPath(item, spec, quantity), options);
  },

  /**
   * @param {Item} item
   * @param {number} amount
   * @param {Object} [options]
   * @param {boolean} [options.update=true]
   * @returns {Promise<Item|Object<string,*>>}
   */
  addQuantity(item, amount, options = {}) {
    const spec = itemConfig(resolveDataPaths(item)).quantity;
    if (!spec) throw unsupported(item, "item.addQuantity", "no quantity path");
    const current = getPath(item, spec) ?? 0;
    return executeUpdate(item, setPath(item, spec, current + amount), options);
  },

  /**
   * @param {Item} item
   * @param {number} amount
   * @param {Object} [options]
   * @param {boolean} [options.update=true]
   * @returns {Promise<Item|Object<string,*>>}
   */
  removeQuantity(item, amount, options = {}) {
    const spec = itemConfig(resolveDataPaths(item)).quantity;
    if (!spec) throw unsupported(item, "item.removeQuantity", "no quantity path");
    const current = getPath(item, spec) ?? 0;
    return executeUpdate(item, setPath(item, spec, Math.max(0, current - amount)), options);
  },

  // ---------------------------------------------------------------
  // Equipment
  // ---------------------------------------------------------------

  /**
   * Whether the Item is equipped.
   *
   * @param {Item} item
   * @returns {boolean}
   */
  isEquipped(item) {
    const dp = resolveDataPaths(item);
    if (dp.features?.supportsEquipment !== true) {
      throw unsupported(item, "item.isEquipped", "system does not support equipment");
    }
    const spec = itemConfig(dp).equipped;
    if (!spec) throw unsupported(item, "item.isEquipped", "no equipped path");
    return isEquippedValue(getPath(item, spec), dp);
  },

  /**
   * @param {Item} item
   * @param {Object} [options]
   * @param {boolean} [options.update=true]
   * @returns {Promise<Item|Object<string,*>>}
   */
  equip(item, options = {}) {
    const dp = resolveDataPaths(item);
    if (dp.features?.supportsEquipment !== true) {
      throw unsupported(item, "item.equip", "system does not support equipment");
    }
    const spec = itemConfig(dp).equipped;
    if (!spec) throw unsupported(item, "item.equip", "no equipped path");
    const value = itemConfig(dp).equippedValue ?? true;
    return executeUpdate(item, setPath(item, spec, value), options);
  },

  /**
   * @param {Item} item
   * @param {Object} [options]
   * @param {boolean} [options.update=true]
   * @returns {Promise<Item|Object<string,*>>}
   */
  unequip(item, options = {}) {
    const dp = resolveDataPaths(item);
    if (dp.features?.supportsEquipment !== true) {
      throw unsupported(item, "item.unequip", "system does not support equipment");
    }
    const spec = itemConfig(dp).equipped;
    if (!spec) throw unsupported(item, "item.unequip", "no equipped path");
    const value = itemConfig(dp).unequippedValue ?? false;
    return executeUpdate(item, setPath(item, spec, value), options);
  },

  /**
   * @param {Item} item
   * @param {Object} [options]
   * @param {boolean} [options.update=true]
   * @returns {Promise<Item|Object<string,*>>}
   */
  toggleEquipped(item, options = {}) {
    return this.isEquipped(item)
      ? this.unequip(item, options)
      : this.equip(item, options);
  },

  // ---------------------------------------------------------------
  // Uses / Charges
  // ---------------------------------------------------------------

  /**
   * The Item's current remaining uses/charges.
   *
   * @param {Item} item
   * @returns {number|null}
   */
  getUses(item) {
    const spec = itemConfig(resolveDataPaths(item)).uses;
    return spec ? (getPath(item, spec) ?? null) : null;
  },

  /**
   * The Item's maximum uses/charges.
   *
   * @param {Item} item
   * @returns {number|null}
   */
  getMaximumUses(item) {
    const spec = itemConfig(resolveDataPaths(item)).maximumUses;
    return spec ? (getPath(item, spec) ?? null) : null;
  },

  /**
   * @param {Item} item
   * @param {number} value
   * @param {Object} [options]
   * @param {boolean} [options.update=true]
   * @returns {Promise<Item|Object<string,*>>}
   */
  setUses(item, value, options = {}) {
    const spec = itemConfig(resolveDataPaths(item)).uses;
    if (!spec) throw unsupported(item, "item.setUses", "no uses path");
    return executeUpdate(item, setPath(item, spec, value), options);
  },

  /**
   * Consume uses, never dropping below zero.
   *
   * @param {Item} item
   * @param {number} amount
   * @param {Object} [options]
   * @param {boolean} [options.update=true]
   * @returns {Promise<Item|Object<string,*>>}
   */
  consumeUses(item, amount, options = {}) {
    const spec = itemConfig(resolveDataPaths(item)).uses;
    if (!spec) throw unsupported(item, "item.consumeUses", "no uses path");
    const current = getPath(item, spec) ?? 0;
    return executeUpdate(item, setPath(item, spec, Math.max(0, current - amount)), options);
  },

  /**
   * Restore uses to maximum.
   *
   * @param {Item} item
   * @param {Object} [options]
   * @param {boolean} [options.update=true]
   * @returns {Promise<Item|Object<string,*>>}
   */
  restoreUses(item, options = {}) {
    const dp = resolveDataPaths(item);
    const usesSpec = itemConfig(dp).uses;
    const maximumSpec = itemConfig(dp).maximumUses;
    if (!usesSpec || !maximumSpec) {
      throw unsupported(item, "item.restoreUses", "requires uses and maximumUses paths");
    }
    const maximum = getPath(item, maximumSpec);
    return executeUpdate(item, setPath(item, usesSpec, maximum), options);
  },
};
