const { DataModel, fields } = foundry.abstract;

export const dataPaths = {
  actor: {
    type: "creatureClass.value",
    subtype: "",
    size: "status.size.value",
    level: "",
    role: "",
  },

  health: {
    current: "status.wounds.value",
    maximum: "status.wounds.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity.value",
    weight: "weight.value",

    equipped: "worn.value",
    attuned: "",

    uses: "",
    maximumUses: "",
  },

  currency: {
    base: "silbertaler",

    actor: {
      denominations: {},
    },

    item: {
      single: {
        value: "price.value",
        denomination: "silbertaler",
      },

      denominations: {},
    },

    denominations: {
      dukaten: { value: 10 },
      silbertaler: { value: 1 },
      heller: { value: 0.1 },
      kreuzer: { value: 0.01 },
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
    supportsWounds: false,
    supportsCurrency: true,
    supportsWeight: true,
    supportsEquipment: true,
  },
};

class DSA5CheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class DSA5ModifierInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.NumberField({
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

    for (const [key, label] of Object.entries(
      game.dsa5.config.characteristics,
    )) {
      choices[`attribute.${key}`] = game.i18n.localize(label);
    }

    for (const item of actor.items.filter((i) => i.type === "skill")) {
      choices[`skill.${item.name}`] = item.name;
    }

    class CheckInput extends DSA5CheckInput {
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
      modifier: DSA5ModifierInput,
    };
  },

  processCheck: async (actor, inputs) => {
    const options = {};
    if (inputs.modifier != null) options.modifier = inputs.modifier;

    let setupData;
    if (inputs.check.startsWith("skill.")) {
      const name = inputs.check.slice("skill.".length);
      const skill = actor.items.find(
        (i) => i.name === name && i.type === "skill",
      );
      if (!skill) throw new Error(`Unknown DSA5 skill: ${name}`);

      setupData = await actor.setupSkill(skill, options);
    } else {
      const key = Object.keys(game.dsa5.config.characteristics).find((k) => {
        const label = game.i18n.localize(game.dsa5.config.characteristics[k]);
        return k === inputs.check || label === inputs.check;
      });
      if (!key) {
        throw new Error(`Unknown DSA5 characteristic: ${inputs.check}`);
      }

      setupData = await actor.setupCharacteristic(key, options);
    }

    return setupData ? actor.basicTest(setupData) : null;
  },
};
