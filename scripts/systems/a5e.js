const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export const dataPaths = {
  actor: {
    type: "",
    subtype: "details.creatureTypes",
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
    weight: "weight",

    equipped: "equippedState",
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
    current: "details.xp",
    maximum: "",
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

class A5ECheckInput extends DataModel {
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

class A5EDCInput extends DataModel {
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

function normalizeRoll(message, dc) {
  if (!message) {
    return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
  }

  const roll = message.rolls?.[0];
  const d20 = roll?.dice?.[0];
  const active = d20?.results?.filter((r) => r.active) ?? [];
  const criticalSuccess = active.some((r) => r.result >= 20);
  const criticalFailure = active.some((r) => r.result === 1);
  const target = Number.isNumeric(dc) ? dc : null;
  const success = target != null ? roll.total >= target : null;

  return {
    canceled: false,
    result: roll?.total ?? null,
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

    for (const [key, value] of Object.entries(CONFIG.A5E.abilities)) {
      choices[`check.${key}`] = game.i18n.localize(value);
      choices[`save.${key}`] = game.i18n.localize(value);
    }

    choices["save.death"] = game.i18n.localize("A5E.deathSavingThrow.title");

    for (const [key, value] of Object.entries(CONFIG.A5E.skills)) {
      choices[`skill.${key}`] = game.i18n.localize(value);
    }

    class CheckInput extends A5ECheckInput {
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
      dc: A5EDCInput,
    };
  },

  processCheck: async (actor, inputs, options = {}) => {
    const [type, key] = inputs.check.split(".");
    const rollOptions = {
      skipRollDialog: options.fastForward ?? false,
      event: options.event,
    };

    let message;
    switch (type) {
      case "skill":
        message = await actor.rollSkillCheck(key, rollOptions);
        break;

      case "save":
        if (key === "death") {
          message = await actor.rollSavingThrow(undefined, {
            ...rollOptions,
            saveType: "death",
          });
        } else {
          message = await actor.rollSavingThrow(key, rollOptions);
        }
        break;

      case "check":
        message = await actor.rollAbilityCheck(key, rollOptions);
        break;

      default:
        throw new Error(`Unsupported A5E check type: ${type}`);
    }

    return normalizeRoll(message, inputs.dc);
  },
};
