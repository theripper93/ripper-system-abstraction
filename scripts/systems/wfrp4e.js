const { DataModel, fields } = foundry.abstract;

export const dataPaths = {
  actor: {
    type: "",
    subtype: "details.species.subspecies",
    size: "details.size.value",
    level: "",
    role: "",
  },

  health: {
    current: "status.wounds.value",
    maximum: "status.wounds.max",
    temporary: "",
    minimum: "",

    useWounds: true,
    wounds: "status.criticalWounds.value",
    maximumWounds: "status.criticalWounds.max",
  },

  item: {
    quantity: "quantity.value",
    weight: "encumbrance.value",

    equipped: "equipped.value",
    attuned: "",

    uses: "loaded.amt",
    maximumUses: "loaded.max",
  },

  currency: {
    base: "bp",

    actor: {
      denominations: {},
    },

    item: {
      single: {
        value: "coinValue.value",
        denomination: "bp",
      },

      denominations: {
        gc: "price.gc",
        ss: "price.ss",
        bp: "price.bp",
      },
    },

    denominations: {
      bp: { value: 1 },
      ss: { value: 12 },
      gc: { value: 240 },
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
    supportsWounds: true,
    supportsCurrency: true,
    supportsWeight: true,
    supportsEquipment: true,
  },
};

class WFRP4eCheckInput extends DataModel {
  static defineSchema() {
    return {
      value: new fields.StringField({
        required: true,
        choices,
      }),
    };
  }
}

class WFRP4eDCInput extends DataModel {
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
      game.wfrp4e.config.characteristics,
    )) {
      choices[`characteristic.${key}`] = game.i18n.localize(label);
    }

    for (const item of actor.itemTags?.skill ?? []) {
      choices[`skill.${item.name}`] = item.name;
    }

    class CheckInput extends WFRP4eCheckInput {
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
      dc: WFRP4eDCInput,
    };
  },

  processCheck: async (actor, inputs) => {
    const [type, key] = inputs.check.split(".");
    const fields = { difficulty: inputs.dc ?? "challenging" };
    const context = { skipDialog: true, skipTargets: true, fields };

    let test;
    if (type === "characteristic") {
      test = await actor.setupCharacteristic(key, {
        ...context,
        hitloc: false,
      });
    } else if (type === "skill") {
      const skill =
        actor.itemTags?.skill?.find((s) => s.name === key) ?? key;
      test = await actor.setupSkill(skill, context);
    } else {
      throw new Error(`Unsupported WFRP4e check type: ${type}`);
    }

    return test.roll();
  },
};
