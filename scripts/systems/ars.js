const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "attributes.size",
    level: "",
    role: "",
  },

  health: {
    current: "attributes.hp.value",
    maximum: "attributes.hp.max",
    temporary: "attributes.hp.temp.hp.value",
    minimum: "attributes.hp.min",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "weight",

    equipped: "location.state",
    attuned: "",

    uses: "charges.value",
    maximumUses: "charges.max",
  },

  currency: {
    base: "gp",

    actor: {
      denominations: {
        pp: "currency.pp",
        ep: "currency.ep",
        gp: "currency.gp",
        sp: "currency.sp",
        cp: "currency.cp",
      },
    },

    item: {
      single: {
        value: "cost.value",
        denomination: "cost.currency",
      },

      denominations: {},
    },

    denominations: {
      cp: { value: 0.005 },
      sp: { value: 0.05 },
      ep: { value: 0.5 },
      gp: { value: 1 },
      pp: { value: 5 },
    },
  },

  experience: {
    current: "details.xp",
    maximum: "",
    level: "",
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

class ARSCheckInput extends DataModel {
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

function normalizeRoll(roll) {
  if (!roll) {
    return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
  }

  return {
    canceled: false,
    result: roll.total,
    target: roll.checkTarget != null ? Number(roll.checkTarget) : null,
    success: roll.success === true,
    levelOfSuccess: roll.success === true ? 100 : 0,
    criticalSuccess: roll.critical === true,
    criticalFailure: roll.fumble === true,
  };
}

export const testsInterface = {
  buildInputs: () => {
    const choices = {};

    for (const [key, label] of Object.entries(CONFIG.ARS.abilityTypes)) {
      if (key === "none") continue;
      choices[`ability.${key}`] = game.i18n.localize(label);
    }

    for (const [key, label] of Object.entries(CONFIG.ARS.saveTypes)) {
      if (key === "none") continue;
      choices[`save.${key}`] = game.i18n.localize(label);
    }

    class CheckInput extends ARSCheckInput {
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
    const [type, key] = inputs.check.split(".");

    if (options.fastForward) {
      const target = type === "ability"
        ? Number(actor.system.abilities[key]?.value ?? 10)
        : Number(actor.system.saves[key]?.value ?? 0);
      const roll = await new game.ars.ARSDice(actor).makeGenericRoll("d20", target, type === "ability" ? "descending" : "ascending", true);

      return normalizeRoll(roll);
    }

    let roll;
    switch (type) {
      case "ability":
        roll = await new game.ars.ARSDice(actor, null, { event: options.event }).makeAbilityCheckRollAsync(key, "d20");
        break;

      case "save":
        roll = await new game.ars.ARSDice(actor, null, { event: options.event }).makeSaveRollAsync(key);
        break;

      default:
        throw new Error(`Unsupported ARS check type: ${type}`);
    }

    return normalizeRoll(roll);
  },
};
