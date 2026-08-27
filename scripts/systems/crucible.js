const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export default async function crucible() {

  class CrucibleCheckInput extends DataModel {
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

  class CrucibleDCInput extends DataModel {
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

  function normalizeCheck(check) {
    if (!check) {
      return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
    }

    const success = Number.isNumeric(check.data?.dc) ? check.isSuccess : null;
    let levelOfSuccess = null;
    if (success != null) {
      if (check.isCriticalSuccess) levelOfSuccess = 100;
      else if (check.isSuccess) levelOfSuccess = 66;
      else if (check.isCriticalFailure) levelOfSuccess = 0;
      else levelOfSuccess = 33;
    }

    return {
      canceled: false,
      result: check.total,
      target: Number.isNumeric(check.data?.dc) ? check.data.dc : null,
      success,
      levelOfSuccess,
      criticalSuccess: check.isCriticalSuccess === true,
      criticalFailure: check.isCriticalFailure === true,
    };
  }

  return {
    dataPaths: {
    actor: {
      type: "",
      subtype: "",
      size: "movement.size",
      level: "advancement.level",
      role: "",
    },

    health: {
      current: "resources.health.value",
      maximum: "resources.health.max",
      temporary: "",
      minimum: "",

      useWounds: true,
      wounds: "resources.wounds.value",
      maximumWounds: "resources.wounds.max",
    },

    item: {
      quantity: "quantity",
      weight: "weight",

      equipped: "equipped",
      attuned: "invested",

      uses: "uses.value",
      maximumUses: "uses.max",
    },

    currency: {
      base: "cp",

      actor: {
        denominations: {},
      },

      item: {
        single: {
          value: "price",
          denomination: "cp",
        },

        denominations: {},
      },

      denominations: {
        cp: { value: 1 },
        sp: { value: 10 },
        gp: { value: 100 },
        pp: { value: 1000 },
      },
    },

    experience: {
      current: "",
      maximum: "",
      level: "advancement.level",
    },

    features: {
      supportsHealth: true,
      supportsTemporaryHealth: false,
      supportsWounds: true,
      supportsCurrency: true,
      supportsWeight: true,
      supportsEquipment: true,
    },
    },
    testsInterface: {
    buildInputs: () => {
      const choices = {};

      for (const skill of globalThis.SYSTEM?.SKILLS ?? []) {
        choices[skill.id] = game.i18n.localize(skill.label);
      }

      class CheckInput extends CrucibleCheckInput {
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
        dc: CrucibleDCInput,
      };
    },

    processCheck: async (actor, inputs, options = {}) => {
      const check = await actor.rollSkill(inputs.check, {
        dc: inputs.dc,
        chatMessage: true,
      });

      return normalizeCheck(check);
    },
    },
  };
};
