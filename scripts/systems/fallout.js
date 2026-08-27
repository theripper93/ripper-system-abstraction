const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export default async function fallout() {
  try {
    const pack = game.packs?.get?.("fallout.skills");
    if (pack && !pack.indexed) await pack.getIndex();
  } catch (err) {}


  class FalloutCheckInput extends DataModel {
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
    dataPaths: {
    actor: {
      type: "",
      subtype: "category",
      size: "",
      level: "level.value",
      role: "",
    },

    health: {
      current: "health.value",
      maximum: "health.max",
      temporary: "",
      minimum: "",

      useWounds: false,
      wounds: "",
      maximumWounds: "",
    },

    item: {
      quantity: "quantity",
      weight: "weight",

      equipped: "equipped",
      attuned: "",

      uses: "",
      maximumUses: "",
    },

    currency: {
      base: "caps",

      actor: {
        denominations: {
          caps: "currency.caps",
        },
      },

      item: {
        single: {
          value: "cost",
          denomination: "caps",
        },

        denominations: {},
      },

      denominations: {
        caps: { value: 1 },
      },
    },

    experience: {
      current: "level.currentXP",
      maximum: "level.nextLevelXP",
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
    buildInputs: () => {
      const choices = {};
      const group = {
        attribute: game.i18n.localize("ripper-system-abstraction.tests.Attribute"),
        skill: game.i18n.localize("ripper-system-abstraction.tests.Skill"),
      };

      for (const [key, label] of Object.entries(CONFIG.FALLOUT.ATTRIBUTES)) {
        choices[`attribute.${key}`] = { label: game.i18n.localize(label), group: group.attribute };
      }

      const pack = game.packs.get("fallout.skills");
      if (pack?.indexed) {
        const index = pack.index instanceof Map ? pack.index.values() : pack.index;
        for (const entry of index) {
          if (entry.type === "skill") choices[`skill.${entry.name}`] = { label: entry.name, group: group.skill };
        }
      }

      class CheckInput extends FalloutCheckInput {
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
      };
    },

    processCheck: async (actor, inputs, options = {}) => {
      const [type, key] = inputs.check.split(".");
      const complication = parseInt(actor.system.complication) || 20;
      const rollData = { actor, dicenum: 2, complication, event: options.event };

      if (type === "attribute") {
        rollData.rollname = game.i18n.localize(CONFIG.FALLOUT.ATTRIBUTES[key]);
        rollData.attribute = actor.system.attributes[key]?.value ?? 0;
        rollData.skill = 0;
        rollData.tag = false;
      } else if (type === "skill") {
        const owned = actor.items.find((i) => i.type === "skill" && i.name === key);
        const pack = game.packs.get("fallout.skills");
        const index = pack?.indexed ? (pack.index instanceof Map ? pack.index.values() : pack.index) : [];
        const entry = [...index].find((e) => e.type === "skill" && e.name === key);

        rollData.rollname = owned?.name ?? key;
        rollData.attribute = actor.system.attributes[owned?.system?.defaultAttribute ?? entry?.system?.defaultAttribute ?? "str"]?.value ?? 0;
        rollData.skill = owned?.system?.value ?? 0;
        rollData.tag = owned?.system?.tag ?? false;
      } else {
        throw new Error(`Unsupported Fallout check type: ${type}`);
      }

      const result = await fallout.Roller2D20.rollD20(rollData);

      const successes = result.dicesRolled.reduce((sum, d) => sum + (d.success ?? 0), 0);
      const crits = result.dicesRolled.reduce((sum, d) => sum + (d.success === 2 ? 1 : 0), 0);
      const threshold = (rollData.attribute ?? 0) + (rollData.skill ?? 0);

      return {
        canceled: false,
        result: successes,
        target: threshold,
        success: successes >= 1,
        levelOfSuccess: successes >= 2 ? 100 : successes === 1 ? 50 : 0,
        criticalSuccess: crits > 0,
        criticalFailure: false,
      };
    },
    },
  };
};
