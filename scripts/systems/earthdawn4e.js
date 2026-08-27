const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export default async function earthdawn4e() {

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
      level: "",
      role: "",
    },

    health: {
      current: "damage.value",
      maximum: "damage.max",
      temporary: "",
      minimum: "damage.min",

      useWounds: true,
      wounds: "wounds",
      maximumWounds: "",

      invert: true,
    },

    item: {
      quantity: "amount",
      weight: "weight",

      equipped: "worn",
      attuned: "isthread",

      uses: "",
      maximumUses: "",
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
          value: "",
          denomination: "",
        },

        denominations: {},
      },

      denominations: {
        gold: { value: 10 },
        silver: { value: 1 },
        copper: { value: 0.1 },
      },
    },

    experience: {
      current: "legendpointcurrent",
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
        actor.rollPrep({
          attribute: inputs.check,
          name: game.i18n.localize(EARTHDAWN_ATTRIBUTES[inputs.check]),
          modifier: inputs.modifier ?? 0,
          difficulty: inputs.difficulty ?? 0,
        });

        return { canceled: false, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
      }

      const wounds = actor.woundCalc?.(Number(actor.system.wounds) + Number(actor.system.bloodMagicWounds)) ?? 0;
      const finalstep = Math.max(
        1,
        (actor.system[inputs.check] ?? 0) +
          (inputs.modifier ?? 0) -
          wounds +
          (Number(actor.system.bonuses?.allRollsStepFinal) ?? 0)
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
