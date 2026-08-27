import { getDataPaths } from "../systems/_index.js";

/**
 * Resolve the dataPaths adapter for the world's current game system.
 *
 * @param {Document} document
 * @returns {Object} The system's dataPaths configuration.
 */
export function resolveDataPaths(document) {
  const dataPaths = getDataPaths();
  if (!dataPaths) {
    throw new Error(
      `[Ripper System Abstraction] No system adapter is loaded for "${game.system.id}".`,
    );
  }
  return dataPaths;
}

/**
 * Resolve a path spec (string, or array of candidate strings) to a single
 * concrete path. Returns null when no usable path exists.
 *
 * @param {string|string[]} spec
 * @returns {string|null}
 */
export function resolvePath(spec) {
  if (Array.isArray(spec)) {
    for (const candidate of spec) {
      if (typeof candidate === "string" && candidate) return candidate;
    }
    return null;
  }
  return typeof spec === "string" && spec ? spec : null;
}

/**
 * Read the value at a dataPaths spec from a document's system data.
 *
 * @param {Document} document
 * @param {string|string[]} spec
 * @returns {*}
 */
export function getPath(document, spec) {
  const path = resolvePath(spec);
  if (!path) return undefined;
  return foundry.utils.getProperty(document.system, path);
}

/**
 * Build the update payload entry for a dataPaths spec.
 *
 * @param {Document} document
 * @param {string|string[]} spec
 * @param {*} value
 * @returns {Object<string, *>}
 */
export function setPath(document, spec, value) {
  const path = resolvePath(spec);
  if (!path) {
    throw unsupported(document, "data write", "no path configured");
  }
  return { [`system.${path}`]: value };
}

/**
 * Central update executor. When `options.update === false` the raw changes
 * payload is returned synchronously without touching the document (for
 * batch-building); otherwise the changes are applied via the document's
 * update method and its promise is returned.
 *
 * @param {Document} document
 * @param {Object<string, *>} changes
 * @param {Object} [options]
 * @param {boolean} [options.update=true]
 * @returns {Object<string,*>|Promise<Document>}
 */
export function executeUpdate(document, changes, options = {}) {
  if (options.update === false) return changes;
  if (!Object.keys(changes).length) return Promise.resolve(document);
  return document.update(changes);
}

/**
 * Build a descriptive error for an unsupported operation.
 *
 * @param {Document} document
 * @param {string} operation
 * @param {string} [detail]
 * @returns {Error}
 */
export function unsupported(document, operation, detail) {
  const name = document?.name ?? document?.id ?? String(document);
  return new Error(
    `[Ripper System Abstraction] ${operation} is not supported for "${name}" (${game.system.id})${detail ? `: ${detail}` : ""}.`,
  );
}
