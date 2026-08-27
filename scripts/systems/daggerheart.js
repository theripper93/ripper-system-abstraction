const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export const dataPaths = {
  actor: {
    type: "",
    subtype: "type",
    size: "size",
    level: "levelData.level.current",
    role: "",
  },

  health: {
    current: "resources.hitPoints.value",
    maximum: "resources.hitPoints.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "",

    equipped: "equipped",
    attuned: "",

    uses: "resource.value",
    maximumUses: "resource.max",
  },

  currency: {
    base: "coins",

    actor: {
      denominations: {
        coins: "gold.coins",
        handfuls: "gold.handfuls",
        bags: "gold.bags",
        chests: "gold.chests",
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
      coins: { value: 1 },
      handfuls: { value: 10 },
      bags: { value: 100 },
      chests: { value: 1000 },
    },
  },

  experience: {
    current: "",
    maximum: "",
    level: "levelData.level.current",
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

class DaggerheartCheckInput extends DataModel {
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

class DaggerheartDifficultyInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({
        label: "Difficulty",
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

    for (const [key, value] of Object.entries(CONFIG.DH.ACTOR.abilities)) {
      choices[key] = game.i18n.localize(value.label);
    }

    class CheckInput extends DaggerheartCheckInput {
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
      difficulty: DaggerheartDifficultyInput,
    };
  },

  processCheck: async (actor, inputs, options = {}) => {
    const rollOptions = { event: options.event };
    if (options.fastForward) rollOptions.dialog = { configure: false };
    if (inputs.difficulty != null) {
      rollOptions.roll = {
        trait: inputs.check,
        type: "trait",
        difficulty: inputs.difficulty,
      };
    }

    const result = await actor.rollTrait(inputs.check, rollOptions);
    if (!result) {
      return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
    }

    const roll = result.roll;
    const difficulty = inputs.difficulty ?? null;
    const criticalSuccess = roll?.isCritical === true;
    const success = criticalSuccess ? true : difficulty != null ? (roll?.total ?? 0) >= difficulty : null;

    return {
      canceled: false,
      result: roll?.total ?? null,
      target: difficulty,
      success,
      levelOfSuccess: success == null ? null : success ? 100 : 0,
      criticalSuccess,
      criticalFailure: false,
    };
  },
};
