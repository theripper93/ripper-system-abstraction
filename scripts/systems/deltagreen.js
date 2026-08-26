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
    current: "health.value",
    maximum: "health.max",
    temporary: "",
    minimum: "health.min",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "",
    weight: "",

    equipped: "equipped",
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
    current: "",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: false,
    supportsWeight: false,
    supportsEquipment: true,
  },
};

class DeltaGreenCheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class DeltaGreenModifierInput extends DataModel {
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

    for (const [key] of Object.entries(actor.system.statistics ?? {})) {
      choices[`stat.${key}`] = game.i18n.localize(
        `DG.Attributes.${key.toUpperCase()}`,
      );
    }

    for (const [key] of Object.entries(actor.system.skills ?? {})) {
      choices[`skill.${key}`] = game.i18n.localize(`DG.Skills.${key}`);
    }

    for (const [key, typed] of Object.entries(
      actor.system.typedSkills ?? {},
    )) {
      choices[`skill.${key}`] = typed.label ?? key;
    }

    class CheckInput extends DeltaGreenCheckInput {
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
      modifier: DeltaGreenModifierInput,
    };
  },

  processCheck: async (actor, inputs) => {
    const DGPercentileRoll = CONFIG.Dice.rolls.find(
      (roll) => roll.name === "DGPercentileRoll",
    );
    if (!DGPercentileRoll) return null;

    const [type, key] = inputs.check.split(".");
    const roll = new DGPercentileRoll("1D100", {}, {
      rollType: type === "stat" ? "stat" : "skill",
      key,
      actor,
    });

    if (inputs.modifier != null) roll.modifier = inputs.modifier;

    await roll.evaluate();
    await roll.toChat();
    return roll;
  },
};
