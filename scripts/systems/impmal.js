const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "combat.size",
    level: "",
    role: ["role.name", "role"],
  },

  health: {
    current: "combat.wounds.value",
    maximum: "combat.wounds.max",
    temporary: "",
    minimum: "",

    useWounds: true,
    wounds: "combat.criticals.value",
    maximumWounds: "combat.criticals.max",
  },

  item: {
    quantity: "quantity",
    weight: "encumbrance.value",

    equipped: "equipped.value",
    attuned: "",

    uses: "uses.value",
    maximumUses: "uses.max",
  },

  currency: {
    base: "solars",

    actor: {
      denominations: {
        solars: "solars",
      },
    },

    item: {
      single: {
        value: "cost",
        denomination: "solars",
      },

      denominations: {},
    },

    denominations: {
      solars: { value: 1 },
    },
  },

  experience: {
    current: "xp.total",
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

class ImpMalCheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class ImpMalModifierInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({
        label: "Modifier",
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

    for (const [key, label] of Object.entries(
      game.impmal.config.characteristics,
    )) {
      choices[`char.${key}`] = game.i18n.localize(label);
    }

    for (const [key, label] of Object.entries(game.impmal.config.skills)) {
      choices[`skill.${key}`] = game.i18n.localize(label);
    }

    class CheckInput extends ImpMalCheckInput {
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
      modifier: ImpMalModifierInput,
    };
  },

  processCheck: async (actor, inputs) => {
    const [type, key] = inputs.check.split(".");
    const fields = { difficulty: "challenging" };
    if (inputs.modifier != null) fields.modifier = inputs.modifier;

    const context = { skipDialog: true, skipTargets: true, fields };

    switch (type) {
      case "char":
        return actor.setupCharacteristicTest(key, context);

      case "skill":
        return actor.setupSkillTest({ key }, context);

      default:
        throw new Error(`Unsupported Imperium Maledictum check type: ${type}`);
    }
  },
};
