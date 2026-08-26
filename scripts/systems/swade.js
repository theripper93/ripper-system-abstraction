const { DataModel, fields } = foundry.abstract;

export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "stats.size",
    level: "",
    role: "",
  },

  health: {
    current: "",
    maximum: "",
    temporary: "",
    minimum: "",

    useWounds: true,
    wounds: "wounds.value",
    maximumWounds: "wounds.max",
  },

  item: {
    quantity: "quantity",
    weight: "weight",

    equipped: "equipStatus",
    attuned: "",

    uses: "",
    maximumUses: "",
  },

  currency: {
    base: "$",

    actor: {
      denominations: {
        "$": "details.currency",
      },
    },

    item: {
      single: {
        value: "price",
        denomination: "$",
      },

      denominations: {},
    },

    denominations: {
      "$": { value: 1 },
    },
  },

  experience: {
    current: "advances.value",
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

class SwadeCheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class SwadeModifierInput extends DataModel {
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

    for (const [key, value] of Object.entries(CONFIG.SWADE.attributes)) {
      choices[key] = game.i18n.localize(value.long);
    }

    for (const item of actor.items.filter((i) => i.type === "skill")) {
      choices[item.id] = item.name;
      if (item.system.swid) choices[item.system.swid] = item.name;
    }

    class CheckInput extends SwadeCheckInput {
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
      modifier: SwadeModifierInput,
    };
  },

  processCheck: async (actor, inputs) => {
    const options = {};
    if (inputs.modifier != null) {
      options.additionalMods = [
        {
          label: game.i18n.localize("SWADE.Modifier"),
          value: inputs.modifier,
        },
      ];
    }

    if (inputs.check in CONFIG.SWADE.attributes) {
      return actor.rollAttribute(inputs.check, options);
    }

    const item =
      actor.items.get(inputs.check) ??
      actor.getSingleItemBySwid?.(inputs.check, "skill") ??
      actor.items.find(
        (i) => i.type === "skill" && i.name === inputs.check,
      );

    return item ? item.roll(options) : actor.rollSkill(inputs.check, options);
  },
};
