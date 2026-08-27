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
    current: "",
    maximum: "",
    temporary: "",
    minimum: "",

    useWounds: true,
    wounds: "silhouette",
    maximumWounds: "",
  },

  item: {
    quantity: "",
    weight: "",

    equipped: "",
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
    current: "xp",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: false,
    supportsTemporaryHealth: false,
    supportsWounds: true,
    supportsCurrency: false,
    supportsWeight: false,
    supportsEquipment: false,
  },
};

const WILD_TALENTS_STATS = {
  body: "WT.Stat.Body",
  coordination: "WT.Stat.Coordination",
  sense: "WT.Stat.Sense",
  mind: "WT.Stat.Mind",
  charm: "WT.Stat.Charm",
  command: "WT.Stat.Command",
};

class WildTalentsCheckInput extends DataModel {
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

class WildTalentsDifficultyInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({
        label: "Difficulty",
        required: false,
        nullable: true,
        integer: true,
        min: 1,
        max: 10,
      }),
    };
  }
}

export const testsInterface = {
  buildInputs: () => {
    const choices = {};

    for (const [key, label] of Object.entries(WILD_TALENTS_STATS)) {
      choices[key] = game.i18n.localize(label);
    }

    class CheckInput extends WildTalentsCheckInput {
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
      difficulty: WildTalentsDifficultyInput,
    };
  },

  processCheck: async (actor, inputs, options = {}) => {
    const dice = actor.system.stats?.[inputs.check];
    if (!dice) throw new Error(`Unknown Wild Talents stat: ${inputs.check}`);

    const message = await game.wildtalents.quickRoll(dice, {
      flavor: game.i18n.localize(WILD_TALENTS_STATS[inputs.check]),
      minHeight: inputs.difficulty ?? 1,
      speaker: { actor: actor.id },
    });

    let success = null;
    try {
      const module = await import("/systems/wildtalents/rolls/ORERoll.mjs");
      const ORERoll = module.ORERoll ?? module.default?.ORERoll ?? module.default;
      if (ORERoll?.fromRollFlavor) {
        const roll = ORERoll.fromRollFlavor(message.rolls[0]);
        success = roll?.isSuccess === true;
      }
    } catch (err) {
      success = null;
    }

    return {
      canceled: false,
      result: null,
      target: inputs.difficulty ?? 1,
      success,
      levelOfSuccess: success == null ? null : success ? 100 : 0,
      criticalSuccess: false,
      criticalFailure: false,
    };
  },
};
