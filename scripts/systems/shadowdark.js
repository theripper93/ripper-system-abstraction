const { DataModel, fields } = foundry.abstract;

export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "",
    level: "level.value",
    role: "",
  },

  health: {
    current: "attributes.hp.value",
    maximum: "attributes.hp.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "slots.slots_used",

    equipped: "equipped",
    attuned: "",

    uses: "uses.available",
    maximumUses: "uses.max",
  },

  currency: {
    base: "gp",

    actor: {
      denominations: {
        gp: "coins.gp",
        sp: "coins.sp",
        cp: "coins.cp",
      },
    },

    item: {
      single: {
        value: "",
        denomination: "",
      },

      denominations: {
        gp: "cost.gp",
        sp: "cost.sp",
        cp: "cost.cp",
      },
    },

    denominations: {
      cp: { value: 0.01 },
      sp: { value: 0.1 },
      gp: { value: 1 },
    },
  },

  experience: {
    current: "level.xp",
    maximum: "",
    level: "level.value",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: true,
    supportsWeight: true,
    supportsEquipment: true,
  },
};

class ShadowdarkCheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class ShadowdarkDCInput extends DataModel {
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

    for (const key of CONFIG.SHADOWDARK.ABILITY_KEYS) {
      choices[key] = game.i18n.localize(CONFIG.SHADOWDARK.ABILITIES_LONG[key]);
    }

    class CheckInput extends ShadowdarkCheckInput {
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
      dc: ShadowdarkDCInput,
    };
  },

  processCheck: async (actor, inputs) => {
    const config = { skipPrompt: true };
    if (inputs.dc != null) config.mainRoll = { dc: inputs.dc };

    return actor.system.rollStatCheck(inputs.check, config);
  },
};
