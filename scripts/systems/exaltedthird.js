const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export default async function exaltedthird() {

  class ExaltedThirdCheckInput extends DataModel {
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

  class ExaltedThirdDifficultyInput extends DataModel {
    static defineSchema() {
      return {
        value: new fields.NumberField({
          label: "ripper-system-abstraction.tests.Difficulty",
          required: false,
          nullable: true,
          integer: true,
          min: 0,
        }),
      };
    }
  }

  return {
    dataPaths: {
    actor: {
      type: "details.exalt",
      subtype: "details.caste",
      size: "",
      level: "essence.value",
      role: "",
    },

    health: {
      current: "health.value",
      maximum: "health.max",
      temporary: "health.levels.temp.value",
      minimum: "health.min",

      useWounds: true,
      wounds: ["health.bashing", "health.lethal", "health.aggravated"],
      maximumWounds: "",
    },

    item: {
      quantity: "quantity",
      weight: "",

      equipped: "equipped",
      attuned: "attunement",

      uses: "",
      maximumUses: "",
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
      current: "experience.standard.remaining",
      maximum: "",
      level: "essence.value",
    },

    features: {
      supportsHealth: true,
      supportsTemporaryHealth: true,
      supportsWounds: true,
      supportsCurrency: false,
      supportsWeight: false,
      supportsEquipment: true,
    },
    },
    testsInterface: {
    buildInputs: () => {
      const choices = {};

      for (const [key, label] of Object.entries(CONFIG.exaltedthird.selects.abilities)) {
        if (!key) continue;
        choices[key] = game.i18n.localize(label);
      }

      class CheckInput extends ExaltedThirdCheckInput {
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
        difficulty: ExaltedThirdDifficultyInput,
      };
    },

    processCheck: async (actor, inputs, options = {}) => {
      const RollForm = game.exaltedthird?.RollForm;
      if (!RollForm) {
        return { canceled: false, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
      }

      const form = new RollForm(actor, {}, {}, {
        rollType: "ability",
        ability: inputs.check,
        attribute: actor.system.abilities[inputs.check]?.prefattribute,
        difficulty: inputs.difficulty ?? 0,
        skipDialog: true,
      });
      await form.roll();

      const object = form.object;
      const total = object.diceRollTotal;
      const difficulty = object.difficulty ?? 0;
      const botch = total === 0 && (object.roll?.dice?.[0]?.results ?? []).some((die) => die.result === 1);
      const success = difficulty > 0 ? total >= difficulty : null;

      return {
        canceled: false,
        result: total,
        target: difficulty > 0 ? difficulty : null,
        success,
        levelOfSuccess: difficulty > 0 ? Math.clamp(50 + (object.thresholdSuccesses ?? 0) * 10, 0, 100) : null,
        criticalSuccess: false,
        criticalFailure: botch,
      };
    },
    },
  };
};
