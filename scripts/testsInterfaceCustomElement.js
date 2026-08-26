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
 * Normalize a StringField's choices into an array of {key, label} entries.
 *
 * @param {foundry.data.fields.StringField} field
 * @returns {Array<{key: string, label: string}>|null}
 */
export function normalizeChoices(field) {
  let choices = field.options?.choices ?? field.choices;
  if (typeof choices === "function") choices = choices();
  if (Array.isArray(choices)) {
    return choices.map((value) => ({ key: value, label: value }));
  }
  if (choices && typeof choices === "object") {
    return Object.entries(choices).map(([key, label]) => ({ key, label }));
  }
  return null;
}

/**
 * Coerce a raw string value into the type represented by a DataField.
 *
 * @param {foundry.data.fields.DataField} field
 * @param {string} [value]
 * @returns {*}
 */
export function coerceValue(field, value) {
  if (field instanceof foundry.data.fields.NumberField) {
    if (value == null || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }
  if (field instanceof foundry.data.fields.BooleanField) {
    if (value === "true") return true;
    if (value === "false") return false;
    return null;
  }
  return value ?? "";
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
      const rawValue = raw[entry.path];
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
        const path = single ? key : `${key}.${name}`;
        const control = this.#renderField(field);

        const row = document.createElement("label");
        row.classList.add("tests-interface-input");

        const label = document.createElement("span");
        label.classList.add("tests-interface-label");
        label.textContent = game.i18n.localize(field.options?.label ?? name);

        row.append(label, control);
        container.append(row);

        this.#fields.push({ key, name, path, single, field, control });
      }
    }

    this.append(container);
    this.#emit();
  }

  #renderField(field) {
    if (field instanceof foundry.data.fields.StringField) {
      const choices = normalizeChoices(field);
      const initial = field.options?.initial ?? "";

      if (choices) {
        const select = document.createElement("select");
        select.classList.add("tests-interface-control");

        const blank = document.createElement("option");
        blank.value = "";
        select.append(blank);

        for (const choice of choices) {
          const option = document.createElement("option");
          option.value = choice.key;
          option.textContent = game.i18n.localize(choice.label ?? choice.key);
          select.append(option);
        }

        select.value = initial;
        select.addEventListener("change", () => this.#emit());
        return select;
      }

      const input = document.createElement("input");
      input.classList.add("tests-interface-control");
      input.type = "text";
      input.value = initial;
      if (field.options?.placeholder) input.placeholder = game.i18n.localize(field.options.placeholder);
      input.addEventListener("input", () => this.#emit());
      return input;
    }

    if (field instanceof foundry.data.fields.NumberField) {
      const input = document.createElement("input");
      input.classList.add("tests-interface-control");
      input.type = "number";
      if (field.options?.integer) input.step = "1";
      if (field.options?.min != null) input.min = field.options.min;
      if (field.options?.max != null) input.max = field.options.max;
      if (field.options?.initial != null) input.value = field.options.initial;
      input.addEventListener("input", () => this.#emit());
      return input;
    }

    const input = document.createElement("input");
    input.classList.add("tests-interface-control");
    input.type = "text";
    input.addEventListener("input", () => this.#emit());
    return input;
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
