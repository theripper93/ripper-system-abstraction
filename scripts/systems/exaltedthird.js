const { DataModel, fields } = foundry.abstract;

export const dataPaths = {
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
};

class ExaltedThirdCheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
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
        required: false,
        nullable: true,
        integer: true,
        min: 0,
      }),
    };
  }
}

export const testsInterface = {
  buildInputs: () => {
    const choices = {};

    for (const [key, label] of Object.entries(
      CONFIG.exaltedthird.selects.abilities.entries,
    )) {
      choices[key] = game.i18n.localize(label);
    }

    class CheckInput extends ExaltedThirdCheckInput {
      static defineSchema() {
        return {
          value: new fields.StringField({
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

  processCheck: async (actor, inputs) => {
    const data = {
      rollType: "ability",
      ability: inputs.check,
      attribute: actor.system.abilities[inputs.check]?.prefattribute,
      difficulty: inputs.difficulty ?? 0,
    };

    return game.exaltedthird.roll(actor, {}, data);
  },
};
