const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export default async function shadowdark() {
  const isMainArmor = (item) => item.type === "Armor" && !!item.system.ac?.base;
  const dieSize = (die) => Number(/^d(\d+)$/.exec(die ?? "")?.[1]) || null;
  // The weapon's main damage die key ("d6"): one-handed, or two-handed for two-handed-only weapons.
  const mainDieKey = (item) => (dieSize(item.system.damage?.oneHanded) ? "oneHanded" : dieSize(item.system.damage?.twoHanded) ? "twoHanded" : null);

  class ShadowdarkCheckInput extends DataModel {
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

  class ShadowdarkDCInput extends DataModel {
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

  function normalizeRoll(roll, dc) {
    if (!roll) {
      return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
    }

    const target = Number.isNumeric(roll.options?.dc) ? Number(roll.options.dc) : Number.isNumeric(dc) ? dc : null;
    const success = target != null ? roll.total >= target : null;

    return {
      canceled: false,
      result: roll.total,
      target,
      success,
      levelOfSuccess: success == null ? null : success ? 100 : 0,
      criticalSuccess: roll.criticalSuccess === true,
      criticalFailure: roll.criticalFailure === true,
    };
  }

  const SPELL_ITEM_TYPES = [
    { action: "Potion", icon: "fas fa-prescription-bottle", label: "SHADOWDARK.item.potion.label" },
    { action: "Scroll", icon: "fas fa-scroll", label: "SHADOWDARK.item.scroll.label", default: true },
    { action: "Spell", icon: "fa-solid fa-hand-sparkles", label: "SHADOWDARK.item.spell.label" },
    { action: "Wand", icon: "fa-solid fa-wand-magic-sparkles", label: "SHADOWDARK.item.wand.label" },
  ];

  async function itemFromSpell(spell, { dialog }) {
    const type = dialog
      ? await foundry.applications.api.DialogV2.wait({
        window: { title: game.i18n.format("SHADOWDARK.dialog.item.create_from_spell", { spellName: spell.name }) },
        content: await foundry.applications.handlebars.renderTemplate(
          "systems/shadowdark/templates/dialog/create-item-from-spell.hbs",
          { spellName: spell.name, isGM: game.user.isGM },
        ),
        buttons: SPELL_ITEM_TYPES,
        rejectClose: false,
      })
      : "Scroll";
    if (!type) return null;
    if (type === "Spell") return spell;
    return globalThis.shadowdark.utils.createItemFromSpell(type, spell);
  }

  return {
    dataPaths: {
    actor: {
      type: "",
      subtype: "",
      size: "",
      level: "level.value",
      role: "",
    },

    health: {
      current: "attributes.hp.value",
      maximum: "attributes.hp.max",
      temporary: "",
      minimum: "",

      wounds: "",
      maximumWounds: "",
    },

    item: {
      quantity: "quantity",
      weight: "slots.slots_used",

      equipped: "equipped",
      attuned: "",

      uses: "uses.available",
      maximumUses: "uses.max",

      values: {
        magicalBonus: {
          label: "ripper-system-abstraction.item.values.magicalBonus",
          type: "number",
          applies: isMainArmor,
          path: "ac.modifier",
        },
        damageDie: {
          label: "ripper-system-abstraction.item.values.damageDie",
          type: "number",
          applies: (item) => item.type === "Weapon" && !!mainDieKey(item),
          path: {
            get: (item) => dieSize(item.system.damage[mainDieKey(item)]),
            // A versatile weapon's two-handed die moves by the same number of faces.
            set: (item, value) => {
              const key = mainDieKey(item);
              const changes = { [`system.damage.${key}`]: `d${value}` };
              const other = dieSize(item.system.damage.twoHanded);
              if (key === "oneHanded" && other) changes["system.damage.twoHanded"] = `d${other + value - dieSize(item.system.damage.oneHanded)}`;
              return changes;
            },
          },
        },
        armorClass: {
          label: "ripper-system-abstraction.item.values.armorClass",
          type: "number",
          applies: (item) => item.type === "Armor" && (!!item.system.ac?.base || !!item.system.ac?.modifier || !!item.system.isAShield),
          path: {
            get: (item) => (isMainArmor(item) ? item.system.ac.base : item.system.ac?.modifier) ?? 0,
            set: (item, value) => ({ [isMainArmor(item) ? "system.ac.base" : "system.ac.modifier"]: value }),
          },
        },
        weight: {
          label: "ripper-system-abstraction.item.values.weight",
          type: "number",
          applies: (item) => item.system.slots?.slots_used !== undefined,
          path: "slots.slots_used",
        },
        price: {
          label: "ripper-system-abstraction.item.values.price",
          type: "number",
          applies: (item) => item.system.cost?.gp !== undefined,
          path: "cost.gp",
        },
      },

      fromSpell: {
        isSpell: (item) => item.type === "Spell",
        create: itemFromSpell,
      },
    },

    currency: {
      base: "gp",

      actor: {
        denominations: {
          gp: "coins.gp",
          sp: "coins.sp",
          cp: "coins.cp",
        },
      },

      item: {
        single: {
          value: "",
          denomination: "",
        },

        denominations: {
          gp: "cost.gp",
          sp: "cost.sp",
          cp: "cost.cp",
        },
      },

      denominations: {
        cp: { value: 0.01, abbreviation: "SHADOWDARK.coins.cp" },
        sp: { value: 0.1, abbreviation: "SHADOWDARK.coins.sp" },
        gp: { value: 1, abbreviation: "SHADOWDARK.coins.gp" },
      },
    },

    experience: {
      current: "level.xp",
      maximum: "",
      level: "level.value",
    },

    features: {
      supportsHealth: true,
      supportsTemporaryHealth: false,
      supportsWounds: false,
      supportsCurrency: true,
      supportsWeight: true,
      supportsEquipment: true,
    },
    },
    testsInterface: {
    resultType: "total",
    supportsAdvantage: true,
    buildInputs: () => {
      const choices = {};

      for (const key of CONFIG.SHADOWDARK.ABILITY_KEYS) {
        choices[key] = game.i18n.localize(CONFIG.SHADOWDARK.ABILITIES_LONG[key]);
      }

      class CheckInput extends ShadowdarkCheckInput {
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
        dc: ShadowdarkDCInput,
      };
    },

    processCheck: async (actor, inputs, options = {}) => {
      if (typeof actor.system.rollStatCheck !== "function") throw new Error(`Shadowdark actors of type "${actor.type}" cannot perform checks.`);
      const config = {
        skipPrompt: options.fastForward ?? false,
        event: options.event,
      };
      if (inputs.dc != null) config.mainRoll = { dc: inputs.dc };
      const advantage = (options.advantage ? 1 : 0) - (options.disadvantage ? 1 : 0);
      const hookId = advantage && Hooks.on("SD-Stat-Check", (checkConfig) => {
        if (checkConfig === config) config.mainRoll.advantage = Math.clamp((Number(config.mainRoll.advantage) || 0) + advantage, -1, 1);
      });

      let roll;
      try {
        roll = await actor.system.rollStatCheck(inputs.check, config);
      } finally {
        if (hookId) Hooks.off("SD-Stat-Check", hookId);
      }
      return normalizeRoll(roll, inputs.dc);
    },
    },
  };
};
