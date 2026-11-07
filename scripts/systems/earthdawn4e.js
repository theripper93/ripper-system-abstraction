const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export default async function earthdawn4e() {
  const rate = Number(game.settings.get("earthdawn4e", "moneyConversionRate")) || 10;
  // Item fields come from template.json (no data models): numeric values are
  // stored as "" until set, so read them as numbers or null.
  const numberAt = (path) => ({
    get: (item) => {
      const value = foundry.utils.getProperty(item.system, path);
      return value === "" || value == null || !Number.isFinite(Number(value)) ? null : Number(value);
    },
    set: (item, value) => ({ [`system.${path}`]: value }),
  });

  const EARTHDAWN_ATTRIBUTES = {
    dexterityStep: "earthdawn.d.dexterity",
    strengthStep: "earthdawn.s.strength",
    toughnessStep: "earthdawn.t.toughness",
    perceptionStep: "earthdawn.p.perception",
    willpowerStep: "earthdawn.w.willpower",
    charismaStep: "earthdawn.c.charisma",
  };

  class EarthdawnCheckInput extends DataModel {
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

  class EarthdawnDifficultyInput extends DataModel {
    static defineSchema() {
      return {
        value: new fields.NumberField({
          label: "ripper-system-abstraction.tests.Difficulty",
          required: false,
          nullable: true,
          integer: true,
          min: 0,
        }),
      };
    }
  }

  class EarthdawnModifierInput extends DataModel {
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
      type: "actorType",
      subtype: "",
      size: "",
      level: (actor) => {
        const circles = actor.items.filter((item) => item.type === "discipline").map((item) => Number(item.system.circle) || 0);
        return circles.length ? Math.max(...circles) : null;
      },
      role: "",
    },

    health: {
      current: "damage.value",
      maximum: "damage.max",
      temporary: "",
      minimum: "damage.min",

      wounds: "wounds",
      maximumWounds: "",
      primary: "health",

      invert: true,
    },

    item: {
      quantity: "amount",
      weight: (item) => (item.system.weight === "" || item.system.weight == null ? null : Number(item.system.weight)),

      equipped: "worn",
      attuned: "",

      uses: "ammo.value",
      maximumUses: "ammo.max",

      values: {
        damageStep: {
          label: "ripper-system-abstraction.item.values.damageStep",
          type: "number",
          applies: (item) => item.type === "weapon",
          path: numberAt("damagestep"),
        },
        damageBonus: {
          label: "ripper-system-abstraction.item.values.damageBonus",
          type: "number",
          applies: (item) => item.type === "weapon",
          path: numberAt("timesForged"),
        },
        armorClass: {
          label: "ripper-system-abstraction.item.values.armorClass",
          type: "number",
          applies: (item) => item.type === "armor" || item.type === "shield",
          path: {
            get: (item) => numberAt(item.type === "shield" ? "physicaldefense" : "Aphysicalarmor").get(item),
            set: (item, value) => ({ [item.type === "shield" ? "system.physicaldefense" : "system.Aphysicalarmor"]: value }),
          },
        },
        armorBonus: {
          label: "ripper-system-abstraction.item.values.armorBonus",
          type: "number",
          applies: (item) => item.type === "armor",
          path: numberAt("timesForgedPhysical"),
        },
        mysticArmor: {
          label: "ripper-system-abstraction.item.values.mysticArmor",
          type: "number",
          applies: (item) => item.type === "armor",
          path: numberAt("Amysticarmor"),
        },
        mysticArmorBonus: {
          label: "ripper-system-abstraction.item.values.mysticArmorBonus",
          type: "number",
          applies: (item) => item.type === "armor",
          path: numberAt("timesForgedMystic"),
        },
        mysticDefense: {
          label: "ripper-system-abstraction.item.values.mysticDefense",
          type: "number",
          applies: (item) => item.type === "shield",
          path: numberAt("mysticdefense"),
        },
        weight: {
          label: "ripper-system-abstraction.item.values.weight",
          type: "number",
          applies: (item) => item.system.weight !== undefined,
          path: numberAt("weight"),
        },
        price: {
          label: "ripper-system-abstraction.item.values.price",
          type: "number",
          applies: (item) => item.system.cost !== undefined,
          path: numberAt("cost"),
        },
      },
    },

    currency: {
      base: "silver",

      actor: {
        denominations: {
          gold: "money.gold",
          silver: "money.silver",
          copper: "money.copper",
        },
      },

      item: {
        single: {
          value: "cost",
          denomination: "",
        },

        denominations: {},
      },

      denominations: {
        gold: { value: rate, label: "earthdawn.c.coinGoldGold" },
        silver: { value: 1, label: "earthdawn.c.coinSilverSilver" },
        copper: { value: 1 / rate, label: "earthdawn.c.coinCopperCopper" },
      },
    },

    experience: {
      current: "legendpointcurrent",
      maximum: "",
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
    resultType: "total",
    buildInputs: () => {
      const choices = {};

      for (const [key, label] of Object.entries(EARTHDAWN_ATTRIBUTES)) {
        choices[key] = game.i18n.localize(label);
      }

      class CheckInput extends EarthdawnCheckInput {
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
        difficulty: EarthdawnDifficultyInput,
        modifier: EarthdawnModifierInput,
      };
    },

    processCheck: async (actor, inputs, options = {}) => {
      if (!options.fastForward) {
        const { rollPrep } = await import(/* webpackIgnore: true */ foundry.utils.getRoute("systems/earthdawn4e/modules/helpers/roll-prep.js"));
        const rolled = await rollPrep(actor, {
          attribute: inputs.check,
          name: game.i18n.localize(EARTHDAWN_ATTRIBUTES[inputs.check]),
          modifier: inputs.modifier ?? 0,
          difficulty: inputs.difficulty ?? 0,
        });
        if (!rolled) {
          return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
        }
        const target = rolled.difficulty > 0 ? Number(rolled.difficulty) : null;
        return {
          canceled: false,
          result: rolled.total,
          target,
          success: target ? rolled.total >= target : null,
          levelOfSuccess: target ? Math.clamp(50 + (rolled.total - target) * 2, 0, 100) : null,
          criticalSuccess: false,
          criticalFailure: false,
        };
      }

      const wounds = actor.woundCalc?.((Number(actor.system.wounds) || 0) + (Number(actor.system.bloodMagicWounds) || 0)) ?? 0;
      const finalstep = Math.max(
        1,
        (actor.system[inputs.check] ?? 0) +
          (inputs.modifier ?? 0) -
          wounds +
          (Number(actor.system.bonuses?.allRollsStepFinal) || 0)
      );

      const dice = actor.getDice(finalstep);
      const roll = await new Roll(dice ? dice.replace(/(d\d+)/g, "$1x") : "0").evaluate();
      const total = Math.max(1, roll.total);

      if (!options.silent) {
        await roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor }),
          flavor: game.i18n.localize(EARTHDAWN_ATTRIBUTES[inputs.check]),
        });
      }

      const margin = inputs.difficulty > 0 ? total - inputs.difficulty : undefined;
      const result = { total, margin };

      const difficulty = inputs.difficulty ?? 0;
      const success = difficulty > 0 ? result.total >= difficulty : null;

      return {
        canceled: false,
        result: result.total,
        target: difficulty > 0 ? difficulty : null,
        success,
        levelOfSuccess: difficulty > 0 ? Math.clamp(50 + (result.margin ?? 0) * 2, 0, 100) : null,
        criticalSuccess: false,
        criticalFailure: false,
      };
    },
    },
  };
};
