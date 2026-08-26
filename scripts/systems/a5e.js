const { DataModel, fields } = foundry.abstract;

export const dataPaths = {
  actor: {
    type: "",
    subtype: "details.creatureTypes",
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

    equipped: "equippedState",
    attuned: "attuned",

    uses: "uses.value",
    maximumUses: "uses.max",
  },

  currency: {
    base: "gp",

    actor: {
      denominations: {
        cp: "currency.cp",
        sp: "currency.sp",
        ep: "currency.ep",
        gp: "currency.gp",
        pp: "currency.pp",
      },
    },

    item: {
      single: {
        value: "price.value",
        denomination: "price.denomination",
      },

      denominations: {},
    },

    denominations: {
      cp: { value: 0.01 },
      sp: { value: 0.1 },
      ep: { value: 0.5 },
      gp: { value: 1 },
      pp: { value: 10 },
    },
  },

  experience: {
    current: "details.xp",
    maximum: "",
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

class A5ECheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class A5EDCInput extends DataModel {
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

    for (const [key, value] of Object.entries(CONFIG.A5E.abilities)) {
      choices[`check.${key}`] = game.i18n.localize(value);
      choices[`save.${key}`] = game.i18n.localize(value);
    }

    choices["save.death"] = game.i18n.localize("A5E.deathSavingThrow.title");

    for (const [key, value] of Object.entries(CONFIG.A5E.skills)) {
      choices[`skill.${key}`] = game.i18n.localize(value);
    }

    class CheckInput extends A5ECheckInput {
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
      dc: A5EDCInput,
    };
  },

  processCheck: async (actor, inputs) => {
    const [type, key] = inputs.check.split(".");
    const options = { skipRollDialog: true };

    switch (type) {
      case "skill":
        return actor.rollSkillCheck(key, options);

      case "save":
        if (key === "death") {
          return actor.rollSavingThrow(undefined, {
            ...options,
            saveType: "death",
          });
        }

        return actor.rollSavingThrow(key, options);

      case "check":
        return actor.rollAbilityCheck(key, options);

      default:
        throw new Error(`Unsupported A5E check type: ${type}`);
    }
  },
};
