const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export const dataPaths = {
  actor: {
    type: "details.type",
    subtype: "details.subtype",
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
    weight: "bulk",

    equipped: "equipped",
    attuned: "",

    uses: "uses.value",
    maximumUses: "uses.max",
  },

  currency: {
    base: "credit",

    actor: {
      denominations: {
        credit: "currency.credit",
        upb: "currency.upb",
      },
    },

    item: {
      single: {
        value: "price",
        denomination: "credit",
      },

      denominations: {},
    },

    denominations: {
      credit: { value: 1 },
      upb: { value: 1 },
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

class SFRPGCeckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class SFRPGDCInput extends DataModel {
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

    for (const [key, value] of Object.entries(CONFIG.SFRPG.skills)) {
      choices[`skill.${key}`] = game.i18n.localize(value);
    }

    for (const [key, value] of Object.entries(CONFIG.SFRPG.abilities)) {
      choices[`ability.${key}`] = game.i18n.localize(value);
    }

    for (const [key, value] of Object.entries(CONFIG.SFRPG.saves)) {
      choices[`save.${key}`] = game.i18n.localize(value);
    }

    class CheckInput extends SFRPGCeckInput {
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
      dc: SFRPGDCInput,
    };
  },

  processCheck: async (actor, inputs) => {
    const [type, key] = inputs.check.split(".");
    const options = inputs.dc != null ? { dc: inputs.dc } : {};

    switch (type) {
      case "skill":
        return actor.rollSkill(key, options);

      case "ability":
        return actor.rollAbility(key, options);

      case "save":
        return actor.rollSave(key, options);

      default:
        throw new Error(`Unsupported SFRPG check type: ${type}`);
    }
  },
};
