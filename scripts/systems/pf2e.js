const { DataModel, fields } = foundry.abstract;

export const dataPaths = {
  actor: {
    type: "traits.value",
    subtype: "",
    size: "traits.size.value",
    level: "details.level.value",
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
    weight: "bulk.value",

    equipped: "equipped.carryType",
    attuned: "equipped.invested",

    uses: "uses.value",
    maximumUses: "uses.max",
  },

  currency: {
    base: "cp",

    actor: {
      denominations: {},
    },

    item: {
      single: {
        value: "",
        denomination: "",
      },

      denominations: {
        cp: "price.value.cp",
        sp: "price.value.sp",
        gp: "price.value.gp",
        pp: "price.value.pp",
      },
    },

    denominations: {
      cp: { value: 1 },
      sp: { value: 10 },
      gp: { value: 100 },
      pp: { value: 1000 },
    },
  },

  experience: {
    current: "details.xp.value",
    maximum: "details.xp.max",
    level: "details.level.value",
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

class PF2ECheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class PF2EDCInput extends DataModel {
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
  buildInputs: () => {
    const choices = {};

    for (const [slug, value] of Object.entries(CONFIG.PF2E.skills)) {
      choices[`skill.${slug}`] = game.i18n.localize(value.label);
    }

    for (const save of ["fortitude", "reflex", "will"]) {
      choices[`save.${save}`] = game.i18n.localize(
        `PF2E.Saves${save.capitalize()}`,
      );
    }

    choices["perception"] = game.i18n.localize("PF2E.PerceptionCheck");

    class CheckInput extends PF2ECheckInput {
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
      dc: PF2EDCInput,
    };
  },

  processCheck: async (actor, inputs) => {
    const [type, key] = inputs.check.split(".");
    const options = inputs.dc != null ? { dc: inputs.dc } : {};

    switch (type) {
      case "skill":
      case "save":
        return actor.getStatistic(key)?.roll(options) ?? null;

      case "perception":
        return actor.perception?.roll(options) ?? null;

      default:
        throw new Error(`Unsupported PF2E check type: ${type}`);
    }
  },
};
