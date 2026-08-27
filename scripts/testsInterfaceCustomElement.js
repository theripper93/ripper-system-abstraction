import { testsInterfaces, defaultTestsInterface } from "./systems/_index.js";

/**
 * Resolve the tests interface for a system, falling back to the shared
 * default (a generic roll-formula + dc input) when the system provides none.
 *
 * @param {string} [systemId] The Foundry system ID. Defaults to game.system.id.
 * @returns {Object} The system's tests interface.
 */
export function getTestsInterface(systemId = game.system.id) {
  return testsInterfaces[systemId] ?? defaultTestsInterface;
}

/**
 * Build the DataModel classes describing the inputs required to run a check
 * for the given actor's game system.
 *
 * @param {Actor} [actor]          The actor the check will be performed with.
 * @param {string} [systemId]      The Foundry system ID. Defaults to game.system.id.
 * @returns {Object<string, typeof foundry.abstract.DataModel>}
 */
export function buildInputs(actor, systemId = game.system.id) {
  return getTestsInterface(systemId).buildInputs(actor);
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
 * @param {Actor} [actor]           The actor the inputs will be used with.
 * @param {string} [systemId]       The Foundry system ID. Defaults to game.system.id.
 * @returns {Object<string, any>}   The parsed and typed inputs object.
 */
export function parse(value, actor, systemId = game.system.id) {
  const raw = {};
  if (value) {
    for (const pair of String(value).split("|")) {
      if (!pair) continue;
      const separator = pair.indexOf("=");
      if (separator < 0) continue;
      raw[pair.slice(0, separator).trim()] = pair.slice(separator + 1);
    }
  }

  const inputClasses = buildInputs(actor, systemId);
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
 * @param {string} [systemId]       The Foundry system ID. Defaults to game.system.id.
 * @returns {Promise<any>}          The native result of the system's check.
 */
export async function processCheck(actor, value, systemId = game.system.id) {
  const inputs = parse(value, actor, systemId);
  return getTestsInterface(systemId).processCheck(actor, inputs);
}

/**
 * A custom element which collects the inputs required to perform a check for
 * a specific actor, without executing the check itself.
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
  static observedAttributes = ["actor-id"];

  #actor = null;

  #fields = [];

  constructor() {
    super();
  }

  /** The actor-id attribute value. */
  get actorId() {
    return this.getAttribute("actor-id");
  }

  set actorId(value) {
    if (value) this.setAttribute("actor-id", value);
    else this.removeAttribute("actor-id");
  }

  /** The actor whose checks this element collects inputs for. */
  get actor() {
    return this.#actor;
  }

  set actor(value) {
    this.#actor = value;
    this.#render();
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
    this.#resolveActor();
  }

  /** @override */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "actor-id" && oldValue !== newValue) this.#resolveActor();
  }

  /* -------------------------------------------- */

  async #resolveActor() {
    const id = this.actorId;
    let actor = null;
    if (id) {
      try {
        actor = game.actors.get(id) ?? (id.includes(".") ? await fromUuid(id) : null);
      } catch (err) {
        actor = null;
      }
    }
    this.#actor = actor;
    this.#render();
  }

  #render() {
    this.replaceChildren();
    this.#fields = [];

    let inputClasses;
    try {
      inputClasses = buildInputs(this.#actor);
    } catch (err) {
      console.warn("ripper-system-abstraction | Failed to build check inputs:", err);
    }
    if (!inputClasses) {
      this.#emit();
      return;
    }

    const container = document.createElement("div");
    container.classList.add("tests-interface");

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
        container.append(group);
        this.#fields.push({ key, name, single, field, control });
      }
    }

    this.append(container);
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
