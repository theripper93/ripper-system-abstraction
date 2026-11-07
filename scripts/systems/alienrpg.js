import { captureRollMessage } from "./_shared.js";
const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export default async function alienrpg() {
  const isWeapon = (item) => item.type === "weapon" || item.type === "spacecraftweapons";
  const formatCost = (value) => game.settings.get("alienrpg", "dollar")
    ? Intl.NumberFormat("en-EN", { style: "currency", currency: "USD" }).format(value)
    : Intl.NumberFormat("en-EN", { style: "decimal", useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

  class AlienRPGCeckInput extends DataModel {
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

  class AlienRPGModifierInput extends DataModel {
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

  return {
    dataPaths: {
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

      wounds: "general.critInj.value",
      maximumWounds: "",
      primary: "health",
    },

    item: {
      quantity: "attributes.quantity.value",
      weight: "attributes.weight.value",

      equipped: "header.active",
      equippedValue: "true",
      unequippedValue: "false",
      attuned: "",

      uses: "attributes.rounds.value",
      maximumUses: "",

      values: {
        attackBonus: {
          label: "ripper-system-abstraction.item.values.attackBonus",
          type: "number",
          applies: isWeapon,
          path: "attributes.bonus.value",
        },
        damage: {
          label: "ripper-system-abstraction.item.values.damage",
          type: "number",
          applies: isWeapon,
          path: "attributes.damage.value",
        },
        range: {
          label: "ripper-system-abstraction.item.values.range",
          type: "number",
          applies: isWeapon,
          path: {
            get: (item) => item.system.attributes.range.value,
            set: (item, value) => {
              const steps = Object.keys(item.type === "weapon" ? CONFIG.ALIENRPG.weapon_range_list : CONFIG.ALIENRPG.ship_weapon_range_list).map(Number);
              return { "system.attributes.range.value": Math.clamp(value, Math.min(...steps), Math.max(...steps)) };
            },
          },
        },
        armorClass: {
          label: "ripper-system-abstraction.item.values.armorClass",
          type: "number",
          applies: (item) => item.type === "armor",
          path: "attributes.armorrating.value",
        },
        weight: {
          label: "ripper-system-abstraction.item.values.weight",
          type: "number",
          applies: (item) => item.system.attributes?.weight !== undefined,
          path: "attributes.weight.value",
        },
        price: {
          label: "ripper-system-abstraction.item.values.price",
          type: "number",
          applies: (item) => item.system.attributes?.cost !== undefined,
          path: {
            get: (item) => Number(String(item.system.attributes.cost.value).replace(/[^0-9.-]+/g, "")) || 0,
            set: (item, value) => ({ "system.attributes.cost.value": formatCost(value) }),
          },
        },
      },
    },

    currency: {
      base: "usd",

      actor: {
        denominations: {
          usd: "general.cash.value",
        },
      },

      item: {
        single: {
          value: "attributes.cost.value",
          denomination: "",
        },

        denominations: {},
      },

      denominations: {
        usd: { value: 1 },
      },
    },

    experience: {
      current: "general.xp.value",
      maximum: "general.xp.max",
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
    resultType: "successes",
    initiativeNeedsToken: true,
    buildInputs: () => {
      const choices = {};
      const group = {
        attribute: game.i18n.localize("ripper-system-abstraction.tests.Attribute"),
        skill: game.i18n.localize("ripper-system-abstraction.tests.Skill"),
      };

      for (const [key, label] of Object.entries(CONFIG.ALIENRPG.attributes)) {
        choices[`attribute.${key}`] = { label: game.i18n.localize(label), group: group.attribute };
      }

      for (const [key, value] of Object.entries(CONFIG.ALIENRPG.skills)) {
        choices[`skill.${key}`] = { label: game.i18n.localize(value.name), group: group.skill };
      }

      class CheckInput extends AlienRPGCeckInput {
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
        modifier: AlienRPGModifierInput,
      };
    },

    processCheck: async (actor, inputs, options = {}) => {
      const [type, key] = inputs.check.split(".");
      const dataset = { modifier: inputs.modifier ?? 0, stressMod: 0 };
      if (!["character", "synthetic"].includes(actor.type)) {
        throw new Error(`Alien RPG actors of type "${actor.type}" cannot perform checks.`);
      }

      if (type === "attribute") {
        const attribute = actor.system.attributes?.[key];
        if (!attribute) throw new Error(`Unknown Alien RPG attribute: ${key}`);

        dataset.label = game.i18n.localize(`ALIENRPG.Ability${key.capitalize()}`);
        dataset.roll = attribute.value;
        dataset.mod = attribute.mod;
        dataset.attr = "attribute";
      } else if (type === "skill") {
        const skill = actor.system.skills?.[key];
        if (!skill) throw new Error(`Unknown Alien RPG skill: ${key}`);

        dataset.label = game.i18n.localize(`ALIENRPG.Skill${key}`);
        dataset.roll = skill.mod;
      } else {
        throw new Error(`Unsupported Alien RPG check type: ${type}`);
      }

      const canceled = { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
      let response;
      const message = await captureRollMessage(async () => {
        response = await actor.abilityRoll(actor, dataset, options.fastForward ?? false);
        return response !== "cancelled";
      }, options);
      if (response === "cancelled") return canceled;
      if (!message) throw new Error(`Alien RPG: ${actor.name} has no dice to roll for ${inputs.check}.`);

      const rollArr = game.alienrpg.rollArr;
      const sixes = (rollArr.r1Six ?? 0) + (rollArr.r2Six ?? 0);
      const pool = (rollArr.r1Dice ?? 0) + (rollArr.r2Dice ?? 0);

      return {
        canceled: false,
        result: sixes,
        target: null,
        success: sixes > 0,
        levelOfSuccess: pool > 0 ? Math.round((sixes / pool) * 100) : 0,
        criticalSuccess: false,
        criticalFailure: false,
      };
    },
    },
  };
};
