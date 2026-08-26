const { DataModel, fields } = foundry.abstract;

export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "movement.size",
    level: "advancement.level",
    role: "",
  },

  health: {
    current: "resources.health.value",
    maximum: "resources.health.max",
    temporary: "",
    minimum: "",

    useWounds: true,
    wounds: "resources.wounds.value",
    maximumWounds: "resources.wounds.max",
  },

  item: {
    quantity: "quantity",
    weight: "weight",

    equipped: "equipped",
    attuned: "invested",

    uses: "uses.value",
    maximumUses: "uses.max",
  },

  currency: {
    base: "cp",

    actor: {
      denominations: {},
    },

    item: {
      single: {
        value: "price",
        denomination: "cp",
      },

      denominations: {},
    },

    denominations: {
      cp: { value: 1 },
      sp: { value: 10 },
      gp: { value: 100 },
      pp: { value: 1000 },
    },
  },

  experience: {
    current: "",
    maximum: "",
    level: "advancement.level",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: true,
    supportsCurrency: true,
    supportsWeight: true,
    supportsEquipment: true,
  },
};

class CrucibleCheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class CrucibleDCInput extends DataModel {
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

    for (const skill of globalThis.SYSTEM?.SKILLS ?? []) {
      choices[skill.id] = game.i18n.localize(skill.label);
    }

    class CheckInput extends CrucibleCheckInput {
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
      dc: CrucibleDCInput,
    };
  },

  processCheck: async (actor, inputs) => {
    return actor.rollSkill(inputs.check, {
      dc: inputs.dc,
      chatMessage: true,
    });
  },
};
