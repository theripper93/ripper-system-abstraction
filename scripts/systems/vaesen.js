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

  const VAESEN_ATTRIBUTES = ["magic", "physique", "precision", "logic", "empathy"];

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

      useWounds: false,
      wounds: "",
      maximumWounds: "",
    },

    item: {
      quantity: "",
      weight: "",

      equipped: "",
      attuned: "",

      uses: "",
      maximumUses: "",
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

    features: {
      supportsHealth: false,
      supportsTemporaryHealth: false,
      supportsWounds: false,
      supportsCurrency: false,
      supportsWeight: false,
      supportsEquipment: false,
    },
    },
    testsInterface: {
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
        choices[`attribute.${key}`] = { label: game.i18n.localize(`ATTRIBUTE.${key.toUpperCase()}_ROLL`), group: group.attribute };
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

      const [type, key] = inputs.check.split(".");
      let pool = 0;
      let name = key;

      if (type === "skill") {
        const skill = actor.system.skill[key];
        if (!skill) throw new Error(`Unknown Vaesen skill: ${key}`);
        const attribute = actor.system.attribute[skill.attribute];
        pool = (skill.value ?? 0) + (attribute?.value ?? 0);
        name = game.i18n.localize(skill.label ?? key);
      } else if (type === "attribute") {
        pool = actor.system.attribute[key]?.value ?? 0;
        name = game.i18n.localize(`ATTRIBUTE.${key.toUpperCase()}_ROLL`);
      } else {
        throw new Error(`Unsupported Vaesen check type: ${type}`);
      }

      const roll = await YearZeroRoll.forge(
        { term: "s", number: Math.max(1, pool) },
        { yzGame: "vae" },
        { name, event: options.event },
      ).evaluate();
      await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }) });

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
