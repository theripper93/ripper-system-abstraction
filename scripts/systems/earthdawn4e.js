const { DataModel, fields } = foundry.abstract;

export const dataPaths = {
  actor: {
    type: "actorType",
    subtype: "",
    size: "",
    level: "",
    role: "",
  },

  health: {
    current: "damage.value",
    maximum: "damage.max",
    temporary: "",
    minimum: "damage.min",

    useWounds: true,
    wounds: "wounds",
    maximumWounds: "",
  },

  item: {
    quantity: "amount",
    weight: "weight",

    equipped: "worn",
    attuned: "isthread",

    uses: "",
    maximumUses: "",
  },

  currency: {
    base: "silver",

    actor: {
      denominations: {
        gold: "money.gold",
        silver: "money.silver",
        copper: "money.copper",
      },
    },

    item: {
      single: {
        value: "",
        denomination: "",
      },

      denominations: {},
    },

    denominations: {
      gold: { value: 10 },
      silver: { value: 1 },
      copper: { value: 0.1 },
    },
  },

  experience: {
    current: "legendpointcurrent",
    maximum: "",
    level: "",
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

const EARTHDAWN_ATTRIBUTES = {
  dexterityStep: "earthdawn.d.dexterity",
  strengthStep: "earthdawn.s.strength",
  toughnessStep: "earthdawn.t.toughness",
  perceptionStep: "earthdawn.p.perception",
  willpowerStep: "earthdawn.w.willpower",
  charismaStep: "earthdawn.c.charisma",
};

class EarthdawnCheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class EarthdawnDifficultyInput extends DataModel {
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

class EarthdawnModifierInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({
        required: false,
        nullable: true,
        integer: true,
      }),
    };
  }
}

export const testsInterface = {
  buildInputs: () => {
    const choices = {};

    for (const [key, label] of Object.entries(EARTHDAWN_ATTRIBUTES)) {
      choices[key] = game.i18n.localize(label);
    }

    class CheckInput extends EarthdawnCheckInput {
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
      difficulty: EarthdawnDifficultyInput,
      modifier: EarthdawnModifierInput,
    };
  },

  processCheck: async (actor, inputs) => {
    return actor.rollPrep({
      attribute: inputs.check,
      name: game.i18n.localize(EARTHDAWN_ATTRIBUTES[inputs.check]),
      modifier: inputs.modifier ?? 0,
      difficulty: inputs.difficulty ?? 0,
    });
  },
};
