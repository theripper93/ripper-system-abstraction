const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export default async function cyberpunk2020() {
  for (const packId of ["cyberpunk2020.default-skills-en", "cyberpunk2020.role-skills-en", "cyberpunk2020.default-skills-ru", "cyberpunk2020.role-skills-ru"]) {
    try {
      const pack = game.packs?.get?.(packId);
      if (pack && !pack.indexed) await pack.getIndex();
    } catch (err) {}
  }


  class Cyberpunk2020CheckInput extends DataModel {
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

  class Cyberpunk2020ModifierInput extends DataModel {
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

  class Cyberpunk2020DifficultyInput extends DataModel {
    static defineSchema() {
      return {
        value: new fields.StringField({
          label: "ripper-system-abstraction.tests.Difficulty",
          required: true,
          initial: "easy",
          choices: {
            easy: game.i18n.localize("ripper-system-abstraction.tests.DCClassEasy"),
            average: game.i18n.localize("ripper-system-abstraction.tests.DCClassAverage"),
            difficult: game.i18n.localize("ripper-system-abstraction.tests.DCClassDifficult"),
            verydifficult: game.i18n.localize("ripper-system-abstraction.tests.DCClassVeryDifficult"),
            nearlyimpossible: game.i18n.localize("ripper-system-abstraction.tests.DCClassNearlyImpossible"),
          },
        }),
      };
    }
  }

  const CYBERPUNK_STATS = ["int", "ref", "tech", "cool", "attr", "luck", "ma", "bt", "emp"];

  const DIFFICULTY_CLASSES = {
    easy: 10,
    average: 15,
    difficult: 20,
    verydifficult: 25,
    nearlyimpossible: 30,
  };

  function difficultyResult(roll, difficulty) {
    const target = DIFFICULTY_CLASSES[difficulty] ?? null;
    const margin = target != null ? roll.total - target : null;
    const success = target != null ? roll.total >= target : null;
    const levelOfSuccess =
      success === true
        ? margin >= 21 ? 100
        : margin >= 16 ? 90
        : margin >= 11 ? 80
        : margin >= 6 ? 65
        : 50
        : success === false ? 0
        : null;
    return { target, success, levelOfSuccess };
  }

  return {
    dataPaths: {
    actor: {
      type: "",
      subtype: "",
      size: "",
      level: "",
      role: "role.value",
    },

    health: {
      current: "",
      maximum: "",
      temporary: "",
      minimum: "",

      useWounds: true,
      wounds: "damage",
      maximumWounds: "",
    },

    item: {
      quantity: "",
      weight: "weight",

      equipped: "equipped",
      attuned: "",

      uses: "shotsLeft",
      maximumUses: "shots",
    },

    currency: {
      base: "eurobucks",

      actor: {
        denominations: {
          eurobucks: "eurobucks",
        },
      },

      item: {
        single: {
          value: "cost",
          denomination: "eurobucks",
        },

        denominations: {},
      },

      denominations: {
        eurobucks: { value: 1 },
      },
    },

    experience: {
      current: "ip",
      maximum: "",
      level: "",
    },

    features: {
      supportsHealth: false,
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
      const group = {
        stat: game.i18n.localize("ripper-system-abstraction.tests.Stat"),
        skill: game.i18n.localize("ripper-system-abstraction.tests.Skill"),
      };

      for (const key of CYBERPUNK_STATS) {
        choices[`stat.${key}`] = { label: game.i18n.localize(`CYBERPUNK.${key.capitalize()}Full`), group: group.stat };
      }

      for (const packId of ["cyberpunk2020.default-skills-en", "cyberpunk2020.role-skills-en", "cyberpunk2020.default-skills-ru", "cyberpunk2020.role-skills-ru"]) {
        const pack = game.packs.get(packId);
        if (!pack?.indexed) continue;
        const index = pack.index instanceof Map ? pack.index.values() : pack.index;
        for (const entry of index) {
          if (entry.type === "skill") choices[`skill.${entry.name}`] = { label: entry.name, group: group.skill };
        }
      }

      class CheckInput extends Cyberpunk2020CheckInput {
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
        modifier: Cyberpunk2020ModifierInput,
        difficulty: Cyberpunk2020DifficultyInput,
      };
    },

    processCheck: async (actor, inputs, options = {}) => {
      const [type, key] = inputs.check.split(":");

      if (type === "stat") {
        const roll = await new Promise((resolve) => {
          const hook = (message) => {
            Hooks.off("createChatMessage", hook);
            resolve(message.rolls?.[0] ?? null);
          };
          Hooks.once("createChatMessage", hook);
          actor.rollStat(key);
          setTimeout(() => {
            Hooks.off("createChatMessage", hook);
            resolve(null);
          }, 1000);
        });

        if (!roll) {
          return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
        }

        const { target, success, levelOfSuccess } = difficultyResult(roll, inputs.difficulty);
        return {
          canceled: false,
          result: roll.total,
          target,
          success,
          levelOfSuccess,
          criticalSuccess: roll.isCrit === true,
          criticalFailure: roll.isFumble === true,
        };
      }

      if (type === "skill") {
        const item = actor.items.find((i) => i.type === "skill" && i.name === key);
        if (!item) {
          return { canceled: false, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
        }

        const roll = await new Promise((resolve) => {
          const hook = (message) => {
            Hooks.off("createChatMessage", hook);
            resolve(message.rolls?.[0] ?? null);
          };
          Hooks.once("createChatMessage", hook);
          actor.rollSkill(item.id, inputs.modifier ?? 0);
          setTimeout(() => {
            Hooks.off("createChatMessage", hook);
            resolve(null);
          }, 1000);
        });

        if (!roll) {
          return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
        }

        const { target, success, levelOfSuccess } = difficultyResult(roll, inputs.difficulty);
        return {
          canceled: false,
          result: roll.total,
          target,
          success,
          levelOfSuccess,
          criticalSuccess: roll.isCrit === true,
          criticalFailure: roll.isFumble === true,
        };
      }

      throw new Error(`Unsupported Cyberpunk 2020 check type: ${type}`);
    },
    },
  };
};
