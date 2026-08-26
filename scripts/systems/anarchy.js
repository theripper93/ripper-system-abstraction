const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "",
    level: "",
    role: "",
  },

  health: {
    current: "monitors.physical.value",
    maximum: "monitors.physical.max",
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
    current: "counters.karma.value",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: false,
    supportsWeight: false,
    supportsEquipment: false,
  },
};

class AnarchyCheckInput extends DataModel {
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

    for (const key of Object.keys(actor.system.attributes ?? {})) {
      choices[`attribute.${key}`] = game.i18n.localize(key);
    }

    for (const item of actor.items.filter((i) => i.type === "skill")) {
      choices[`skill.${item.name}`] = item.name;
    }

    class CheckInput extends AnarchyCheckInput {
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
    };
  },

  processCheck: async (actor, inputs) => {
    const [type, key] = inputs.check.split(":");

    switch (type) {
      case "attribute":
        return actor.rollAttribute(key);

      case "skill": {
        const item = actor.items.find(
          (i) =>
            i.type === "skill" &&
            (i.system.code === key || i.name === key),
        );
        if (!item) throw new Error(`Unknown Anarchy skill: ${key}`);

        return actor.rollSkill(item);
      }

      default:
        throw new Error(`Unsupported Anarchy check type: ${type}`);
    }
  },
};
