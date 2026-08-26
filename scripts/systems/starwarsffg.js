const { DataModel, fields } = foundry.abstract;

export const dataPaths = {
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

    useWounds: true,
    wounds: "stats.wounds.value",
    maximumWounds: "stats.wounds.max",
  },

  item: {
    quantity: "quantity.value",
    weight: "encumbrance.value",

    equipped: "equippable.equipped",
    attuned: "",

    uses: "",
    maximumUses: "",
  },

  currency: {
    base: "credits",

    actor: {
      denominations: {
        credits: "stats.credits.value",
      },
    },

    item: {
      single: {
        value: "price.value",
        denomination: "credits",
      },

      denominations: {},
    },

    denominations: {
      credits: { value: 1 },
    },
  },

  experience: {
    current: "experience.available",
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
};

class StarWarsFFGCheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class StarWarsFFGDifficultyInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({
        required: false,
        nullable: true,
        integer: true,
        min: 0,
      }),
    };
  }
}

export const testsInterface = {
  buildInputs: (actor) => {
    const choices = {};

    for (const [key, characteristic] of Object.entries(
      actor.system.characteristics ?? {},
    )) {
      choices[`characteristic.${key}`] = characteristic.label ?? key;
    }

    for (const [key, skill] of Object.entries(actor.system.skills ?? {})) {
      choices[`skill.${key}`] = skill.label ?? key;
    }

    class CheckInput extends StarWarsFFGCheckInput {
      static defineSchema() {
        return {
          value: new fields.StringField({
            required: true,
            choices,
          }),
        };
      }
    }

    return {
      check: CheckInput,
      difficulty: StarWarsFFGDifficultyInput,
    };
  },

  processCheck: async (actor, inputs) => {
    const [type, key] = inputs.check.split(".");
    const difficulty = inputs.difficulty ?? 2;

    let sheet = {};
    try {
      sheet = actor.sheet ? await actor.sheet.getData() : {};
    } catch (err) {
      sheet = {};
    }

    if (type === "characteristic") {
      const characteristic = actor.system.characteristics[key];
      if (!characteristic) {
        throw new Error(`Unknown Star Wars FFG characteristic: ${key}`);
      }

      const skill = {
        rank: 0,
        boost: 0,
        setback: 0,
        force: 0,
        advantage: 0,
        dark: 0,
        light: 0,
        failure: 0,
        threat: 0,
        success: 0,
        triumph: 0,
        despair: 0,
        remsetback: 0,
        upgrades: 0,
        label: characteristic.label,
      };

      return game.ffg.DiceHelpers.rollSkillDirect(
        skill,
        characteristic,
        difficulty,
        sheet,
      );
    }

    if (type === "skill") {
      const skill = actor.system.skills[key];
      if (!skill) throw new Error(`Unknown Star Wars FFG skill: ${key}`);

      const characteristic = actor.system.characteristics[skill.characteristic];
      if (!characteristic) {
        throw new Error(
          `Unknown Star Wars FFG characteristic: ${skill.characteristic}`,
        );
      }

      return game.ffg.DiceHelpers.rollSkillDirect(
        skill,
        characteristic,
        difficulty,
        sheet,
      );
    }

    throw new Error(`Unsupported Star Wars FFG check type: ${type}`);
  },
};
