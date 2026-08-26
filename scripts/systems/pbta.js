const { DataModel, fields } = foundry.abstract;

export const dataPaths = {
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

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "weight",

    equipped: "",
    attuned: "",

    uses: "uses",
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
    current: "",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: false,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: false,
    supportsWeight: true,
    supportsEquipment: false,
  },
};

class PbtACheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

export const testsInterface = {
  buildInputs: (actor) => {
    const choices = {};

    for (const [key, stat] of Object.entries(actor.system.stats ?? {})) {
      choices[key] = stat.label ?? key;
    }

    class CheckInput extends PbtACheckInput {
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
    };
  },

  processCheck: async (actor, inputs) => {
    return actor._onRollStat(inputs.check, inputs.check, {});
  },
};
