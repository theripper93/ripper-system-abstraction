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
    current: "monitors.physical.value",
    maximum: "monitors.physical.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
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
    current: "counters.karma.value",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: false,
    supportsWeight: false,
    supportsEquipment: false,
  },
};

class AnarchyCheckInput extends DataModel {
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

const ANARCHY_ATTRIBUTES = ["strength", "agility", "willpower", "logic", "charisma", "edge"];

export const testsInterface = {
  buildInputs: () => {
    const choices = {};

    for (const key of ANARCHY_ATTRIBUTES) {
      choices[`attribute.${key}`] = game.i18n.localize(key);
    }

    const skills = game.system.anarchy?.skills?.getSkills?.({ withKnowledge: true }) ?? [];
    for (const skill of skills) {
      choices[`skill.${skill.code}`] = game.i18n.localize(skill.labelkey ?? skill.code);
    }

    class CheckInput extends AnarchyCheckInput {
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
    };
  },

  processCheck: async (actor, inputs, options = {}) => {
    const anarchy = game.system.anarchy;
    if (!anarchy?.rollManager) {
      return { canceled: false, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
    }

    const [type, key] = inputs.check.split(":");
    const payload = {
      actor,
      tokenId: actor.token?.id,
      attributes: actor.getUsableAttributes?.() ?? {},
      options: { canUseEdge: actor.canUseEdge?.() ?? false },
      ANARCHY: CONFIG.ANARCHY,
      event: options.event,
    };

    if (type === "attribute") {
      payload.mode = "attribute";
      payload.attribute1 = key;
    } else if (type === "skill") {
      const item = actor.items.find((i) => i.type === "skill" && (i.system.code === key || i.name === key));
      if (!item) {
        return { canceled: false, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
      }

      payload.mode = "skill";
      payload.skill = item;
      payload.attribute1 = item.system.attribute ?? "agility";
    } else {
      throw new Error(`Unsupported Anarchy check type: ${type}`);
    }

    await anarchy.rollParameters.build(payload);
    await anarchy.rollManager.roll(payload);

    const roll = payload.roll;
    const hits = roll?.total ?? 0;
    const pool = payload.param?.pool ?? 0;
    const glitch = roll?.glitchOutcome === "glitch";

    return {
      canceled: false,
      result: hits,
      target: 5,
      success: hits > 0,
      levelOfSuccess: pool > 0 ? Math.clamp(Math.round((hits / pool) * 100), 0, 100) : 0,
      criticalSuccess: false,
      criticalFailure: glitch,
    };
  },
};
