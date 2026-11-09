const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export default async function vaesen() {

  class VaesenCheckInput extends DataModel {
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

  const VAESEN_ATTRIBUTES = ["physique", "precision", "logic", "empathy", "might", "bodyControl", "magic", "manipulation"];
  // Item fields come from template.json and the sheets save them from text inputs, so they may be numbers or strings
  const numberAt = (path) => ({
    get: (item) => {
      const value = foundry.utils.getProperty(item.system, path);
      return value === "" || value == null || !Number.isFinite(Number(value)) ? null : Number(value);
    },
    set: (item, value) => ({ [`system.${path}`]: value }),
  });

  const PHYSICAL_STEPS = ["states.exhausted.isChecked", "states.battered.isChecked", "states.wounded.isChecked", "isBroken"];
  const physicalSteps = (actor) => PHYSICAL_STEPS.map((step) => !!foundry.utils.getProperty(actor.system.condition.physical, step));

  function setPhysicalWounds(actor, value) {
    if (!actor.system.condition?.physical?.states) return {};
    const checked = physicalSteps(actor);
    let change = Math.clamp(value, 0, PHYSICAL_STEPS.length) - checked.filter(Boolean).length;
    for (const index of PHYSICAL_STEPS.keys()) {
      if (change <= 0 || checked[index]) continue;
      checked[index] = true;
      change--;
    }
    for (const index of [...PHYSICAL_STEPS.keys()].reverse()) {
      if (change >= 0 || !checked[index]) continue;
      checked[index] = false;
      change++;
    }
    return Object.fromEntries(PHYSICAL_STEPS.map((step, index) => [`system.condition.physical.${step}`, checked[index]]));
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
      current: "",
      maximum: "",
      temporary: "",
      minimum: "",

      wounds: "",
      maximumWounds: "",
    },

    item: {
      quantity: {
        get: (item) => (item.type === "gear" ? numberAt("quantity").get(item) ?? 1 : null),
        set: (item, value) => ({ "system.quantity": value }),
      },
      weight: "",

      equipped: "",
      attuned: "",

      uses: "",
      maximumUses: "",

      values: {
        attackBonus: {
          label: "ripper-system-abstraction.item.values.attackBonus",
          type: "number",
          applies: (item) => item.type === "weapon",
          path: numberAt("bonus"),
        },
        damage: {
          label: "ripper-system-abstraction.item.values.damage",
          type: "number",
          applies: (item) => item.type === "weapon",
          path: numberAt("damage"),
        },
        armorClass: {
          label: "ripper-system-abstraction.item.values.armorClass",
          type: "number",
          applies: (item) => item.type === "armor",
          path: numberAt("protection"),
        },
        skillBonus: {
          label: "ripper-system-abstraction.item.values.skillBonus",
          type: "number",
          applies: (item) => item.type === "gear",
          path: numberAt("bonus"),
        },
      },
    },

    currency: {
      base: "",

      actor: {
        denominations: {},
      },

      item: {
        single: {
          value: "",
          denomination: "",
        },

        denominations: {},
      },

      denominations: {},
    },

    experience: {
      current: "experience",
      maximum: "",
      level: "",
    },

    overrides: {
      Actor: {
        npc: {
          health: { current: "condition.physical.value", maximum: "condition.physical.max" },
        },
        player: {
          health: {
            wounds: {
              get: (actor) => (actor.system.condition?.physical?.states ? physicalSteps(actor).filter(Boolean).length : null),
              set: (actor, value) => setPhysicalWounds(actor, value),
            },
            maximumWounds: (actor) => (actor.system.condition?.physical?.states ? PHYSICAL_STEPS.length : null),
            primary: "wounds",
          },
        },
      },
    },

    features: {
      supportsHealth: true,
      supportsTemporaryHealth: false,
      supportsWounds: true,
      supportsCurrency: false,
      supportsWeight: false,
      supportsEquipment: false,
    },
    },
    testsInterface: {
    resultType: "successes",
    buildInputs: () => {
      const choices = {};
      const group = {
        skill: game.i18n.localize("ripper-system-abstraction.tests.Skill"),
        attribute: game.i18n.localize("ripper-system-abstraction.tests.Attribute"),
      };

      for (const key of Object.keys(CONFIG.vaesen?.skills ?? {})) {
        choices[`skill.${key}`] = { label: game.i18n.localize(CONFIG.vaesen.skills[key]), group: group.skill };
      }

      for (const key of VAESEN_ATTRIBUTES) {
        choices[`attribute.${key}`] = { label: game.i18n.localize(`ATTRIBUTE.${key.replace(/([A-Z])/g, "_$1").toUpperCase()}_ROLL`), group: group.attribute };
      }

      class CheckInput extends VaesenCheckInput {
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
      const YearZeroRoll = CONFIG.Dice.rolls.find((roll) => roll.name === "YearZeroRoll");
      if (!YearZeroRoll) {
        return { canceled: false, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
      }

      if (!actor.system.attribute) throw new Error(`Vaesen actors of type "${actor.type}" cannot perform checks.`);
      const [type, key] = inputs.check.split(".");
      if (!(type === "skill" ? actor.system.skill?.[key] : actor.system.attribute[key])) {
        throw new Error(`This Vaesen actor cannot perform "${inputs.check}" checks.`);
      }
      let pool = 0;
      let name = key;

      if (type === "skill") {
        const skill = actor.system.skill[key];
        const attribute = actor.system.attribute[skill.attribute];
        pool = (skill.value ?? 0) + (attribute?.value ?? 0);
        name = game.i18n.localize(skill.label ?? key);
      } else if (type === "attribute") {
        pool = actor.system.attribute[key]?.value ?? 0;
        name = game.i18n.localize(`ATTRIBUTE.${key.replace(/([A-Z])/g, "_$1").toUpperCase()}_ROLL`);
      } else {
        throw new Error(`Unsupported Vaesen check type: ${type}`);
      }

      const roll = await YearZeroRoll.forge(
        { term: "s", number: Math.max(1, pool) },
        { yzGame: "vae" },
        { name, event: options.event },
      ).evaluate();
      if (!options.silent) await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }) });

      const successCount = roll.successCount ?? 0;
      const diceCount = Math.max(1, pool);

      return {
        canceled: false,
        result: successCount,
        target: null,
        success: successCount > 0,
        levelOfSuccess: Math.round((successCount / diceCount) * 100),
        criticalSuccess: false,
        criticalFailure: false,
      };
    },
    },
  };
};
