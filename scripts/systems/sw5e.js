const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export const dataPaths = {
  actor: {
    type: "details.type.value",
    subtype: "details.type.subtype",
    size: "traits.size",
    level: "details.level",
    role: "",
  },

  health: {
    current: "attributes.hp.value",
    maximum: "attributes.hp.max",
    temporary: "attributes.hp.temp",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "weight",

    equipped: "equipped",
    attuned: "attunement",

    uses: "uses.value",
    maximumUses: "uses.max",
  },

  currency: {
    base: "gc",

    actor: {
      denominations: {
        gc: "currency.gc",
      },
    },

    item: {
      single: {
        value: "price",
        denomination: "gc",
      },

      denominations: {},
    },

    denominations: {
      gc: { value: 1 },
    },
  },

  experience: {
    current: "details.xp.value",
    maximum: "details.xp.max",
    level: "details.level",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: true,
    supportsWounds: false,
    supportsCurrency: true,
    supportsWeight: true,
    supportsEquipment: true,
  },
};

class SW5ECheckInput extends DataModel {
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

class SW5EDCInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({
        label: "DC",
        required: false,
        nullable: true,
        integer: true,
        min: 0,
      }),
    };
  }
}

function normalizeRoll(roll, dc) {
  if (!roll) {
    return { canceled: true, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
  }

  const target = Number.isNumeric(roll.options?.targetValue) ? roll.options.targetValue : Number.isNumeric(dc) ? dc : null;
  const criticalSuccess = roll.isCritical === true;
  const criticalFailure = roll.isFumble === true;
  const success = target != null ? roll.total >= target : null;

  return {
    canceled: false,
    result: roll.total,
    target,
    success,
    levelOfSuccess: success == null ? null : success ? 100 : 0,
    criticalSuccess,
    criticalFailure,
  };
}

export const testsInterface = {
  buildInputs: () => {
    const choices = {};

    for (const [key, value] of Object.entries(CONFIG.SW5E.abilities)) {
      choices[`check.${key}`] = value;
      choices[`save.${key}`] = value;
    }

    choices["save.death"] = game.i18n.localize("SW5E.DeathSave");

    for (const [key, value] of Object.entries(CONFIG.SW5E.skills)) {
      choices[`skill.${key}`] = value.label;
    }

    for (const [key, value] of Object.entries(CONFIG.SW5E.toolProficiencies)) {
      choices[`tool.${key}`] = value;
    }

    class CheckInput extends SW5ECheckInput {
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
      dc: SW5EDCInput,
    };
  },

  processCheck: async (actor, inputs, options = {}) => {
    const [type, key] = inputs.check.split(".");
    const rollOptions = {
      fastForward: options.fastForward ?? false,
      event: options.event,
    };
    if (inputs.dc != null) rollOptions.targetValue = inputs.dc;

    switch (type) {
      case "skill":
        return normalizeRoll(await actor.rollSkill(key, rollOptions), inputs.dc);

      case "save":
        if (key === "death") {
          return normalizeRoll(await actor.rollDeathSave(rollOptions), 10);
        }

        return normalizeRoll(await actor.rollAbilitySave(key, rollOptions), inputs.dc);

      case "check":
        return normalizeRoll(await actor.rollAbilityTest(key, rollOptions), inputs.dc);

      case "tool": {
        const item = actor.items.find(
          (i) => i.type === "tool" && (i.system.toolType === key || i.system.baseItem === key),
        );
        if (!item) {
          return { canceled: false, result: null, target: null, success: null, levelOfSuccess: null, criticalSuccess: false, criticalFailure: false };
        }

        return normalizeRoll(await item.rollToolCheck(rollOptions), inputs.dc);
      }

      default:
        throw new Error(`Unsupported SW5E check type: ${type}`);
    }
  },
};
