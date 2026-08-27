const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

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
        label: "Check",
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

    const attributes = game.i18n.translations?.DG?.Attributes ?? {};
    for (const key of Object.keys(attributes)) {
      if (!/^[a-z]{3}$/.test(key)) continue;
      choices[`stat.${key}`] = game.i18n.localize(`DG.Attributes.${key}`);
    }

    const skills = game.i18n.translations?.DG?.Skills ?? {};
    for (const key of Object.keys(skills)) {
      if (["flight", "ritual"].includes(key)) continue;
      choices[`skill.${key}`] = game.i18n.localize(`DG.Skills.${key}`);
    }

    class CheckInput extends DeltaGreenCheckInput {
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
      modifier: DeltaGreenModifierInput,
    };
  },

  processCheck: async (actor, inputs, options = {}) => {
    const DGPercentileRoll = CONFIG.Dice.rolls.find((roll) => roll.name === "DGPercentileRoll");
    if (!DGPercentileRoll) {
      return { canceled: false, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
    }

    const [type, key] = inputs.check.split(".");
    const roll = new DGPercentileRoll("1D100", {}, {
      rollType: type === "stat" ? "stat" : "skill",
      key,
      actor,
    });

    if (inputs.modifier != null) roll.modifier = inputs.modifier;

    await roll.evaluate();
    await roll.toChat();

    return {
      canceled: false,
      result: roll.total,
      target: roll.effectiveTarget ?? roll.target,
      success: roll.isSuccess === true,
      levelOfSuccess: Math.clamp(50 + ((roll.effectiveTarget ?? roll.target) - roll.total), 0, 100),
      criticalSuccess: roll.isCritical === true && roll.isSuccess === true,
      criticalFailure: roll.isCritical === true && roll.isSuccess !== true,
    };
  },
};
