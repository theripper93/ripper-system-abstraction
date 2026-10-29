import {
  resolveDataPaths,
  getPath,
  setPath,
  executeUpdate,
  unsupported,
} from "./core.js";

function experienceConfig(dp) {
  return dp.experience ?? {};
}

function numeric(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Experience/progression operations. Uses `dataPaths.experience` and never
 * references system-specific paths directly.
 */
export const experience = {
  /**
   * The Actor's current experience, or null when unsupported.
   *
   * @param {Actor} actor
   * @returns {number|null}
   */
  getCurrent(actor) {
    return numeric(getPath(actor, experienceConfig(resolveDataPaths(actor)).current));
  },

  /**
   * The experience required for the next level, or null when unsupported.
   *
   * @param {Actor} actor
   * @returns {number|null}
   */
  getMaximum(actor) {
    return numeric(getPath(actor, experienceConfig(resolveDataPaths(actor)).maximum));
  },

  /**
   * @param {Actor} actor
   * @param {number} value
   * @param {Object} [options]
   * @param {boolean} [options.update=true]
   * @returns {Promise<Actor|Object<string,*>>}
   */
  set(actor, value, options = {}) {
    const spec = experienceConfig(resolveDataPaths(actor)).current;
    if (!spec) throw unsupported(actor, "experience.set", "no experience path");
    return executeUpdate(actor, setPath(actor, spec, Math.max(0, value)), options);
  },

  /**
   * Add (or, with a negative amount, remove) experience. Never drops below 0.
   *
   * @param {Actor} actor
   * @param {number} amount
   * @param {Object} [options]
   * @param {boolean} [options.update=true]
   * @returns {Promise<Actor|Object<string,*>>}
   */
  add(actor, amount, options = {}) {
    const spec = experienceConfig(resolveDataPaths(actor)).current;
    if (!spec) throw unsupported(actor, "experience.add", "no experience path");
    const current = numeric(getPath(actor, spec)) ?? 0;
    return executeUpdate(actor, setPath(actor, spec, Math.max(0, current + amount)), options);
  },
};
