import { getDataPaths } from "../systems/_index.js";

const mergedCache = new WeakMap();

/**
 * Resolve the dataPaths adapter for the world's current game system. When a
 * document is given, `dataPaths.overrides[documentName][type]` is merged over
 * the base configuration (e.g. NPC-specific paths).
 *
 * @param {Document} [document]
 * @returns {Object} The system's dataPaths configuration.
 */
export function resolveDataPaths(document) {
  const dataPaths = getDataPaths();
  if (!dataPaths) {
    throw new Error(
      `[Ripper System Abstraction] No system adapter is loaded for "${game.system.id}".`,
    );
  }
  const override = dataPaths.overrides?.[document?.documentName]?.[document?.type];
  if (!override) return dataPaths;

  let cache = mergedCache.get(dataPaths);
  if (!cache) mergedCache.set(dataPaths, (cache = new Map()));
  const key = `${document.documentName}.${document.type}`;
  if (!cache.has(key)) cache.set(key, foundry.utils.mergeObject(dataPaths, override, { inplace: false }));
  return cache.get(key);
}

/**
 * Resolve a path spec (string, or array of candidate strings) to a single
 * concrete path. Candidates are tried in order and the first one holding a
 * value on the document wins; otherwise the first usable candidate is used.
 * Returns null when no usable path exists.
 *
 * @param {string|string[]} spec
 * @param {Document} [document]
 * @returns {string|null}
 */
export function resolvePath(spec, document) {
  const candidates = (Array.isArray(spec) ? spec : [spec]).filter((c) => typeof c === "string" && c);
  if (document) {
    const found = candidates.find((c) => foundry.utils.getProperty(document.system, c) != null);
    if (found) return found;
  }
  return candidates[0] ?? null;
}

/**
 * Read the value at a dataPaths spec from a document's system data. A spec
 * may also be a function `(document) => value` for derived, read-only data,
 * or an accessor `{ get(document), set(document, value) }` for values spread
 * over several fields.
 *
 * @param {Document} document
 * @param {string|string[]|Function|Object} spec
 * @returns {*}
 */
export function getPath(document, spec) {
  if (typeof spec === "function") return spec(document);
  if (typeof spec?.get === "function") return spec.get(document);
  const path = resolvePath(spec, document);
  if (!path) return undefined;
  return foundry.utils.getProperty(document.system, path);
}

/**
 * Build the update payload entry for a dataPaths spec. Accessor specs return
 * their own payload from `set`.
 *
 * @param {Document} document
 * @param {string|string[]|Object} spec
 * @param {*} value
 * @returns {Object<string, *>}
 */
export function setPath(document, spec, value) {
  if (typeof spec?.set === "function") return spec.set(document, value);
  const path = typeof spec === "function" ? null : resolvePath(spec, document);
  if (!path) {
    throw unsupported(document, "data write", "no writable path configured");
  }
  return { [`system.${path}`]: value };
}

/**
 * Central update executor. When `options.update === false` the raw changes
 * payload is returned synchronously without touching the document (for
 * batch-building); otherwise the changes are applied via the document's
 * update method and its promise is returned. An adapter's optional
 * `afterUpdate(document, changes)` is awaited before the promise resolves.
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
  const afterUpdate = getDataPaths()?.afterUpdate;
  if (typeof afterUpdate !== "function") return document.update(changes);
  return document.update(changes).then(async (result) => {
    await afterUpdate(document, changes);
    return result;
  });
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
