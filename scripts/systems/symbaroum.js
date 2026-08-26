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
    current: "health.toughness.value",
    maximum: "health.toughness.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "number",
    weight: "",

    equipped: "state",
    attuned: "",

    uses: "",
    maximumUses: "",
  },

  currency: {
    base: "thaler",

    actor: {
      denominations: {
        thaler: "money.thaler",
        shilling: "money.shilling",
        orteg: "money.orteg",
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
      thaler: { value: 1 },
      shilling: { value: 0.1 },
      orteg: { value: 0.01 },
    },
  },

  experience: {
    current: "experience.total",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: true,
    supportsWeight: false,
    supportsEquipment: true,
  },
};

class SymbaroumCheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class SymbaroumModifierInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({
        required: false,
        nullable: true,
      }),
    };
  }
}

export const testsInterface = {
  buildInputs: (actor) => {
    const choices = {};

    for (const [key, attribute] of Object.entries(
      actor.system.attributes ?? {},
    )) {
      choices[key] = game.i18n.localize(attribute.label ?? key);
    }

    class CheckInput extends SymbaroumCheckInput {
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
      modifier: SymbaroumModifierInput,
    };
  },

  processCheck: async (actor, inputs) => {
    return game.symbaroum.api.rollAttribute(
      actor,
      inputs.check,
      null,
      null,
      0,
      inputs.modifier ?? 0,
      null,
      null,
      false,
      "",
    );
  },
};
