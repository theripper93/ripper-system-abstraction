const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export const dataPaths = {
  actor: {
    type: "",
    subtype: "details.species.subspecies",
    size: "details.size.value",
    level: "",
    role: "",
  },

  health: {
    current: "status.wounds.value",
    maximum: "status.wounds.max",
    temporary: "",
    minimum: "",

    useWounds: true,
    wounds: "status.criticalWounds.value",
    maximumWounds: "status.criticalWounds.max",
  },

  item: {
    quantity: "quantity.value",
    weight: "encumbrance.value",

    equipped: "equipped.value",
    attuned: "",

    uses: "loaded.amt",
    maximumUses: "loaded.max",
  },

  currency: {
    base: "bp",

    actor: {
      denominations: {},
    },

    item: {
      single: {
        value: "coinValue.value",
        denomination: "bp",
      },

      denominations: {
        gc: "price.gc",
        ss: "price.ss",
        bp: "price.bp",
      },
    },

    denominations: {
      bp: { value: 1 },
      ss: { value: 12 },
      gc: { value: 240 },
    },
  },

  experience: {
    current: "details.experience.current",
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

class WFRP4eCheckInput extends DataModel {
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

class WFRP4eDCInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({
        label: "Difficulty",
        required: false,
        nullable: true,
        integer: true,
      }),
    };
  }
}

function normalizeTest(test) {
  if (!test?.result) {
    return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
  }

  const result = test.result;
  const success = result.outcome === "success";
  const sl = Number(result.SL) || 0;

  return {
    canceled: false,
    result: result.roll,
    target: result.target,
    success,
    levelOfSuccess: Math.clamp(50 + sl * 10, 0, 100),
    criticalSuccess: test.isCriticalFumble === "critical",
    criticalFailure: test.isCriticalFumble === "fumble",
  };
}

export const testsInterface = {
  buildInputs: () => {
    const choices = {};

    for (const [key, label] of Object.entries(game.wfrp4e.config.characteristics)) {
      choices[`characteristic.${key}`] = game.i18n.localize(label);
    }

    for (const packId of ["wfrp4e-core.items", "wfrp4e.basic"]) {
      const pack = game.packs.get(packId);
      if (!pack?.indexed) continue;
      const index = pack.index instanceof Map ? pack.index.values() : pack.index;
      for (const entry of index) {
        if (entry.type === "skill") choices[`skill.${entry.name}`] = entry.name;
      }
    }

    class CheckInput extends WFRP4eCheckInput {
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
      dc: WFRP4eDCInput,
    };
  },

  processCheck: async (actor, inputs, options = {}) => {
    const [type, key] = inputs.check.split(".");
    const context = {
      skipDialog: options.fastForward ?? false,
      skipTargets: true,
      event: options.event,
      fields: {
        difficulty: inputs.dc ?? "challenging",
        modifier: 0,
        successBonus: 0,
        slBonus: 0,
      },
    };

    let test;
    if (type === "characteristic") {
      test = await actor.setupCharacteristic(key, { ...context, hitloc: false }, { resolveClose: true });
    } else if (type === "skill") {
      const skill = actor.itemTags?.skill?.find((s) => s.name === key) ?? key;
      test = await actor.setupSkill(skill, context, { resolveClose: true });
    } else {
      throw new Error(`Unsupported WFRP4e check type: ${type}`);
    }

    if (!test) {
      return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
    }

    await test.roll();
    return normalizeTest(test);
  },
};
