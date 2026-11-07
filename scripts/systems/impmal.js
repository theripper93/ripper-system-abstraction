const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

// Ranged weapons that reload a magazine (grenades and explosives use their own quantity).
const hasMagazine = (item) => item.type === "weapon" && item.system.attackType === "ranged" && !item.system.selfAmmo;

export default async function impmal() {

  class ImpMalCheckInput extends DataModel {
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

  class ImpMalModifierInput extends DataModel {
    static defineSchema() {
      return {
        value: new fields.NumberField({
          label: "ripper-system-abstraction.tests.Modifier",
          required: false,
          nullable: true,
          integer: true,
        }),
      };
    }
  }

  function normalizeTest(test) {
    if (!test?.result) {
      return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
    }

    const result = test.result;
    const success = result.outcome === "success";
    const sl = Number(result.SL) || 0;

    return {
      canceled: false,
      result: result.roll,
      target: result.target,
      success,
      levelOfSuccess: Math.clamp(50 + sl * 10, 0, 100),
      criticalSuccess: false,
      criticalFailure: false,
    };
  }

  return {
    dataPaths: {
    actor: {
      type: "species",
      subtype: "",
      size: "combat.size",
      level: "",
      role: ["role.name", "role"],
    },

    health: {
      current: "combat.wounds.value",
      maximum: "combat.wounds.max",
      temporary: "",
      minimum: "",

      wounds: "combat.criticals.value",
      maximumWounds: "combat.criticals.max",
      primary: "health",

      invert: true,
    },

    item: {
      quantity: "quantity",
      weight: "encumbrance.value",

      equipped: "equipped.value",
      attuned: "",

      uses: "uses.value",
      maximumUses: "uses.max",

      values: {
        damageBonus: {
          label: "ripper-system-abstraction.item.values.damageBonus",
          type: "number",
          applies: (item) => item.type === "weapon" || item.type === "ammo",
          path: {
            // Weapon base damage is a string field the system reads with Number().
            get: (item) => (item.type === "weapon" ? Number(item.system.damage?.base) || 0 : item.system.damage),
            set: (item, value) => (item.type === "weapon" ? { "system.damage.base": String(value) } : { "system.damage": value }),
          },
        },
        armorClass: {
          label: "ripper-system-abstraction.item.values.armorClass",
          type: "number",
          applies: (item) => item.type === "protection",
          path: "armour",
        },
        forceFieldProtection: {
          label: "ripper-system-abstraction.item.values.forceFieldProtection",
          type: "formula",
          applies: (item) => item.type === "forceField",
          path: "protection",
        },
        maximumUses: {
          label: "ripper-system-abstraction.item.values.maximumUses",
          type: "number",
          applies: (item) => hasMagazine(item) || (item.type === "equipment" && !!item.system.uses?.enabled),
          path: {
            get: (item) => (item.type === "weapon" ? item.system.mag?.value : item.system.uses?.max),
            set: (item, value) => ({ [item.type === "weapon" ? "system.mag.value" : "system.uses.max"]: value }),
          },
        },
        weight: {
          label: "ripper-system-abstraction.item.values.weight",
          type: "number",
          applies: (item) => item.system.encumbrance?.value !== undefined,
          path: "encumbrance.value",
        },
        price: {
          label: "ripper-system-abstraction.item.values.price",
          type: "number",
          applies: (item) => item.system.cost !== undefined,
          path: "cost",
        },
      },
    },

    currency: {
      base: "solars",

      actor: {
        denominations: {
          solars: "solars",
        },
      },

      item: {
        single: {
          value: "cost",
          denomination: "solars",
        },

        denominations: {},
      },

      denominations: {
        solars: { value: 1 },
      },
    },

    updateOptions: { skipXPReason: true },

    experience: {
      current: "xp.total",
      maximum: "",
      level: "",
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
    resultType: "rollUnder",
    supportsAdvantage: true,
    buildInputs: () => {
      const choices = {};
      const group = {
        characteristic: game.i18n.localize("ripper-system-abstraction.tests.Characteristic"),
        skill: game.i18n.localize("ripper-system-abstraction.tests.Skill"),
      };

      for (const [key, label] of Object.entries(game.impmal.config.characteristics)) {
        choices[`char.${key}`] = { label: game.i18n.localize(label), group: group.characteristic };
      }

      for (const [key, label] of Object.entries(game.impmal.config.skills)) {
        choices[`skill.${key}`] = { label: game.i18n.localize(label), group: group.skill };
      }

      class CheckInput extends ImpMalCheckInput {
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
        modifier: ImpMalModifierInput,
      };
    },

    processCheck: async (actor, inputs, options = {}) => {
      if (!actor.system.characteristics || actor.type === "vehicle") throw new Error(`Imperium Maledictum actors of type "${actor.type}" cannot perform checks.`);
      const [type, key] = inputs.check.split(".");
      const context = {
        skipDialog: options.fastForward ?? false,
        skipTargets: true,
        event: options.event,
        fields: { difficulty: "challenging" },
      };
      if (inputs.modifier != null) context.fields.modifier = inputs.modifier;
      if (options.advantage) context.fields.advantage = 1;
      if (options.disadvantage) context.fields.disadvantage = 1;

      const resolveOnClose = Hooks.on("renderApplicationV2", (app) => {
        if (typeof app.resolve !== "function") return;
        const close = app.close.bind(app);
        app.close = (...args) => {
          const result = close(...args);
          app.resolve();
          return result;
        };
      });

      let test;
      try {
        switch (type) {
          case "char":
            test = await actor.setupCharacteristicTest(key, context);
            break;

          case "skill":
            test = await actor.setupSkillTest({ key }, context);
            break;

          default:
            throw new Error(`Unsupported Imperium Maledictum check type: ${type}`);
        }
      } finally {
        Hooks.off("renderApplicationV2", resolveOnClose);
      }

      return normalizeTest(test);
    },
    },
  };
};
