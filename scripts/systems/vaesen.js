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
    quantity: "",
    weight: "",

    equipped: "",
    attuned: "",

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
    current: "experience",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: false,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: false,
    supportsWeight: false,
    supportsEquipment: false,
  },
};

class VaesenCheckInput extends DataModel {
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

    for (const key of Object.keys(CONFIG.vaesen?.skills ?? {})) {
      choices[`skill.${key}`] = game.i18n.localize(
        CONFIG.vaesen.skills[key],
      );
    }

    for (const key of Object.keys(actor.system.attribute ?? {})) {
      choices[`attribute.${key}`] = game.i18n.localize(
        `ATTRIBUTE.${key.toUpperCase()}_ROLL`,
      );
    }

    class CheckInput extends VaesenCheckInput {
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
    const [type, key] = inputs.check.split(".");

    switch (type) {
      case "skill":
        return actor.sheet.rollSkill(key);

      case "attribute":
        return actor.sheet.rollAttribute(key);

      default:
        throw new Error(`Unsupported Vaesen check type: ${type}`);
    }
  },
};
