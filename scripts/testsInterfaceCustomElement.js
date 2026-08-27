import { getTestsInterface } from "./systems/_index.js";

/**
 * Build the DataModel classes describing the inputs required to run a check
 * for the loaded game system. Choices are pulled from system configuration
 * only, never from a specific actor.
 *
 * @returns {Object<string, typeof foundry.abstract.DataModel>}
 */
export function buildInputs() {
  return getTestsInterface().buildInputs();
}

/**
 * Coerce a raw value into the type represented by a DataField.
 *
 * @param {foundry.data.fields.DataField} field
 * @param {*} value
 * @returns {*}
 */
export function coerceValue(field, value) {
  const cleaned = field.clean(value);
  if (field instanceof foundry.data.fields.NumberField) {
    return (typeof cleaned === "number" && Number.isFinite(cleaned)) ? cleaned : null;
  }
  return cleaned;
}

/**
 * Serialize a flat inputs object into a single "key=value|key=value" string.
 * Nested objects (multi-field input models) are serialized as "key.field=value".
 *
 * @param {Object} inputs
 * @returns {string}
 */
export function serialize(inputs) {
  const parts = [];
  for (const [key, value] of Object.entries(inputs ?? {})) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [name, nested] of Object.entries(value)) {
        parts.push(`${key}.${name}=${nested ?? ""}`);
      }
    } else {
      parts.push(`${key}=${value ?? ""}`);
    }
  }
  return parts.join("|");
}

/**
 * Parse a "key=value|key=value" string back into a typed inputs object,
 * coercing values according to the input DataModels returned by buildInputs.
 *
 * @param {string} value            The serialized inputs string.
 * @returns {Object<string, any>}   The parsed and typed inputs object.
 */
export function parse(value) {
  const raw = {};
  if (value) {
    for (const pair of String(value).split("|")) {
      if (!pair) continue;
      const separator = pair.indexOf("=");
      if (separator < 0) continue;
      raw[pair.slice(0, separator).trim()] = pair.slice(separator + 1);
    }
  }

  const inputClasses = buildInputs();
  const inputs = {};

  for (const [key, model] of Object.entries(inputClasses ?? {})) {
    const fields = model.schema?.fields ?? {};
    const names = Object.keys(fields);

    if (names.length === 1) {
      inputs[key] = coerceValue(fields[names[0]], raw[key]);
    } else if (names.length > 1) {
      const nested = {};
      for (const name of names) {
        nested[name] = coerceValue(fields[name], raw[`${key}.${name}`]);
      }
      inputs[key] = nested;
    }
  }

  return inputs;
}

/**
 * Perform a check for the given actor using a serialized inputs string.
 *
 * The string is parsed back into a typed inputs object (via `parse`) which is
 * then passed to the system's `processCheck`.
 *
 * @param {Actor} actor             The actor performing the check.
 * @param {string} value            The serialized inputs string.
 * @param {Object} [options]        Options for the check.
 * @param {boolean} [options.fastForward]  Whether to skip the roll dialog if possible.
 * @param {Event} [options.event]    An optional originating event.
 * @returns {Promise<{canceled: boolean, result: number|null, target: number|null,
 *   success: boolean|null, levelOfSuccess: number|null, criticalSuccess: boolean,
 *   criticalFailure: boolean}>}    The standardized check result.
 */
export async function processCheck(actor, value, options = {}) {
  const inputs = parse(value);
  return getTestsInterface().processCheck(actor, inputs, options);
}

/**
 * A custom element which collects the inputs required to perform a check,
 * without executing the check itself.
 *
 * The element renders one control per input field described by the system's
 * tests interface `buildInputs` and exposes the collected data through:
 *
 *   - `element.value`  A serialized "key=value|key=value" string.
 *   - `element.inputs` A typed object keyed by input name, ready to be
 *                      passed to the system's `processCheck`.
 *
 * A `change` event (bubbles, composed) with detail `{value, inputs}` is
 * dispatched whenever the collected data changes.
 */
export class TestsInterfaceElement extends HTMLElement {
  #fields = [];

  constructor() {
    super();
    this.classList.add("form-fields");
  }

  /** The collected inputs as a single "key=value|key=value" string. */
  get value() {
    return serialize(this.inputs);
  }

  set value(value) {
    const raw = {};
    if (value) {
      for (const pair of String(value).split("|")) {
        if (!pair) continue;
        const separator = pair.indexOf("=");
        if (separator < 0) continue;
        raw[pair.slice(0, separator).trim()] = pair.slice(separator + 1);
      }
    }

    for (const entry of this.#fields) {
      const rawValue = raw[entry.single ? entry.key : `${entry.key}.${entry.name}`];
      if (rawValue !== undefined) entry.control.value = rawValue;
    }

    this.#emit();
  }

  /** The collected inputs as a typed object ready for processCheck. */
  get inputs() {
    const inputs = {};

    for (const entry of this.#fields) {
      const coerced = coerceValue(entry.field, entry.control.value);
      if (entry.single) inputs[entry.key] = coerced;
      else {
        inputs[entry.key] ??= {};
        inputs[entry.key][entry.name] = coerced;
      }
    }

    return inputs;
  }

  /** @override */
  connectedCallback() {
    this.#render();
  }

  /* -------------------------------------------- */

  #render() {
    this.replaceChildren();
    this.#fields = [];

    let inputClasses;
    try {
      inputClasses = buildInputs();
    } catch (err) {
      console.warn("ripper-system-abstraction | Failed to build check inputs:", err);
    }
    if (!inputClasses) {
      this.#emit();
      return;
    }

    for (const [key, model] of Object.entries(inputClasses)) {
      const modelFields = model.schema?.fields ?? {};
      const names = Object.keys(modelFields);
      const single = names.length === 1;

      for (const name of names) {
        const field = modelFields[name];
        const group = field.toFormGroup({ localize: true, stacked: true }, { blank: "" });
        const control = group.querySelector("input, select, textarea");
        control?.addEventListener("input", () => this.#emit());
        control?.addEventListener("change", () => this.#emit());
        this.append(...group.children);
        this.#fields.push({ key, name, single, field, control });
      }
    }
    this.#emit();
  }

  #emit() {
    this.dispatchEvent(new CustomEvent("change", {
      bubbles: true,
      composed: true,
      detail: {
        value: this.value,
        inputs: this.inputs,
      },
    }));
  }
}

customElements.define("tests-interface", TestsInterfaceElement);
