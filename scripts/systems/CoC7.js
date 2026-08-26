const { DataModel, fields } = foundry.abstract;

export const dataPaths = {
  actor: {
    type: "infos.type",
    subtype: "",
    size: "characteristics.siz.value",
    level: "",
    role: "",
  },

  health: {
    current: "attribs.hp.value",
    maximum: "attribs.hp.max",
    temporary: "",
    minimum: "",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "weight",

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
    current: "",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: false,
    supportsWeight: true,
    supportsEquipment: false,
  },
};

class CoC7CheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class CoC7DCInput extends DataModel {
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

    const characterSchema = CONFIG.Actor.dataModels.character?.schema;
    const characteristicFields = Object.values(
      characterSchema?.get("characteristics")?.fields ?? {},
    );
    for (const field of characteristicFields) {
      choices[`characteristic.${field.name}`] = game.i18n.localize(field.hint);
    }

    const attribFields = Object.values(
      characterSchema?.get("attribs")?.fields ?? {},
    );
    for (const field of attribFields) {
      if (!["lck", "san"].includes(field.name)) continue;
      choices[`attribute.${field.name}`] = game.i18n.localize(field.hint);
    }

    for (const item of actor.items.filter((i) => i.type === "skill")) {
      choices[`skill.${item.name}`] = item.name;
    }

    class CheckInput extends CoC7CheckInput {
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
      dc: CoC7DCInput,
    };
  },

  processCheck: async (actor, inputs) => {
    const [type, key] = inputs.check.split(".");
    const difficulty = inputs.dc == null ? 1 : Math.clamp(inputs.dc, 1, 4);

    switch (type) {
      case "characteristic":
        return actor.characteristicCheck(key, true, { difficulty });

      case "attribute":
        return actor.attributeCheck(key, true, { difficulty });

      case "skill":
        return actor.skillCheck(key, true, { difficulty });

      default:
        throw new Error(`Unsupported CoC7 check type: ${type}`);
    }
  },
};
