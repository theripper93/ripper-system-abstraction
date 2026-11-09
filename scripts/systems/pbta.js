const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export default async function pbta() {

  class PbtACheckInput extends DataModel {
    static defineSchema() {
      return {
        value: new fields.StringField({
          label: "ripper-system-abstraction.tests.Check",
          required: true,
          choices,
        }),
      };
    }
  }

  const PBTa_OUTCOME_LEVELS = { failure: 0, partial: 50, success: 100, critical: 100 };

  const harm = (actor) => (Number.isFinite(actor.system.attributes?.harm?.max) ? actor.system.attributes.harm : null);
  const xpKey = (actor) => Object.entries(actor.system.attributes ?? {}).find(([, attribute]) => attribute?.type === "Xp")?.[0];

  return {
    dataPaths: {
    actor: {
      type: "",
      subtype: "",
      size: "",
      level: "",
      role: "",
    },

    health: {
      current: "",
      maximum: "",
      temporary: "",
      minimum: "",

      wounds: {
        get: (actor) => harm(actor)?.value ?? null,
        set: (actor, value) => ({ "system.attributes.harm.value": value }),
      },
      maximumWounds: (actor) => harm(actor)?.max ?? null,
      primary: "wounds",
    },

    item: {
      quantity: "quantity",
      weight: "weight",

      equipped: "",
      attuned: "",

      uses: "uses",
      maximumUses: "",

      values: {
        weight: {
          label: "ripper-system-abstraction.item.values.weight",
          type: "number",
          applies: (item) => item.type === "equipment",
          path: "weight",
        },
      },
    },

    currency: {
      base: "",

      actor: {
        denominations: {},
      },

      item: {
        single: {
          value: "",
          denomination: "",
        },

        denominations: {},
      },

      denominations: {},
    },

    experience: {
      current: {
        get: (actor) => (xpKey(actor) ? actor.system.attributes[xpKey(actor)].value : null),
        set: (actor, value) => ({ [`system.attributes.${xpKey(actor)}.value`]: value }),
      },
      maximum: (actor) => (xpKey(actor) ? actor.system.attributes[xpKey(actor)].max ?? null : null),
      level: "",
    },

    features: {
      supportsHealth: false,
      supportsTemporaryHealth: false,
      supportsWounds: true,
      supportsCurrency: false,
      supportsWeight: true,
      supportsEquipment: false,
    },
    },
    testsInterface: {
    resultType: "outcome",
    supportsAdvantage: true,
    // Fallback: PbtA has no initiative roll, its combatant initiative counts moves.
    rollInitiative: async (actor, combatant) => {
      if (!Number.isFinite(combatant.initiative)) await combatant.update({ initiative: 0 });
    },
    buildInputs: () => {
      const choices = {};

      const stats = game.pbta?.sheetConfig?.actorTypes?.character?.stats ?? {};
      for (const [key, stat] of Object.entries(stats)) {
        choices[key] = stat.label ?? key;
      }

      class CheckInput extends PbtACheckInput {
        static defineSchema() {
          return {
            value: new fields.StringField({
              label: "ripper-system-abstraction.tests.Check",
              required: true,
              choices,
            }),
          };
        }
      }

      return {
        check: CheckInput,
      };
    },

    processCheck: async (actor, inputs, options = {}) => {
      if (!Object.keys(actor.system.stats ?? {}).length) throw new Error(`PbtA actors of type "${actor.type}" cannot perform checks.`);
      if (!(inputs.check in actor.system.stats)) throw new Error(`This PbtA actor cannot perform "${inputs.check}" checks.`);

      const roll = new CONFIG.Dice.RollPbtA(
        actor._getStatFormula(inputs.check),
        actor.getRollData(),
        { rollType: "stat", stat: inputs.check, conditions: [], conditionsConsumed: [], rollMode: options.advantage === options.disadvantage ? "def" : options.advantage ? "adv" : "dis" },
      );
      if (roll.options.rollMode !== "def") roll.configureModifiers();
      await roll.evaluate();
      if (!options.silent) await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }) });

      const rollResults = game.pbta?.sheetConfig?.rollResults ?? {};
      let outcome = null;
      for (const [key, range] of Object.entries(rollResults)) {
        if ((!range.start || roll.total >= range.start) && (!range.end || roll.total <= range.end)) {
          outcome = key;
          break;
        }
      }

      const success = outcome === "success" || outcome === "critical";

      return {
        canceled: false,
        result: roll.total,
        target: null,
        success,
        levelOfSuccess: outcome != null ? (PBTa_OUTCOME_LEVELS[outcome] ?? null) : null,
        criticalSuccess: outcome === "critical",
        criticalFailure: false,
      };
    },
    },
  };
};
