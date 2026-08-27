import { executeUpdate } from "./core.js";

/**
 * Low-level access to a document's system data. Paths are relative to
 * `document.system`.
 */
export const data = {
  /**
   * Get the value at a system data path.
   *
   * @param {Document} document
   * @param {string} path  Path relative to `document.system`.
   * @returns {*}
   */
  get(document, path) {
    return foundry.utils.getProperty(document.system, path);
  },

  /**
   * Set the value at a system data path.
   *
   * @param {Document} document
   * @param {string} path  Path relative to `document.system`.
   * @param {*} value
   * @param {Object} [options]
   * @param {boolean} [options.update=true]  When false, returns the update payload.
   * @returns {Promise<Document|Object<string,*>>}
   */
  set(document, path, value, options = {}) {
    return executeUpdate(document, { [`system.${path}`]: value }, options);
  },
};
