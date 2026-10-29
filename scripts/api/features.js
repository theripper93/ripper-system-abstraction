import { resolveDataPaths } from "./core.js";

/**
 * The loaded system's feature flags (`dataPaths.features`).
 */
export const features = {
  /**
   * All feature flags declared by the system adapter.
   *
   * @returns {Object<string, boolean>}
   */
  get() {
    return { ...(resolveDataPaths().features ?? {}) };
  },

  /**
   * Whether the system supports a feature, e.g. "supportsEquipment".
   *
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return resolveDataPaths().features?.[name] === true;
  },
};
