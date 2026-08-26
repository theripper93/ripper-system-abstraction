const { DataModel, fields } = foundry.abstract;

export const dataPaths = {
  actor: {
    type: "",
    subtype: "isPC",
    size: "characteristics.size",
    level: "level",
    role: "",
  },

  health: {
    current: "characteristics.health.value",
    maximum: "characteristics.health.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "",

    equipped: "wear",
    attuned: "",

    uses: "activatedEffect.uses.value",
    maximumUses: "activatedEffect.uses.max",
  },

  currency: {
    base: "gc",

    actor: {
      denominations: {
        gc: "wealth.gc",
        ss: "wealth.ss",
        cp: "wealth.cp",
        bits: "wealth.bits",
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
      gc: { value: 1 },
      ss: { value: 0.1 },
      cp: { value: 0.01 },
      bits: { value: 0.001 },
    },
  },

  experience: {
    current: "",
    maximum: "",
    level: "level",
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

class DemonlordCheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class DemonlordModifierInput extends DataModel {
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
  buildInputs: (actor) => {
    const choices = {};

    for (const [key, attribute] of Object.entries(
      actor.system.attributes ?? {},
    )) {
      choices[key] = game.i18n.localize(attribute.label ?? key);
    }

    class CheckInput extends DemonlordCheckInput {
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
      modifier: DemonlordModifierInput,
    };
  },

  processCheck: async (actor, inputs) => {
    const attribute = actor.getAttribute(inputs.check);
    if (!attribute) throw new Error(`Unknown Demon Lord attribute: ${inputs.check}`);

    return actor.rollAttributeChallenge(
      attribute,
      undefined,
      inputs.modifier ?? 0,
    );
  },
};
