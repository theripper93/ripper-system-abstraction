const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export default async function pf2e() {

  class PF2ECheckInput extends DataModel {
    static defineSchema() {
      return {
        value: new fields.StringField({
          label: "ripper-system-abstraction.tests.Check",
          required: true,
          choices,
        }),
      };
    }
  }

  class PF2EDCInput extends DataModel {
    static defineSchema() {
      return {
        value: new fields.NumberField({
          label: "ripper-system-abstraction.tests.DC",
          required: false,
          nullable: true,
          integer: true,
          min: 0,
        }),
      };
    }
  }

  const DEGREE_TO_LEVEL = [0, 33, 66, 100];

  function normalizeRoll(roll, dc) {
    if (!roll) {
      return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
    }

    const degree = roll.degreeOfSuccess;
    const target = Number.isNumeric(dc) ? dc : null;

    return {
      canceled: false,
      result: roll.total,
      target,
      success: degree != null ? degree >= 2 : null,
      levelOfSuccess: degree != null ? DEGREE_TO_LEVEL[degree] : null,
      criticalSuccess: degree === 3,
      criticalFailure: degree === 0,
    };
  }

  return {
    dataPaths: {
    actor: {
      type: "traits.value",
      subtype: "",
      size: "traits.size.value",
      level: "details.level.value",
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
      weight: "bulk.value",

      equipped: "equipped.carryType",
      attuned: "equipped.invested",

      uses: "",
      maximumUses: "",
    },

    currency: {
      base: "cp",

      actor: {
        denominations: {
          cp: "currency.cp",
          sp: "currency.sp",
          gp: "currency.gp",
          pp: "currency.pp",
        },
        handler: {
          get: (actor) => {
            const coins = actor.inventory?.currency;
            return coins ? { cp: coins.cp, sp: coins.sp, gp: coins.gp, pp: coins.pp } : {};
          },
          set: async (actor, amounts) => {
            const coins = actor.inventory.currency;
            const add = {};
            const remove = {};
            for (const [name, target] of Object.entries(amounts)) {
              const delta = target - (coins[name] ?? 0);
              if (delta > 0) add[name] = delta;
              else if (delta < 0) remove[name] = -delta;
            }
            if (Object.keys(remove).length) await actor.inventory.removeCurrency(remove, { byValue: false });
            if (Object.keys(add).length) await actor.inventory.addCurrency(add, { combineStacks: true });
          },
        },
      },

      item: {
        single: {
          value: "",
          denomination: "",
        },

        denominations: {
          cp: "price.value.cp",
          sp: "price.value.sp",
          gp: "price.value.gp",
          pp: "price.value.pp",
        },
      },

      denominations: {
        cp: { value: 1 },
        sp: { value: 10 },
        gp: { value: 100 },
        pp: { value: 1000 },
      },
    },

    experience: {
      current: "details.xp.value",
      maximum: "details.xp.max",
      level: "details.level.value",
    },

    features: {
      supportsHealth: true,
      supportsTemporaryHealth: true,
      supportsWounds: false,
      supportsCurrency: true,
      supportsWeight: true,
      supportsEquipment: true,
    },
    },
    testsInterface: {
    buildInputs: () => {
      const choices = {};

      for (const [slug, value] of Object.entries(CONFIG.PF2E.skills)) {
        choices[`skill.${slug}`] = game.i18n.localize(value.label);
      }

      for (const save of ["fortitude", "reflex", "will"]) {
        choices[`save.${save}`] = game.i18n.localize(`PF2E.Saves${save.capitalize()}`);
      }

      choices["perception"] = game.i18n.localize("PF2E.PerceptionCheck");

      class CheckInput extends PF2ECheckInput {
        static defineSchema() {
          return {
            value: new fields.StringField({
              label: "ripper-system-abstraction.tests.Check",
              required: true,
              choices,
            }),
          };
        }
      }

      return {
        check: CheckInput,
        dc: PF2EDCInput,
      };
    },

    processCheck: async (actor, inputs, options = {}) => {
      const [type, key] = inputs.check.split(".");
      const rollOptions = {
        skipDialog: options.fastForward ?? false,
        event: options.event,
      };
      if (inputs.dc != null) rollOptions.dc = inputs.dc;

      let roll;
      switch (type) {
        case "skill":
        case "save":
          roll = await actor.getStatistic(key)?.roll(rollOptions);
          break;

        case "perception":
          roll = await actor.perception?.roll(rollOptions);
          break;

        default:
          throw new Error(`Unsupported PF2E check type: ${type}`);
      }

      return normalizeRoll(roll, inputs.dc);
    },
    },
  };
};
