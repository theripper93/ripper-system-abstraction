const { DataModel } = foundry.abstract;
const fields = foundry.data.fields;

export const dataPaths = {
  actor: {
    type: "",
    subtype: "",
    size: "attributes.size",
    level: "",
    role: "",
  },

  health: {
    current: "attributes.hp.value",
    maximum: "attributes.hp.max",
    temporary: "attributes.hp.temp.hp.value",
    minimum: "attributes.hp.min",

    useWounds: false,
    wounds: "",
    maximumWounds: "",
  },

  item: {
    quantity: "quantity",
    weight: "weight",

    equipped: "location.state",
    attuned: "",

    uses: "charges.value",
    maximumUses: "charges.max",
  },

  currency: {
    base: "gp",

    actor: {
      denominations: {
        pp: "currency.pp",
        ep: "currency.ep",
        gp: "currency.gp",
        sp: "currency.sp",
        cp: "currency.cp",
      },
    },

    item: {
      single: {
        value: "cost.value",
        denomination: "cost.currency",
      },

      denominations: {},
    },

    denominations: {
      cp: { value: 0.005 },
      sp: { value: 0.05 },
      ep: { value: 0.5 },
      gp: { value: 1 },
      pp: { value: 5 },
    },
  },

  experience: {
    current: "details.xp",
    maximum: "",
    level: "",
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

class ARSCheckInput extends DataModel {
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

    for (const [key, label] of Object.entries(CONFIG.ARS.abilityTypes)) {
      if (key === "none") continue;
      choices[`ability.${key}`] = game.i18n.localize(label);
    }

    for (const [key, label] of Object.entries(CONFIG.ARS.saveTypes)) {
      if (key === "none") continue;
      choices[`save.${key}`] = game.i18n.localize(label);
    }

    for (const item of actor.items.filter((i) => i.type === "skill")) {
      choices[`skill.${item.name}`] = item.name;
    }

    class CheckInput extends ARSCheckInput {
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
    const [type, key] = inputs.check.split(".");

    switch (type) {
      case "ability":
        return new game.ars.ARSDice(actor).makeAbilityCheckRollAsync(key, "d20");

      case "save":
        return new game.ars.ARSDice(actor).makeSaveRollAsync(key);

      case "skill": {
        const skill = actor.items.find(
          (i) => i.type === "skill" && (i.id === key || i.name === key),
        );
        if (!skill) throw new Error(`Unknown ARS skill: ${key}`);

        return new game.ars.ARSDice(actor, skill).makeSkillRoll(true);
      }

      default:
        throw new Error(`Unsupported ARS check type: ${type}`);
    }
  },
};
