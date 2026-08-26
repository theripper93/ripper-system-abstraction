const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export const dataPaths = {
  actor: {
    type: "traits.creatureTypes",
    subtype: "traits.creatureSubtypes",
    size: "traits.size",
    level: "details.level.value",
    role: "",
  },

  health: {
    current: "attributes.hp.value",
    maximum: "attributes.hp.max",
    temporary: "attributes.hp.temp",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "weight.value",

    equipped: "equipped",
    attuned: "",

    uses: "uses.value",
    maximumUses: "uses.max",
  },

  currency: {
    base: "gp",

    actor: {
      denominations: {
        pp: "currency.pp",
        gp: "currency.gp",
        sp: "currency.sp",
        cp: "currency.cp",
      },
    },

    item: {
      single: {
        value: "price",
        denomination: "gp",
      },

      denominations: {},
    },

    denominations: {
      pp: { value: 10 },
      gp: { value: 1 },
      sp: { value: 0.1 },
      cp: { value: 0.01 },
    },
  },

  experience: {
    current: "details.xp.value",
    maximum: "details.xp.max",
    level: "details.level.value",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: true,
    supportsWounds: false,
    supportsCurrency: true,
    supportsWeight: true,
    supportsEquipment: true,
  },
};

class PF1CheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class PF1DCInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({
        label: "DC",
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

    for (const [key, value] of Object.entries(CONFIG.PF1.skills)) {
      choices[`skill.${key}`] = game.i18n.localize(value);
    }

    for (const [key, value] of Object.entries(CONFIG.PF1.abilities)) {
      choices[`ability.${key}`] = game.i18n.localize(value);
    }

    for (const [key, value] of Object.entries(CONFIG.PF1.savingThrows)) {
      choices[`save.${key}`] = game.i18n.localize(value);
    }

    class CheckInput extends PF1CheckInput {
      static defineSchema() {
        return {
          value: new fields.StringField({
            label: "Check",
            required: true,
            choices,
          }),
        };
      }
    }

    return {
      check: CheckInput,
      dc: PF1DCInput,
    };
  },

  processCheck: async (actor, inputs) => {
    const [type, key] = inputs.check.split(".");
    const options = inputs.dc != null ? { dc: inputs.dc } : {};

    switch (type) {
      case "skill":
        return actor.rollSkill(key, options);

      case "ability":
        return actor.rollAbilityTest(key, options);

      case "save":
        return actor.rollSavingThrow(key, options);

      default:
        throw new Error(`Unsupported PF1 check type: ${type}`);
    }
  },
};
