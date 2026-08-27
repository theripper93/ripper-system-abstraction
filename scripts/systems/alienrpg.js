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
    current: "header.health.value",
    maximum: "header.health.max",
    temporary: "",
    minimum: "",

    useWounds: true,
    wounds: "general.critInj.value",
    maximumWounds: "",
  },

  item: {
    quantity: "attributes.quantity.value",
    weight: "attributes.weight.value",

    equipped: "",
    attuned: "",

    uses: "attributes.rounds.value",
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
    current: "general.xp.value",
    maximum: "general.xp.max",
    level: "",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: true,
    supportsCurrency: false,
    supportsWeight: true,
    supportsEquipment: false,
  },
};

class AlienRPGCeckInput extends DataModel {
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

class AlienRPGModifierInput extends DataModel {
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

    for (const [key, label] of Object.entries(CONFIG.ALIENRPG.attributes)) {
      choices[`attribute.${key}`] = game.i18n.localize(label);
    }

    for (const [key, value] of Object.entries(CONFIG.ALIENRPG.skills)) {
      choices[`skill.${key}`] = game.i18n.localize(value.name);
    }

    class CheckInput extends AlienRPGCeckInput {
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
      modifier: AlienRPGModifierInput,
    };
  },

  processCheck: async (actor, inputs, options = {}) => {
    const [type, key] = inputs.check.split(".");
    const dataset = { modifier: inputs.modifier ?? 0, stressMod: 0 };

    if (type === "attribute") {
      const attribute = actor.system.attributes[key];
      if (!attribute) throw new Error(`Unknown Alien RPG attribute: ${key}`);

      dataset.label = game.i18n.localize(`ALIENRPG.Ability${key.capitalize()}`);
      dataset.roll = attribute.value;
      dataset.mod = attribute.mod;
      dataset.attr = "attribute";
    } else if (type === "skill") {
      const skill = actor.system.skills[key];
      if (!skill) throw new Error(`Unknown Alien RPG skill: ${key}`);

      dataset.label = game.i18n.localize(`ALIENRPG.Skill${key}`);
      dataset.roll = skill.mod;
    } else {
      throw new Error(`Unsupported Alien RPG check type: ${type}`);
    }

    const result = actor.abilityRoll(actor, dataset, options.fastForward ?? true);
    if (result === "cancelled") {
      return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
    }

    const rollArr = game.alienrpg.rollArr;
    for (let i = 0; i < 40; i++) {
      if (rollArr.r1Dice > 0 || rollArr.r2Dice > 0) break;
      await new Promise((r) => setTimeout(r, 50));
    }

    const sixes = (rollArr.r1Six ?? 0) + (rollArr.r2Six ?? 0);
    const pool = (rollArr.r1Dice ?? 0) + (rollArr.r2Dice ?? 0);

    return {
      canceled: false,
      result: sixes,
      target: null,
      success: sixes > 0,
      levelOfSuccess: pool > 0 ? Math.round((sixes / pool) * 100) : 0,
      criticalSuccess: false,
      criticalFailure: false,
    };
  },
};
