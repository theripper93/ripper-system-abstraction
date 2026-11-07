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

  const PHYSICAL_TYPES = ["weapon", "armor", "accessory", "consumable", "tool", "loot"];
  // system.price is prepared as base price scaled by rarity; writes store the base price
  const priceField = {
    get: (item) => item.system.price,
    set: (item, value) => {
      const rarity = item.system.rarity ?? 0;
      const base = rarity < 0 ? value * Math.abs(rarity - 1) : value / Math.pow(rarity + 1, 3);
      return { "system.price": Math.round(base) };
    },
  };

  return {
    dataPaths: {
    actor: {
      type: "details.taxonomy.category",
      typeChoices: () => SYSTEM.ACTOR.CREATURE_CATEGORIES,
      subtype: "",
      size: "movement.size",
      level: "advancement.level",
      role: "advancement.rank",
    },

    health: {
      current: "resources.health.value",
      maximum: "resources.health.max",
      temporary: "",
      minimum: "",

      wounds: "resources.wounds.value",
      maximumWounds: "resources.wounds.max",
      primary: "health",
    },

    item: {
      quantity: "quantity",
      weight: "weight",

      equipped: "equipped",
      attuned: "invested",
      stackable: (item) => item.system.properties?.has?.("stackable") && !item.system.equipped,

      uses: "uses.value",
      maximumUses: "uses.max",

      values: {
        armorClass: {
          label: "ripper-system-abstraction.item.values.armorClass",
          type: "number",
          applies: (item) => item.type === "armor",
          // prepared armor.base is clamped to the category range and halved when broken
          path: {
            get: (item) => item._source.system.armor?.base ?? null,
            set: (item, value) => ({ "system.armor.base": value }),
          },
        },
        maximumUses: {
          label: "ripper-system-abstraction.item.values.maximumUses",
          type: "number",
          applies: (item) => item.type === "consumable",
          path: "uses.max",
        },
        weight: {
          label: "ripper-system-abstraction.item.values.weight",
          type: "number",
          applies: (item) => PHYSICAL_TYPES.includes(item.type),
          path: "weight",
        },
        price: {
          label: "ripper-system-abstraction.item.values.price",
          type: "number",
          applies: (item) => PHYSICAL_TYPES.includes(item.type),
          path: priceField,
        },
      },
    },

    currency: {
      base: "cp",

      actor: {
        denominations: { cp: "", sp: "", gp: "", pp: "" },
        handler: {
          get: (actor) => (actor.system.currency === undefined ? {} : globalThis.crucible.api.documents.CrucibleActor.allocateCurrency(actor.system.currency)),
          set: (actor, amounts) => {
            const wallet = { ...globalThis.crucible.api.documents.CrucibleActor.allocateCurrency(actor.system.currency ?? 0), ...amounts };
            const total = Object.entries(wallet).reduce((sum, [key, amount]) => sum + amount * (SYSTEM.ACTOR.CURRENCY_DENOMINATIONS[key]?.multiplier ?? 0), 0);
            return actor.update({ "system.currency": Math.round(total) });
          },
        },
      },

      item: {
        single: {
          value: priceField,
          denomination: "",
        },

        denominations: {},
      },

      denominations: Object.fromEntries(Object.entries(SYSTEM.ACTOR.CURRENCY_DENOMINATIONS).map(([key, entry]) => [key, {
          value: entry.multiplier,
          label: entry.label,
          abbreviation: entry.abbreviation,
          icon: entry.icon ?? null,
        }])),
    },

    experience: {
      current: "advancement.milestones",
      maximum: "advancement.next",
    },

    features: {
      supportsHealth: true,
      supportsTemporaryHealth: false,
      supportsWounds: true,
      supportsCurrency: true,
      supportsWeight: true,
      supportsEquipment: true,
      supportsAttunement: true,
    },
    },
    testsInterface: {
    resultType: "total",
    supportsAdvantage: true,
    buildInputs: () => {
      const choices = {};

      for (const skill of Object.values(SYSTEM.SKILLS)) {
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
      if (!actor.system.skills) throw new Error(`Crucible actors of type "${actor.type}" cannot perform checks.`);
      const check = await actor.rollSkill(inputs.check, {
        dc: inputs.dc ?? undefined,
        boons: options.advantage ? 1 : 0,
        banes: options.disadvantage ? 1 : 0,
        chatMessage: !options.silent,
        dialog: !options.fastForward,
      });

      return normalizeCheck(check);
    },
    },
  };
};
