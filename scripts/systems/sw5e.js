const { DataModel, fields } = foundry.abstract;

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

    for (const [key, value] of Object.entries(CONFIG.SW5E.abilities)) {
      if (actor?.system?.abilities?.[key] === undefined) continue;
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

  processCheck: async (actor, inputs) => {
    const [type, key] = inputs.check.split(".");
    const options = inputs.dc != null ? { targetValue: inputs.dc } : {};

    switch (type) {
      case "skill":
        return actor.rollSkill(key, options);

      case "save":
        if (key === "death") {
          return actor.rollDeathSave(options);
        }

        return actor.rollAbilitySave(key, options);

      case "check":
        return actor.rollAbilityTest(key, options);

      case "tool": {
        const item = actor.items.find(
          (i) =>
            i.type === "tool" &&
            (i.system.toolType === key || i.system.baseItem === key),
        );
        return item ? item.rollToolCheck(options) : null;
      }

      default:
        throw new Error(`Unsupported SW5E check type: ${type}`);
    }
  },
};
