/*
 * System Data Path Configuration
 * ===============================
 *
 * This file defines how the agnostic API locates common data inside a
 * specific game system's Actor and Item data models.
 *
 * The goal is to allow modules to work across multiple game systems without
 * knowing the internal structure of each system.
 *
 * Each supported system provides its own implementation of this object.
 * The API uses these definitions to translate system-specific data into a
 * common, normalized representation.
 *
 * IMPORTANT
 * ---------
 *
 * - Paths are relative to the relevant Foundry document's `system` data.
 * - Use dot notation for nested properties.
 * - Use an empty string ("") when a value is not supported or unavailable.
 * - Use an empty object ({}) when a mapping contains multiple entries.
 * - Use arrays when a value may exist in multiple possible locations.
 * - Boolean properties are feature flags describing whether a system
 *   supports a particular concept.
 *
 * ---------------------------------------------------------------------------
 * ACTOR
 * ---------------------------------------------------------------------------
 *
 * Basic information about an Actor or creature.
 *
 * type:
 *   The creature/entity type.
 *
 * subtype:
 *   Optional secondary creature/entity classification.
 *
 * size:
 *   Creature/entity size.
 *
 * level:
 *   Character or creature level.
 *
 * role:
 *   Optional system-specific role or classification.
 *
 * ---------------------------------------------------------------------------
 * HEALTH
 * ---------------------------------------------------------------------------
 *
 * Normalized health information.
 *
 * current:
 *   Current health / hit points.
 *
 * maximum:
 *   Maximum health / hit points.
 *
 * temporary:
 *   Temporary or additional health.
 *
 * minimum:
 *   Minimum possible health value, if applicable.
 *
 * useWounds:
 *   Whether the system uses a wound/injury model.
 *
 * wounds:
 *   Current wounds/injuries.
 *
 * maximumWounds:
 *   Maximum wounds/injuries.
 *
 * invert (optional, default false):
 *   When true, the stored `current`/`maximum` values count damage taken
 *   rather than remaining health (e.g. damage trackers). The API interprets
 *   add/remove/heal/damage and getCurrent accordingly.
 *
 * ---------------------------------------------------------------------------
 * ITEM
 * ---------------------------------------------------------------------------
 *
 * Generic information about Items.
 *
 * quantity:
 *   Item quantity / stack size.
 *
 * weight:
 *   Item weight.
 *
 * equipped:
 *   Whether the item is equipped.
 *
 * attuned:
 *   Whether the item is attuned, bonded, or otherwise linked to the Actor.
 *
 * equippedValue / unequippedValue (optional):
 *   For systems whose equipped field is not a boolean, these declare the
 *   values representing the equipped and not-equipped states. A numeric
 *   `equippedValue` is an inclusive threshold (value >= equippedValue);
 *   a string is matched exactly.
 *
 * uses:
 *   Current remaining uses/charges.
 *
 * usesSpent (optional):
 *   A path to a stored "spent" counter when the system stores uses as
 *   consumed rather than remaining (e.g. `uses.spent` with a derived
 *   remaining value). The API then computes remaining as `maximumUses -
 *   usesSpent` and mutates the spent counter.
 *
 * maximumUses:
 *   Maximum uses/charges.
 *
 * ---------------------------------------------------------------------------
 * CURRENCY
 * ---------------------------------------------------------------------------
 *
 * Currency has two separate concepts:
 *
 * 1. Actor currency
 *    The actual money/denominations owned by an Actor.
 *
 * 2. Item currency
 *    The monetary value of an Item.
 *
 * Currency denominations are normalized using a relative `value`.
 *
 * `base` identifies the denomination used as the canonical unit.
 *
 * Example:
 *
 *   base: "gp"
 *
 *   cp = 0.01
 *   sp = 0.1
 *   gp = 1
 *   pp = 10
 *
 * This allows the API to normalize currencies across completely different
 * game systems.
 *
 * Actor currency is normally represented as multiple denomination paths:
 *
 *   actor: {
 *     denominations: {
 *       cp: "currency.cp",
 *       sp: "currency.sp",
 *       gp: "currency.gp",
 *       pp: "currency.pp",
 *     },
 *   }
 *
 * Systems that store actor currency in a non-path-based form (e.g. as items,
 * like PF2E's treasure items) may provide an optional `handler` instead. The
 * handler replaces path-based actor currency entirely: `get(actor)` returns a
 * normalized denomination object, `add(actor, amounts)` and
 * `remove(actor, amounts)` apply deltas (remove returning false when funds are
 * insufficient). `currency.set` is derived generically from get/add/remove.
 *
 *   actor: {
 *     denominations: { cp: "", sp: "", gp: "", pp: "" },
 *     handler: {
 *       get: (actor) => ({ cp: 0, sp: 0, gp: 0, pp: 0 }),
 *       add: async (actor, amounts) => {},
 *       remove: async (actor, amounts) => true,
 *     },
 *   }
 *
 * Item currency supports two representations:
 *
 * 1. Single denomination
 *
 *    Example:
 *      value = 5
 *      denomination = "gp"
 *
 * 2. Multiple denominations
 *
 *    Example:
 *      5 gp + 2 cp
 *
 * This allows the API to handle systems that store item prices differently
 * without requiring system-specific currency logic.
 *
 * ---------------------------------------------------------------------------
 * EXPERIENCE
 * ---------------------------------------------------------------------------
 *
 * Character/creature progression data.
 *
 * current:
 *   Current experience/progression value.
 *
 * maximum:
 *   Experience required for the next level, if applicable.
 *
 * level:
 *   Current level.
 *
 * ---------------------------------------------------------------------------
 * FEATURES
 * ---------------------------------------------------------------------------
 *
 * Feature flags indicate whether the system supports a given concept.
 *
 * supportsHealth:
 *   The system exposes health information.
 *
 * supportsTemporaryHealth:
 *   The system supports temporary/additional health.
 *
 * supportsWounds:
 *   The system uses wounds/injuries.
 *
 * supportsCurrency:
 *   The system exposes currency.
 *
 * supportsWeight:
 *   Items have weight.
 *
 * supportsEquipment:
 *   Items can be equipped.
 */

export default async function systemAdapter() {
  /*
   * Optional asynchronous preloads (e.g. awaiting compendium `getIndex()` to
   * resolve names for tool/skill choices) may run here, before the adapter's
   * dataPaths and testsInterface are returned.
   */

  return {
    dataPaths: {
  // -------------------------------------------------------------------------
  // Actor
  // -------------------------------------------------------------------------

  actor: {
    type: "",
    subtype: "",
    size: "",
    level: "",
    role: "",
  },

  // -------------------------------------------------------------------------
  // Health
  // -------------------------------------------------------------------------

  health: {
    current: "",
    maximum: "",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  // -------------------------------------------------------------------------
  // Item
  // -------------------------------------------------------------------------

  item: {
    quantity: "",
    weight: "",

    equipped: "",
    attuned: "",

    uses: "",
    maximumUses: "",
  },

  // -------------------------------------------------------------------------
  // Currency
  // -------------------------------------------------------------------------

  currency: {
    // Canonical denomination used as the base unit for normalization.
    base: "",

    // Currency owned by an Actor.
    actor: {
      denominations: {},
    },

    // Monetary value represented by an Item.
    item: {
      // Single value + denomination.
      //
      // Example:
      //   value: 5
      //   denomination: "gp"
      single: {
        value: "",
        denomination: "",
      },

      // Multiple denomination values.
      //
      // Example:
      //   5 gp + 2 cp
      //
      // Each key is a denomination and the value is the path containing
      // the amount for that denomination.
      denominations: {},
    },

    // Relative value of each denomination compared to `base`.
    //
    // Example:
    //   cp: { value: 0.01 }
    //   sp: { value: 0.1 }
    //   gp: { value: 1 }
    //   pp: { value: 10 }
    denominations: {},
  },

  // -------------------------------------------------------------------------
  // Experience / Progression
  // -------------------------------------------------------------------------

  experience: {
    current: "",
    maximum: "",
    level: "",
  },

  // -------------------------------------------------------------------------
  // Feature Support
  // -------------------------------------------------------------------------

  features: {
    supportsHealth: false,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: false,
    supportsWeight: false,
    supportsEquipment: false,
  },
    },

// ---------------------------------------------------------------------------
// Tests / Checks
// ---------------------------------------------------------------------------
//
// Defines the interface used by the agnostic API to perform system-specific
// checks.
//
// `buildInputs` returns an object where each key represents a logical input
// and each value is a Foundry DataModel class describing that input.
//
// The choices for each input are pulled from the game system's configuration
// only - never from a specific actor. Checks that an actor cannot perform are
// still listed.
//
// The generic API can use these DataModels to construct, render, and validate
// the required UI without knowing anything about the underlying game system.
//
// Example:
//
//   buildInputs() => ({
//     check: CheckInput,
//     dc: DCInput,
//   })
//
// Once the user has provided the values, the generic API passes a simple
// key/value object to `processCheck`:
//
//   {
//     check: "skill.acrobatics",
//     dc: 15,
//   }
//
// The meaning of each input is entirely system-specific.
//
// `processCheck` is responsible for translating the provided values into the
// system's native check/roll API, executing the check, and normalizing the
// result.
//
// Options:
//
//   {
//     fastForward: false,  Whether to skip the system's roll dialog if possible
//     silent: false,       Whether to suppress chat output for the check
//     event: null,         An optional originating event passed to the native check
//   }
//
// The options object is forwarded to the system's check method when that
// method accepts an options argument.
//
// The returned value is a standardized result object:
//
//   {
//     canceled: false,          Whether the check was canceled (dialog dismissed)
//     result: 17,               The primary numeric outcome (roll total) if any
//     target: 15,               The target/DC/threshold the result was compared against
//     success: true,            Whether the check succeeded, or null if the system
//                               cannot determine success
//     levelOfSuccess: 67,       A 0-100 percentage. Each system normalizes its own
//                               success levels (e.g. binary -> 0/100, 4 levels ->
//                               0/33/66/100). Null if the system has no such concept.
//     criticalSuccess: false,   Whether the outcome was a critical success
//     criticalFailure: false,   Whether the outcome was a critical failure
//   }
//

    testsInterface: {
  /**
   * Returns the DataModel classes required to build a system check.
   *
   * Choices are derived from system configuration, never from a specific
   * actor.
   *
   * @returns {Object<string, typeof foundry.abstract.DataModel>}
   */
  buildInputs: () => ({}),

  /**
   * Executes a system-specific check using the submitted input values.
   *
   * `inputs` contains the values defined by `buildInputs`, keyed by the same
   * names returned by that function.
   *
   * @param {Actor} actor
   * @param {Object<string, any>} inputs
   * @param {Object} [options]        Options for the check.
   * @param {boolean} [options.fastForward]  Whether to skip the roll dialog if possible.
   * @param {boolean} [options.silent]       Whether to suppress chat output for the check.
   * @param {Event} [options.event]    An optional originating event.
   * @returns {Promise<{
   *   canceled: boolean,
   *   result: number|null,
   *   target: number|null,
   *   success: boolean|null,
   *   levelOfSuccess: number|null,
   *   criticalSuccess: boolean,
   *   criticalFailure: boolean,
   * }>}
   */
  processCheck: async (actor, inputs, options = {}) => {
    throw new Error("processCheck is not implemented");
  },
},
  };
};