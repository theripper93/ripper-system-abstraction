const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export default async function pf1() {

  class PF1CheckInput extends DataModel {
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

  class PF1DCInput extends DataModel {
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

  function normalizeRoll(message, dc) {
    if (!message) {
      return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
    }

    const roll = message.rolls?.[0];
    const target = Number.isNumeric(dc) ? dc : null;
    const success = target != null ? roll.isSuccess : null;

    return {
      canceled: false,
      result: roll.total,
      target,
      success,
      levelOfSuccess: success == null ? null : success ? 100 : 0,
      criticalSuccess: roll.isCrit === true,
      criticalFailure: roll.isNat1 === true,
    };
  }

  return {
    dataPaths: {
    actor: {
      type: "traits.creatureTypes",
      subtype: "traits.creatureSubtypes",
      size: "traits.size",
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
      weight: "weight.value",

      equipped: "equipped",
      attuned: "",

      uses: "uses.value",
      maximumUses: "uses.max",
    },

    currency: {
      base: "gp",

      actor: {
        denominations: {
          pp: "currency.pp",
          gp: "currency.gp",
          sp: "currency.sp",
          cp: "currency.cp",
        },
      },

      item: {
        single: {
          value: "price",
          denomination: "gp",
        },

        denominations: {},
      },

      denominations: {
        pp: { value: 10 },
        gp: { value: 1 },
        sp: { value: 0.1 },
        cp: { value: 0.01 },
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
      const group = {
        abilityCheck: game.i18n.localize("ripper-system-abstraction.tests.AbilityCheck"),
        savingThrow: game.i18n.localize("ripper-system-abstraction.tests.SavingThrow"),
        skill: game.i18n.localize("ripper-system-abstraction.tests.Skill"),
      };

      for (const [key, value] of Object.entries(CONFIG.PF1.skills)) {
        choices[`skill.${key}`] = { label: game.i18n.localize(value), group: group.skill };
      }

      for (const [key, value] of Object.entries(CONFIG.PF1.abilities)) {
        choices[`ability.${key}`] = { label: game.i18n.localize(value), group: group.abilityCheck };
      }

      for (const [key, value] of Object.entries(CONFIG.PF1.savingThrows)) {
        choices[`save.${key}`] = { label: game.i18n.localize(value), group: group.savingThrow };
      }

      class CheckInput extends PF1CheckInput {
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
        dc: PF1DCInput,
      };
    },

    processCheck: async (actor, inputs, options = {}) => {
      const [type, key] = inputs.check.split(".");
      const rollOptions = {
        skipDialog: options.fastForward ?? false,
        event: options.event,
      };
      if (inputs.dc != null) rollOptions.dc = inputs.dc;

      let message;
      switch (type) {
        case "skill":
          message = await actor.rollSkill(key, rollOptions);
          break;

        case "ability":
          message = await actor.rollAbilityTest(key, rollOptions);
          break;

        case "save":
          message = await actor.rollSavingThrow(key, rollOptions);
          break;

        default:
          throw new Error(`Unsupported PF1 check type: ${type}`);
      }

      return normalizeRoll(message, inputs.dc);
    },
    },
  };
};
