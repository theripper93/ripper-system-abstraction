const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "traits.sizemod",
    level: "",
    role: "",
  },

  health: {
    current: "HP.value",
    maximum: "HP.max",
    temporary: "",
    minimum: "HP.min",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "eqt.count",
    weight: "eqt.weight",

    equipped: "eqt.equipped",
    attuned: "",

    uses: "eqt.uses",
    maximumUses: "eqt.maxuses",
  },

  currency: {
    base: "$",

    actor: {
      denominations: {},
    },

    item: {
      single: {
        value: "eqt.cost",
        denomination: "$",
      },

      denominations: {},
    },

    denominations: {
      "$": { value: 1 },
    },
  },

  experience: {
    current: "totalpoints.unspent",
    maximum: "",
    level: "",
  },

  features: {
    supportsHealth: true,
    supportsTemporaryHealth: false,
    supportsWounds: false,
    supportsCurrency: false,
    supportsWeight: true,
    supportsEquipment: true,
  },
};

const GURPS_ATTRIBUTES = {
  ST: "GURPS.attributesST",
  DX: "GURPS.attributesDX",
  IQ: "GURPS.attributesIQ",
  HT: "GURPS.attributesHT",
  WILL: "GURPS.attributesWILL",
  PER: "GURPS.attributesPER",
};

class GURPSCheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class GURPSModifierInput extends DataModel {
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

    for (const [key, label] of Object.entries(GURPS_ATTRIBUTES)) {
      choices[key] = game.i18n.localize(label);
    }

    const skills = GURPS.flattenContainedList?.(actor.system.skills) ?? [];
    for (const skill of skills) {
      choices[`sk.${skill.name}`] = skill.name;
    }

    class CheckInput extends GURPSCheckInput {
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
      modifier: GURPSModifierInput,
    };
  },

  processCheck: async (actor, inputs) => {
    let modifier = "";
    if (inputs.modifier != null && inputs.modifier !== 0) {
      modifier = inputs.modifier > 0 ? `+${inputs.modifier}` : `${inputs.modifier}`;
    }

    const otf = inputs.check.startsWith("sk.")
      ? `Sk:"${inputs.check.slice(3)}"${modifier}`
      : `${inputs.check}${modifier}`;

    return actor.runOTF(otf);
  },
};
