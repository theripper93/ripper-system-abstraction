const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export const dataPaths = {
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
};

class Cyberpunk2020CheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        label: "Check",
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
        label: "Modifier",
        required: false,
        nullable: true,
        integer: true,
      }),
    };
  }
}

const CYBERPUNK_STATS = ["int", "ref", "tech", "cool", "attr", "luck", "ma", "bt", "emp"];

export const testsInterface = {
  buildInputs: () => {
    const choices = {};

    for (const key of CYBERPUNK_STATS) {
      choices[`stat.${key}`] = game.i18n.localize(`CYBERPUNK.${key.capitalize()}Full`);
    }

    for (const packId of ["cyberpunk2020.default-skills-en", "cyberpunk2020.role-skills-en", "cyberpunk2020.default-skills-ru", "cyberpunk2020.role-skills-ru"]) {
      const pack = game.packs.get(packId);
      if (!pack?.indexed) continue;
      const index = pack.index instanceof Map ? pack.index.values() : pack.index;
      for (const entry of index) {
        if (entry.type === "skill") choices[`skill.${entry.name}`] = entry.name;
      }
    }

    class CheckInput extends Cyberpunk2020CheckInput {
      static defineSchema() {
        return {
          value: new fields.StringField({
            label: "Check",
            required: true,
            choices,
          }),
        };
      }
    }

    return {
      check: CheckInput,
      modifier: Cyberpunk2020ModifierInput,
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

      return {
        canceled: false,
        result: roll.total,
        target: null,
        success: null,
        levelOfSuccess: null,
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

      return {
        canceled: false,
        result: roll.total,
        target: null,
        success: null,
        levelOfSuccess: null,
        criticalSuccess: roll.isCrit === true,
        criticalFailure: roll.isFumble === true,
      };
    }

    throw new Error(`Unsupported Cyberpunk 2020 check type: ${type}`);
  },
};
