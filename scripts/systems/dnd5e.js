const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

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

class DND5ECheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        label: "Check",
        required: true,
      }),
    };
  }
}

class DND5EDCInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({
        label: "DC",
        required: false,
        nullable: true,
        integer: true,
        min: 0,
      }),
    };
  }
}

function normalizeRoll(roll, dc) {
  if (!roll) {
    return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
  }

  const target = Number.isNumeric(dc) ? dc : null;
  const criticalSuccess = roll.isCritical === true;
  const criticalFailure = roll.isFumble === true;
  const success = target != null ? roll.total >= target : null;

  return {
    canceled: false,
    result: roll.total,
    target,
    success,
    levelOfSuccess: success == null ? null : success ? 100 : 0,
    criticalSuccess,
    criticalFailure,
  };
}

export const testsInterface = {
  buildInputs: () => {
    const choices = {};

    for (const [key, value] of Object.entries(CONFIG.DND5E.abilities)) {
      choices[`check.${key}`] = value.label;
      choices[`save.${key}`] = value.label;
    }

    choices["save.death"] = game.i18n.localize("DND5E.DeathSave");

    for (const [key, value] of Object.entries(CONFIG.DND5E.skills)) {
      choices[`skill.${key}`] = value.label;
    }

    class CheckInput extends DND5ECheckInput {
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
      dc: DND5EDCInput,
    };
  },

  processCheck: async (actor, inputs, options = {}) => {
    const [type, key] = inputs.check.split(".");
    const config = { event: options.event };
    const dialog = options.fastForward ? { configure: false } : {};

    let rolls;
    switch (type) {
      case "skill":
        rolls = await actor.rollSkill({ skill: key, ...config }, dialog);
        break;

      case "save":
        if (key === "death") {
          rolls = await actor.rollDeathSave(config, dialog);
        } else {
          rolls = await actor.rollSavingThrow({ ability: key, ...config }, dialog);
        }
        break;

      case "check":
        rolls = await actor.rollAbilityCheck({ ability: key, ...config }, dialog);
        break;

      default:
        throw new Error(`Unsupported D&D 5e check type: ${type}`);
    }

    return normalizeRoll(rolls?.[0], inputs.dc);
  },
};
