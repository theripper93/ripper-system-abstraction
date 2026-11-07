import { captureRollMessage } from "./_shared.js";

const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export default async function cairn2e() {
  const { applyGold } = await import(/* webpackIgnore: true */ foundry.utils.getRoute("systems/cairn2e/module/coin.js"));
  const { goldTotal } = await import(/* webpackIgnore: true */ foundry.utils.getRoute("systems/cairn2e/module/coin-rules.js"));

  const CAIRN_ABILITIES = ["STR", "DEX", "WIL"];
  // Gear damage is one of these dice, and armor is 0-3 (both validated by the data model).
  const DAMAGE_DICE = [4, 6, 8, 10, 12];
  const isGear = (item) => item.type === "gear";
  // Snap a die size to a valid die, rounding away from the current one (d6 + 1 gives d8, d8 - 1 gives d6).
  const toDamageDie = (value, current) => {
    const size = Number(value) || 0;
    const valid = size < current ? DAMAGE_DICE.findLast((s) => s <= size) ?? DAMAGE_DICE[0] : DAMAGE_DICE.find((s) => s >= size) ?? DAMAGE_DICE.at(-1);
    return `d${valid}`;
  };

  function savePasses(face, target) {
    if (face === 1) return true;
    if (face === 20) return false;
    return face <= target;
  }

  return {
    dataPaths: {
    actor: {
      type: "",
      subtype: "",
      size: "",
      level: "",
      role: "role",
    },

    health: {
      current: "hp.value",
      maximum: "hp.max",
      temporary: "",
      minimum: "",

      wounds: "",
      maximumWounds: "",
    },

    item: {
      quantity: "",
      weight: "slots",

      equipped: "equipped",
      equippable: (item) => !item.system.bodily,
      attuned: "",

      uses: "uses.value",
      maximumUses: "uses.max",

      values: {
        damageDie: {
          label: "ripper-system-abstraction.item.values.damageDie",
          type: "number",
          applies: (item) => isGear(item) && !!item.system.damage,
          path: {
            get: (item) => Number(item.system.damage.slice(1)),
            set: (item, value) => ({ "system.damage": toDamageDie(value, Number(item.system.damage.slice(1))) }),
          },
        },
        armorClass: {
          label: "ripper-system-abstraction.item.values.armorClass",
          type: "number",
          applies: (item) => isGear(item) && item.system.armor > 0,
          path: {
            get: (item) => item.system.armor,
            set: (item, value) => ({ "system.armor": Math.clamp(Math.round(Number(value) || 0), 0, 3) }),
          },
        },
        maximumUses: {
          label: "ripper-system-abstraction.item.values.maximumUses",
          type: "number",
          applies: (item) => isGear(item) && !(item.system.capacity > 0),
          path: "uses.max",
        },
        weight: {
          label: "ripper-system-abstraction.item.values.weight",
          type: "number",
          // A scroll weighs nothing whatever its stored slots (GearData#prepareBaseData).
          applies: (item) => isGear(item) && item.system.magic !== "scroll",
          path: "slots",
        },
        price: {
          label: "ripper-system-abstraction.item.values.price",
          type: "number",
          applies: isGear,
          path: "cost",
        },
      },
    },

    currency: {
      base: "gp",

      actor: {
        denominations: {
          gp: "",
        },
        handler: {
          get: (actor) => ({ gp: goldTotal(actor.items) }),
          set: async (actor, amounts) => {
            if (amounts.gp == null) return;
            await applyGold(actor, amounts.gp - goldTotal(actor.items));
          },
        },
      },

      item: {
        single: {
          value: "cost",
          denomination: "gp",
        },

        denominations: {},
      },

      denominations: {
        gp: { value: 1, abbreviation: "CAIRN.GoldAbbrev" },
      },
    },

    experience: {
      current: "",
      maximum: "",
    },

    overrides: {
      Item: {
        coin: {
          currency: { item: { single: { value: "value" } } },
        },
      },
    },

    features: {
      supportsHealth: true,
      supportsTemporaryHealth: false,
      supportsWounds: false,
      supportsCurrency: true,
      supportsWeight: true,
      supportsEquipment: true,
      supportsAttunement: false,
    },
    },
    testsInterface: {
    resultType: "rollUnder",
    buildInputs: () => {
      const choices = {};
      for (const key of CAIRN_ABILITIES) choices[key] = game.i18n.localize(key);

      class CheckInput extends DataModel {
        static defineSchema() {
          return {
            value: new fields.StringField({
              label: "ripper-system-abstraction.tests.SavingThrow",
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
      const target = actor.system.abilities?.[inputs.check]?.value;
      if (target == null) throw new Error(`Cairn actors of type "${actor.type}" cannot perform checks.`);

      const message = await captureRollMessage(async () => {
        await game.cairn2e.rolls.rollSave(actor, inputs.check);
      }, options);
      const face = message?.rolls?.[0]?.total;
      if (face == null) {
        return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
      }

      const success = savePasses(face, target);
      return {
        canceled: false,
        result: face,
        target,
        success,
        levelOfSuccess: success ? 100 : 0,
        criticalSuccess: face === 1,
        criticalFailure: face === 20,
      };
    },
    },
  };
};
