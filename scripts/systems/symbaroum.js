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
        label: "Check",
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
        label: "Modifier",
        required: false,
        nullable: true,
      }),
    };
  }
}

const SYMBAROUM_ATTRIBUTES = {
  accurate: "ATTRIBUTE.ACCURATE",
  cunning: "ATTRIBUTE.CUNNING",
  discreet: "ATTRIBUTE.DISCREET",
  quick: "ATTRIBUTE.QUICK",
  persuasive: "ATTRIBUTE.PERSUASIVE",
  resolute: "ATTRIBUTE.RESOLUTE",
  strong: "ATTRIBUTE.STRONG",
  vigilant: "ATTRIBUTE.VIGILANT",
};

export const testsInterface = {
  buildInputs: () => {
    const choices = {};

    for (const [key, label] of Object.entries(SYMBAROUM_ATTRIBUTES)) {
      choices[key] = game.i18n.localize(label);
    }

    class CheckInput extends SymbaroumCheckInput {
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
      modifier: SymbaroumModifierInput,
    };
  },

  processCheck: async (actor, inputs, options = {}) => {
    const rollData = await game.symbaroum.api.rollAttribute(
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

    if (!rollData) {
      return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
    }

    return {
      canceled: false,
      result: rollData.diceResult,
      target: rollData.diceTarget,
      success: rollData.hasSucceed === true,
      levelOfSuccess: Math.clamp(50 + ((rollData.diceTarget ?? 0) - (rollData.diceResult ?? 0)), 0, 100),
      criticalSuccess: rollData.critSuccess === true,
      criticalFailure: rollData.critFail === true,
    };
  },
};
