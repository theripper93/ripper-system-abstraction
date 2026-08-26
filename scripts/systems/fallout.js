const { DataModel, fields } = foundry.abstract;

export const dataPaths = {
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
};

class FalloutCheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

export const testsInterface = {
  buildInputs: (actor) => {
    const choices = {};

    for (const [key, label] of Object.entries(CONFIG.FALLOUT.ATTRIBUTES)) {
      choices[`attribute.${key}`] = game.i18n.localize(label);
    }

    for (const item of actor.items.filter((i) => i.type === "skill")) {
      choices[`skill.${item.name}`] = item.name;
    }

    class CheckInput extends FalloutCheckInput {
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
    };
  },

  processCheck: async (actor, inputs) => {
    const [type, key] = inputs.check.split(".");
    const complication = parseInt(actor.system.complication) || 20;

    if (type === "attribute") {
      return fallout.Roller2D20.rollD20({
        actor,
        rollname: game.i18n.localize(CONFIG.FALLOUT.ATTRIBUTES[key]),
        dicenum: 2,
        attribute: actor.system.attributes[key]?.value ?? 0,
        skill: 0,
        tag: false,
        complication,
      });
    }

    if (type === "skill") {
      const skill = actor.items.find(
        (i) => i.type === "skill" && i.name === key,
      );
      if (!skill) throw new Error(`Unknown Fallout skill: ${key}`);

      return fallout.Roller2D20.rollD20({
        actor,
        rollname: skill.name,
        dicenum: 2,
        attribute:
          actor.system.attributes[skill.system.defaultAttribute]?.value ?? 0,
        skill: skill.system.value ?? 0,
        tag: skill.system.tag ?? false,
        complication,
      });
    }

    throw new Error(`Unsupported Fallout check type: ${type}`);
  },
};
