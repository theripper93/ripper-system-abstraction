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

export const testsInterface = {
  buildInputs: (actor) => {
    const choices = {};

    for (const [key] of Object.entries(actor.system.stats ?? {})) {
      choices[`stat.${key}`] = game.i18n.localize(
        `CYBERPUNK.${key.capitalize()}Full`,
      );
    }

    for (const item of actor.items.filter((i) => i.type === "skill")) {
      choices[`skill.${item.id}`] = item.name;
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

  processCheck: async (actor, inputs) => {
    const [type, key] = inputs.check.split(":");

    switch (type) {
      case "stat":
        return actor.rollStat(key);

      case "skill": {
        const item = actor.items.get(key);
        if (!item || item.type !== "skill") {
          throw new Error(`Unknown Cyberpunk 2020 skill: ${key}`);
        }

        return actor.rollSkill(item.id, inputs.modifier ?? 0);
      }

      default:
        throw new Error(`Unsupported Cyberpunk 2020 check type: ${type}`);
    }
  },
};
