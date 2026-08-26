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
      choices[`skill.${key}`] = game.i18n.localize(value.nam ?? value.name);
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

  processCheck: async (actor, inputs) => {
    const [type, key] = inputs.check.split(".");
    const dataset = { modifier: inputs.modifier ?? 0 };

    if (type === "attribute") {
      const attribute = actor.system.attributes[key];
      if (!attribute) throw new Error(`Unknown Alien RPG attribute: ${key}`);

      dataset.label = game.i18n.localize(`ALIENRPG.Ability${key.capitalize()}`);
      dataset.roll = attribute.value;
      dataset.mod = attribute.mod;
      dataset.attr = "attribute";

      return actor.abilityRoll(actor, dataset, true);
    }

    if (type === "skill") {
      const skill = actor.system.skills[key];
      if (!skill) throw new Error(`Unknown Alien RPG skill: ${key}`);

      dataset.label = game.i18n.localize(`ALIENRPG.Skill${key}`);
      dataset.roll = skill.mod;

      return actor.abilityRoll(actor, dataset, true);
    }

    throw new Error(`Unsupported Alien RPG check type: ${type}`);
  },
};
