const { DataModel, fields } = foundry.abstract;

export const dataPaths = {
  actor: {
    type: ["details.type.value", "details.type.custom"],
    subtype: "details.type.subtype",
    size: "traits.size",
    level: "details.level",
    role: "",
  },

  health: {
    current: "attributes.hp.value",
    maximum: "attributes.hp.max",
    temporary: "attributes.hp.temp",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "weight.value",

    equipped: "equipped",
    attuned: "attuned",

    uses: "uses.value",
    maximumUses: "uses.max",
  },

  currency: {
    base: "gp",

    actor: {
      denominations: {
        cp: "currency.cp",
        sp: "currency.sp",
        ep: "currency.ep",
        gp: "currency.gp",
        pp: "currency.pp",
      },
    },

    item: {
      single: {
        value: "price.value",
        denomination: "price.denomination",
      },

      denominations: {},
    },

    denominations: {
      cp: { value: 0.01 },
      sp: { value: 0.1 },
      ep: { value: 0.5 },
      gp: { value: 1 },
      pp: { value: 10 },
    },
  },

  experience: {
    current: "details.xp.value",
    maximum: "details.xp.max",
    level: "details.level",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: true,
    supportsWounds: false,
    supportsCurrency: true,
    supportsWeight: true,
    supportsEquipment: true,
  },
};

/**
 * D&D 5e check input.
 *
 * Values use the normalized format:
 *
 *   skill.acrobatics
 *   check.str
 *   save.dex
 *   save.death
 *   tool.thievesTools
 */
class DND5ECheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
      }),
    };
  }
}

/**
 * D&D 5e Difficulty Class.
 */
class DND5EDCInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({
        required: false,
        nullable: true,
        integer: true,
        min: 0,
      }),
    };
  }
}

export const testsInterface = {
  buildInputs: (actor) => {
    const choices = {};

    // Ability checks
    for (const [key, value] of Object.entries(CONFIG.DND5E.abilities)) {
      choices[`check.${key}`] = value.label;
    }

    // Saving throws
    for (const [key, value] of Object.entries(CONFIG.DND5E.abilities)) {
      choices[`save.${key}`] = value.label;
    }

    // Death save
    choices["save.death"] = game.i18n.localize("DND5E.DeathSave");

    // Skills
    for (const [key, value] of Object.entries(CONFIG.DND5E.skills)) {
      choices[`skill.${key}`] = value.label;
    }

    // Tools
    if (actor?.system?.tools) {
      for (const key of Object.keys(actor.system.tools)) {
        choices[`tool.${key}`] =
          CONFIG.DND5E.toolProficiencies[key] ?? key;
      }
    }

    class CheckInput extends DND5ECheckInput {
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
      dc: DND5EDCInput,
    };
  },

  processCheck: async (actor, inputs) => {
    const [type, key] = inputs.check.split(".");

    switch (type) {
      case "skill":
        return actor.rollSkill({
          skill: key,
        });

      case "save":
        if (key === "death") {
          return actor.rollDeathSave({
            legacy: false,
          });
        }

        return actor.rollSavingThrow({
          ability: key,
        });

      case "check":
        return actor.rollAbilityCheck({
          ability: key,
        });

      case "tool":
        return actor.rollToolCheck({
          tool: key,
        });

      default:
        throw new Error(`Unsupported D&D 5e check type: ${type}`);
    }
  },
};