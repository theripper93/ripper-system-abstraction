const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export const dataPaths = {
  actor: {
    type: "",
    subtype: "details.type",
    size: "details.size",
    level: "details.level",
    role: "",
  },

  health: {
    current: "attributes.hp.value",
    maximum: "attributes.hp.max",
    temporary: "attributes.temphp.value",
    minimum: "attributes.hp.min",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "weight",

    equipped: "equipped",
    attuned: "attuned",

    uses: "uses.value",
    maximumUses: "uses.max",
  },

  currency: {
    base: "gp",

    actor: {
      denominations: {
        ad: "currency.ad",
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
      ad: { value: 10000 },
      pp: { value: 100 },
      gp: { value: 1 },
      sp: { value: 0.1 },
      cp: { value: 0.01 },
    },
  },

  experience: {
    current: "details.exp",
    maximum: "",
    level: "details.level",
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

class DND4ECheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class DND4EDCInput extends DataModel {
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

    for (const [key, value] of Object.entries(CONFIG.DND4E.abilities)) {
      choices[`ability.${key}`] = value;
    }

    for (const [key, value] of Object.entries(CONFIG.DND4E.skills)) {
      choices[`skill.${key}`] = value.label;
    }

    class CheckInput extends DND4ECheckInput {
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
      dc: DND4EDCInput,
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

      default:
        throw new Error(`Unsupported D&D 4e check type: ${type}`);
    }
  },
};
